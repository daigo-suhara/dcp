GO_BUILD_CACHE ?= $(CURDIR)/.cache/go-build
GO_MOD_CACHE ?= $(CURDIR)/.cache/go-mod

.PHONY: test build-project build-container build sqlc

test:
	mkdir -p $(GO_BUILD_CACHE) $(GO_MOD_CACHE)
	GOCACHE=$(GO_BUILD_CACHE) GOMODCACHE=$(GO_MOD_CACHE) go test ./...

sqlc:
	cd internal/db/sqlc && sqlc generate

build-project:
	mkdir -p $(GO_BUILD_CACHE) $(GO_MOD_CACHE) bin
	GOCACHE=$(GO_BUILD_CACHE) GOMODCACHE=$(GO_MOD_CACHE) go build -o bin/project ./internal/project/cmd/server

build-container:
	mkdir -p $(GO_BUILD_CACHE) $(GO_MOD_CACHE) bin
	GOCACHE=$(GO_BUILD_CACHE) GOMODCACHE=$(GO_MOD_CACHE) go build -o bin/container ./internal/container/cmd/server

build: build-project build-container
