import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Alert, Box, Button, Card, CardContent, TextField, Typography } from "@mui/material";
import type { FormEvent } from "react";
import type { DeployForm } from "../types";

type DeploySectionProps = {
  error: string;
  form: DeployForm;
  onBack: () => void;
  onChange: (patch: Partial<DeployForm>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitting: boolean;
};

export function DeploySection({ error, form, onBack, onChange, onSubmit, submitting }: DeploySectionProps) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2, maxWidth: 980 }}>
      <CardContent sx={{ p: 3, display: "grid", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
          <Box>
            <Typography variant="overline" color="primary">
              サービスの作成
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
              コンテナを作成
            </Typography>
          </Box>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack}>
            一覧に戻る
          </Button>
        </Box>

        <Box component="form" onSubmit={onSubmit} sx={{ display: "grid", gap: 2 }}>
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" } }}>
            <Box sx={{ gridColumn: { xs: "auto", md: "span 2" } }}>
              <TextField
                label="サービス名"
                value={form.name}
                onChange={(event) => onChange({ name: event.target.value })}
                placeholder="service-name"
                fullWidth
              />
            </Box>
            <Box>
              <TextField
                label="コンテナイメージのURL"
                value={form.image}
                onChange={(event) => onChange({ image: event.target.value })}
                placeholder="ghcr.io/org/app:tag"
                fullWidth
              />
            </Box>
            <TextField
              label="Port"
              type="number"
              slotProps={{ htmlInput: { min: 1, max: 65535 } }}
              value={form.port}
              onChange={(event) => onChange({ port: event.target.value })}
              placeholder="8080"
              fullWidth
            />
            <TextField
              label="最小スケール数"
              type="number"
              slotProps={{ htmlInput: { min: 0, max: 20 } }}
              value={form.minScale}
              onChange={(event) => onChange({ minScale: event.target.value })}
              placeholder="0"
              fullWidth
            />
            <TextField
              label="最大スケール数"
              type="number"
              slotProps={{ htmlInput: { min: 1, max: 20 } }}
              value={form.maxScale}
              onChange={(event) => onChange({ maxScale: event.target.value })}
              placeholder="1"
              fullWidth
            />
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? "作成中..." : "作成"}
            </Button>
          </Box>
        </Box>

        {error ? <Alert severity="error">{error}</Alert> : null}
      </CardContent>
    </Card>
  );
}
