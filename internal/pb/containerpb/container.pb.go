package containerpb

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

type Service struct {
	Name       string `json:"name"`
	Image      string `json:"image"`
	URL        string `json:"url"`
	Ready      bool   `json:"ready"`
	Reason     string `json:"reason,omitempty"`
	CreatedAt  string `json:"createdAt,omitempty"`
	UpdatedAt  string `json:"updatedAt,omitempty"`
	Namespace  string `json:"namespace"`
	ProjectID  string `json:"projectId,omitempty"`
	Generation int64  `json:"generation,omitempty"`
}

type ListServicesRequest struct {
	UserID    string `json:"userId"`
	ProjectID string `json:"projectId"`
}

type ListServicesResponse struct {
	UserID    string    `json:"userId"`
	ProjectID string    `json:"projectId"`
	Namespace string    `json:"namespace"`
	Containers []Service `json:"containers"`
}

type DeployServiceRequest struct {
	UserID    string `json:"userId"`
	ProjectID string `json:"projectId"`
	Name      string `json:"name"`
	Image     string `json:"image"`
	Port      int32  `json:"port"`
	MinScale  int32  `json:"minScale"`
	MaxScale  int32  `json:"maxScale"`
}

type DeleteServiceRequest struct {
	UserID    string `json:"userId"`
	ProjectID string `json:"projectId"`
	Name      string `json:"name"`
}

type ContainerServiceServer interface {
	Health(context.Context, *HealthRequest) (*HealthResponse, error)
	ListServices(context.Context, *ListServicesRequest) (*ListServicesResponse, error)
	DeployService(context.Context, *DeployServiceRequest) (*Service, error)
	DeleteService(context.Context, *DeleteServiceRequest) (*Empty, error)
}

type UnimplementedContainerServiceServer struct{}

func (UnimplementedContainerServiceServer) Health(context.Context, *HealthRequest) (*HealthResponse, error) {
	return nil, status.Error(codes.Unimplemented, "method Health not implemented")
}

func (UnimplementedContainerServiceServer) ListServices(context.Context, *ListServicesRequest) (*ListServicesResponse, error) {
	return nil, status.Error(codes.Unimplemented, "method ListServices not implemented")
}

func (UnimplementedContainerServiceServer) DeployService(context.Context, *DeployServiceRequest) (*Service, error) {
	return nil, status.Error(codes.Unimplemented, "method DeployService not implemented")
}

func (UnimplementedContainerServiceServer) DeleteService(context.Context, *DeleteServiceRequest) (*Empty, error) {
	return nil, status.Error(codes.Unimplemented, "method DeleteService not implemented")
}

func RegisterContainerServiceServer(s *grpc.Server, srv ContainerServiceServer) {
	s.RegisterService(&Container_ServiceDesc, srv)
}

var Container_ServiceDesc = grpc.ServiceDesc{
	ServiceName: "dcloud.container.v1.ContainerService",
	HandlerType: (*ContainerServiceServer)(nil),
	Methods: []grpc.MethodDesc{
		{MethodName: "Health", Handler: _Container_Health_Handler},
		{MethodName: "ListServices", Handler: _Container_ListServices_Handler},
		{MethodName: "DeployService", Handler: _Container_DeployService_Handler},
		{MethodName: "DeleteService", Handler: _Container_DeleteService_Handler},
	},
	Streams:  []grpc.StreamDesc{},
	Metadata: "container.proto",
}

func _Container_Health_Handler(srv any, ctx context.Context, dec func(any) error, interceptor grpc.UnaryServerInterceptor) (any, error) {
	in := new(HealthRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(ContainerServiceServer).Health(ctx, in)
	}
	info := &grpc.UnaryServerInfo{Server: srv, FullMethod: "/dcloud.container.v1.ContainerService/Health"}
	handler := func(ctx context.Context, req any) (any, error) {
		return srv.(ContainerServiceServer).Health(ctx, req.(*HealthRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _Container_ListServices_Handler(srv any, ctx context.Context, dec func(any) error, interceptor grpc.UnaryServerInterceptor) (any, error) {
	in := new(ListServicesRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(ContainerServiceServer).ListServices(ctx, in)
	}
	info := &grpc.UnaryServerInfo{Server: srv, FullMethod: "/dcloud.container.v1.ContainerService/ListServices"}
	handler := func(ctx context.Context, req any) (any, error) {
		return srv.(ContainerServiceServer).ListServices(ctx, req.(*ListServicesRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _Container_DeployService_Handler(srv any, ctx context.Context, dec func(any) error, interceptor grpc.UnaryServerInterceptor) (any, error) {
	in := new(DeployServiceRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(ContainerServiceServer).DeployService(ctx, in)
	}
	info := &grpc.UnaryServerInfo{Server: srv, FullMethod: "/dcloud.container.v1.ContainerService/DeployService"}
	handler := func(ctx context.Context, req any) (any, error) {
		return srv.(ContainerServiceServer).DeployService(ctx, req.(*DeployServiceRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _Container_DeleteService_Handler(srv any, ctx context.Context, dec func(any) error, interceptor grpc.UnaryServerInterceptor) (any, error) {
	in := new(DeleteServiceRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(ContainerServiceServer).DeleteService(ctx, in)
	}
	info := &grpc.UnaryServerInfo{Server: srv, FullMethod: "/dcloud.container.v1.ContainerService/DeleteService"}
	handler := func(ctx context.Context, req any) (any, error) {
		return srv.(ContainerServiceServer).DeleteService(ctx, req.(*DeleteServiceRequest))
	}
	return interceptor(ctx, in, info, handler)
}
