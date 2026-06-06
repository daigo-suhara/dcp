package projectpb

import (
	"context"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type Empty struct{}

type HealthRequest struct{}

type HealthResponse struct {
	Status    string `json:"status"`
	Service   string `json:"service"`
	Timestamp string `json:"timestamp"`
}

type PlatformRequest struct{}

type PlatformResponse struct {
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Components  []string `json:"components"`
}

type Project struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Owner     string `json:"owner"`
	CreatedAt string `json:"createdAt"`
}

type ListProjectsRequest struct {
	UserID string `json:"userId"`
}

type ListProjectsResponse struct {
	UserID   string    `json:"userId"`
	Projects []Project `json:"projects"`
}

type CreateProjectRequest struct {
	UserID string `json:"userId"`
	Name   string `json:"name"`
}

type DeleteProjectRequest struct {
	UserID    string `json:"userId"`
	ProjectID string `json:"projectId"`
}

type ProjectServiceServer interface {
	Health(context.Context, *HealthRequest) (*HealthResponse, error)
	Platform(context.Context, *PlatformRequest) (*PlatformResponse, error)
	ListProjects(context.Context, *ListProjectsRequest) (*ListProjectsResponse, error)
	CreateProject(context.Context, *CreateProjectRequest) (*Project, error)
	DeleteProject(context.Context, *DeleteProjectRequest) (*Empty, error)
}

type UnimplementedProjectServiceServer struct{}

func (UnimplementedProjectServiceServer) Health(context.Context, *HealthRequest) (*HealthResponse, error) {
	return nil, status.Error(codes.Unimplemented, "method Health not implemented")
}

func (UnimplementedProjectServiceServer) Platform(context.Context, *PlatformRequest) (*PlatformResponse, error) {
	return nil, status.Error(codes.Unimplemented, "method Platform not implemented")
}

func (UnimplementedProjectServiceServer) ListProjects(context.Context, *ListProjectsRequest) (*ListProjectsResponse, error) {
	return nil, status.Error(codes.Unimplemented, "method ListProjects not implemented")
}

func (UnimplementedProjectServiceServer) CreateProject(context.Context, *CreateProjectRequest) (*Project, error) {
	return nil, status.Error(codes.Unimplemented, "method CreateProject not implemented")
}

func (UnimplementedProjectServiceServer) DeleteProject(context.Context, *DeleteProjectRequest) (*Empty, error) {
	return nil, status.Error(codes.Unimplemented, "method DeleteProject not implemented")
}

func RegisterProjectServiceServer(s *grpc.Server, srv ProjectServiceServer) {
	s.RegisterService(&Project_ServiceDesc, srv)
}

var Project_ServiceDesc = grpc.ServiceDesc{
	ServiceName: "dcloud.project.v1.ProjectService",
	HandlerType: (*ProjectServiceServer)(nil),
	Methods: []grpc.MethodDesc{
		{MethodName: "Health", Handler: _Project_Health_Handler},
		{MethodName: "Platform", Handler: _Project_Platform_Handler},
		{MethodName: "ListProjects", Handler: _Project_ListProjects_Handler},
		{MethodName: "CreateProject", Handler: _Project_CreateProject_Handler},
		{MethodName: "DeleteProject", Handler: _Project_DeleteProject_Handler},
	},
	Streams:  []grpc.StreamDesc{},
	Metadata: "project.proto",
}

func _Project_Health_Handler(srv any, ctx context.Context, dec func(any) error, interceptor grpc.UnaryServerInterceptor) (any, error) {
	in := new(HealthRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(ProjectServiceServer).Health(ctx, in)
	}
	info := &grpc.UnaryServerInfo{Server: srv, FullMethod: "/dcloud.project.v1.ProjectService/Health"}
	handler := func(ctx context.Context, req any) (any, error) {
		return srv.(ProjectServiceServer).Health(ctx, req.(*HealthRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _Project_Platform_Handler(srv any, ctx context.Context, dec func(any) error, interceptor grpc.UnaryServerInterceptor) (any, error) {
	in := new(PlatformRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(ProjectServiceServer).Platform(ctx, in)
	}
	info := &grpc.UnaryServerInfo{Server: srv, FullMethod: "/dcloud.project.v1.ProjectService/Platform"}
	handler := func(ctx context.Context, req any) (any, error) {
		return srv.(ProjectServiceServer).Platform(ctx, req.(*PlatformRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _Project_ListProjects_Handler(srv any, ctx context.Context, dec func(any) error, interceptor grpc.UnaryServerInterceptor) (any, error) {
	in := new(ListProjectsRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(ProjectServiceServer).ListProjects(ctx, in)
	}
	info := &grpc.UnaryServerInfo{Server: srv, FullMethod: "/dcloud.project.v1.ProjectService/ListProjects"}
	handler := func(ctx context.Context, req any) (any, error) {
		return srv.(ProjectServiceServer).ListProjects(ctx, req.(*ListProjectsRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _Project_CreateProject_Handler(srv any, ctx context.Context, dec func(any) error, interceptor grpc.UnaryServerInterceptor) (any, error) {
	in := new(CreateProjectRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(ProjectServiceServer).CreateProject(ctx, in)
	}
	info := &grpc.UnaryServerInfo{Server: srv, FullMethod: "/dcloud.project.v1.ProjectService/CreateProject"}
	handler := func(ctx context.Context, req any) (any, error) {
		return srv.(ProjectServiceServer).CreateProject(ctx, req.(*CreateProjectRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _Project_DeleteProject_Handler(srv any, ctx context.Context, dec func(any) error, interceptor grpc.UnaryServerInterceptor) (any, error) {
	in := new(DeleteProjectRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(ProjectServiceServer).DeleteProject(ctx, in)
	}
	info := &grpc.UnaryServerInfo{Server: srv, FullMethod: "/dcloud.project.v1.ProjectService/DeleteProject"}
	handler := func(ctx context.Context, req any) (any, error) {
		return srv.(ProjectServiceServer).DeleteProject(ctx, req.(*DeleteProjectRequest))
	}
	return interceptor(ctx, in, info, handler)
}
