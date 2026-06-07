FROM golang:1.25-alpine AS build

WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY internal ./internal
RUN go build -trimpath -ldflags="-s -w" -o /out/compute ./internal/compute/cmd/server

FROM alpine:3.20

RUN apk add --no-cache ca-certificates && update-ca-certificates

COPY --from=build /out/compute /usr/local/bin/compute

ENTRYPOINT ["/usr/local/bin/compute"]
