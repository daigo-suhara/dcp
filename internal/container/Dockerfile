FROM golang:1.22-alpine AS build

WORKDIR /src
COPY go.mod ./
COPY go.sum ./
COPY internal ./internal
RUN go build -trimpath -ldflags="-s -w" -o /out/container ./internal/container/cmd/server

FROM alpine:3.20

RUN adduser -D -H -u 10001 dcp
USER dcp
COPY --from=build /out/container /usr/local/bin/container
EXPOSE 8082
ENTRYPOINT ["/usr/local/bin/container"]
