package main

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/daigo-suhara/dcp/internal/db"
	dbsqlc "github.com/daigo-suhara/dcp/internal/db/sqlc"
	projectpb "github.com/daigo-suhara/dcp/internal/pb/projectpb"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/encoding"
	"google.golang.org/grpc/status"
)

type jsonCodec struct{}

func (jsonCodec) Name() string                       { return "json" }
func (jsonCodec) Marshal(v any) ([]byte, error)      { return json.Marshal(v) }
func (jsonCodec) Unmarshal(data []byte, v any) error { return json.Unmarshal(data, v) }

func init() { encoding.RegisterCodec(jsonCodec{}) }

type Empty = projectpb.Empty
type HealthRequest = projectpb.HealthRequest
type HealthResponse = projectpb.HealthResponse
type PlatformRequest = projectpb.PlatformRequest
type PlatformResponse = projectpb.PlatformResponse
type Project = projectpb.Project
type ListProjectsRequest = projectpb.ListProjectsRequest
type ListProjectsResponse = projectpb.ListProjectsResponse
type CreateProjectRequest = projectpb.CreateProjectRequest
type DeleteProjectRequest = projectpb.DeleteProjectRequest
type ProjectServer = projectpb.ProjectServiceServer

type projectServer struct {
	db *sql.DB
	q  *dbsqlc.Queries
}

func newProjectServer() (*projectServer, error) {
	database, err := db.Open()
	if err != nil {
		return nil, err
	}
	return &projectServer{db: database, q: dbsqlc.New(database)}, nil
}

func (s *projectServer) Close() error {
	if s.db != nil {
		return s.db.Close()
	}
	return nil
}

func (s *projectServer) Health(context.Context, *HealthRequest) (*HealthResponse, error) {
	return &HealthResponse{Status: "ok", Service: "project", Timestamp: time.Now().UTC().Format(time.RFC3339Nano)}, nil
}

func (s *projectServer) Platform(context.Context, *PlatformRequest) (*PlatformResponse, error) {
	return &PlatformResponse{Name: "dcloud", Description: "Project service", Components: []string{"project", "database"}}, nil
}

func (s *projectServer) ListProjects(ctx context.Context, req *ListProjectsRequest) (*ListProjectsResponse, error) {
	userID := strings.TrimSpace(req.UserID)
	if userID == "" {
		return nil, status.Error(codes.InvalidArgument, "userId is required")
	}
	records, err := s.q.ListProjects(ctx, userID)
	if err != nil {
		return nil, status.Error(codes.Internal, "failed to query projects")
	}
	items := make([]Project, 0, len(records))
	for _, record := range records {
		items = append(items, Project{
			ID:        record.ID,
			Name:      record.Name,
			Owner:     record.UserID,
			CreatedAt: record.CreatedAt,
		})
	}
	return &ListProjectsResponse{UserID: userID, Projects: items}, nil
}

func (s *projectServer) CreateProject(ctx context.Context, req *CreateProjectRequest) (*Project, error) {
	userID := strings.TrimSpace(req.UserID)
	name := strings.TrimSpace(req.Name)
	if userID == "" || name == "" {
		return nil, status.Error(codes.InvalidArgument, "userId and name are required")
	}
	project := Project{
		ID:        fmt.Sprintf("%s-%s", sanitizeDNSLabel(name), shortID()),
		Name:      name,
		Owner:     userID,
		CreatedAt: time.Now().UTC().Format(time.RFC3339Nano),
	}
	_, err := s.q.CreateProject(ctx, dbsqlc.CreateProjectParams{
		ID:        project.ID,
		UserID:    userID,
		Name:      name,
		CreatedAt: project.CreatedAt,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, status.Error(codes.AlreadyExists, "project already exists")
		}
		return nil, status.Error(codes.Internal, "failed to persist project")
	}
	return &project, nil
}

func (s *projectServer) DeleteProject(ctx context.Context, req *DeleteProjectRequest) (*Empty, error) {
	userID := strings.TrimSpace(req.UserID)
	projectID := strings.TrimSpace(req.ProjectID)
	if userID == "" || projectID == "" {
		return nil, status.Error(codes.InvalidArgument, "userId and projectId are required")
	}
	rowsAffected, err := s.q.DeleteProject(ctx, dbsqlc.DeleteProjectParams{UserID: userID, ID: projectID})
	if err != nil {
		return nil, status.Error(codes.Internal, "failed to delete project")
	}
	if rowsAffected == 0 {
		return nil, status.Error(codes.NotFound, "project not found")
	}
	return &Empty{}, nil
}

func RegisterProjectServer(server *grpc.Server, impl ProjectServer) {
	projectpb.RegisterProjectServiceServer(server, impl)
}

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	addr := env("DCP_PROJECT_ADDR", ":8081")
	lis, err := net.Listen("tcp", addr)
	if err != nil {
		logger.Error("failed to listen", "addr", addr, "error", err)
		os.Exit(1)
	}
	server, err := newProjectServer()
	if err != nil {
		logger.Error("failed to open database", "error", err)
		os.Exit(1)
	}
	defer server.Close()

	grpcServer := grpc.NewServer(grpc.ForceServerCodec(jsonCodec{}))
	RegisterProjectServer(grpcServer, server)
	errc := make(chan error, 1)
	go func() {
		logger.Info("project grpc listening", "addr", addr)
		errc <- grpcServer.Serve(lis)
	}()
	sigc := make(chan os.Signal, 1)
	signal.Notify(sigc, syscall.SIGINT, syscall.SIGTERM)
	select {
	case <-sigc:
		grpcServer.GracefulStop()
	case err := <-errc:
		if err != nil && !errors.Is(err, grpc.ErrServerStopped) {
			logger.Error("server failed", "error", err)
			os.Exit(1)
		}
	}
}

func env(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func sanitizeDNSLabel(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	var b strings.Builder
	lastHyphen := false
	for _, r := range value {
		switch {
		case r >= 'a' && r <= 'z', r >= '0' && r <= '9':
			b.WriteRune(r)
			lastHyphen = false
		default:
			if b.Len() > 0 && !lastHyphen {
				b.WriteByte('-')
				lastHyphen = true
			}
		}
	}
	return strings.Trim(b.String(), "-")
}

func shortID() string {
	var buf [4]byte
	if _, err := rand.Read(buf[:]); err != nil {
		return "00000000"
	}
	return hex.EncodeToString(buf[:])
}
