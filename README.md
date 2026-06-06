# dcloud

## 構成

```text
dcloud/
├── protos/
│   ├── project.proto
│   └── container.proto
├── console/
├── api/
├── internal/
│   ├── pb/
│   ├── project/
│   └── container/
└── charts/
```

## 役割

- `protos/`: 全サービス共通の gRPC API 定義
- `console`: React + Vite の UI
- `api/`: FastAPI の HTTP エントリポイント
- `internal/pb/`: proto 由来の Go 型定義と service descriptor
- `internal/project`: project / platform 系の gRPC サービス
- `internal/container`: container / service 系の gRPC サービス
- component の粒度は [`docs/components.md`](/Users/daigo-suhara/src/dcp/docs/components.md) を参照してください。

## 状態

このリポジトリは構成を新しいレイアウトへ移行中です。
`internal/project` と `internal/container` は PostgreSQL を共有しながら `internal/pb` の共通型を使う形に寄せています。
`api` も同じ PostgreSQL へ接続して、プロジェクトとコンテナの状態を一元管理しています。
SQL 由来の Go コードは [`internal/db/sqlc/`](/Users/daigo-suhara/src/dcp/internal/db/sqlc/) にあり、`make sqlc` で再生成できます。
