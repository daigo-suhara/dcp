import { Alert, Box, Button, Card, CardContent, Container, Divider, Stack, TextField, Typography } from "@mui/material";
import CloudQueueOutlinedIcon from "@mui/icons-material/CloudQueueOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import type { FormEvent } from "react";
import type { AuthForm } from "../types";

type AuthScreenProps = {
  error: string;
  loading: boolean;
  form: AuthForm;
  onChange: (patch: Partial<AuthForm>) => void;
  onLogin: (event: FormEvent<HTMLFormElement>) => void;
  onRegister: () => void;
};

export function AuthScreen({ error, loading, form, onChange, onLogin, onRegister }: AuthScreenProps) {
  return (
    <Box className="auth-page" sx={{ minHeight: "100vh" }}>
      <Container maxWidth="lg" className="auth-shell">
        <Card variant="outlined" className="auth-card auth-hero-card" sx={{ width: "100%", overflow: "hidden" }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "0.95fr 1.05fr" },
              minHeight: { md: 640 }
            }}
          >
            <Box
              sx={{
                p: { xs: 3, sm: 4, md: 5 },
                background: "linear-gradient(160deg, #0f172a 0%, #1d4ed8 72%, #2563eb 100%)",
                color: "#ffffff",
                display: "grid",
                alignContent: "space-between",
                gap: 4
              }}
            >
              <Box sx={{ display: "grid", gap: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                  <CloudQueueOutlinedIcon sx={{ fontSize: 30, color: "#ffffff" }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1, letterSpacing: "0.02em" }}>
                    DCloud Console
                  </Typography>
                </Box>

                <Box sx={{ display: "grid", gap: 0.9 }}>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        minHeight: 30,
                        px: 1.5,
                        borderRadius: 999,
                        border: "1px solid rgba(255,255,255,0.24)",
                        background: "rgba(255,255,255,0.12)",
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase"
                      }}
                    >
                      identity
                    </Box>
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        minHeight: 30,
                        px: 1.5,
                        borderRadius: 999,
                        border: "1px solid rgba(255,255,255,0.24)",
                        background: "rgba(255,255,255,0.12)",
                        fontSize: 12,
                        fontWeight: 700
                      }}
                    >
                      local account
                    </Box>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.03em" }}>
                    DCloud にサインイン
                  </Typography>
                  <Typography sx={{ maxWidth: 440, color: "rgba(255,255,255,0.78)", fontSize: 15, lineHeight: 1.8 }}>
                    ローカルの identity サービスで認証します。ここからプロジェクト、コンテナ、リポジトリ接続を管理できます。
                  </Typography>
                </Box>

                <Stack spacing={1.2}>
                  {[
                    "ユーザ単位でプロジェクトを分けて管理",
                    "パスワードは identity で検証",
                    "登録後すぐ console に入れる"
                  ].map((text) => (
                    <Box key={text} sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                      <Box
                        sx={{
                          width: 9,
                          height: 9,
                          borderRadius: 999,
                          background: "#ffffff",
                          boxShadow: "0 0 0 5px rgba(255,255,255,0.14)"
                        }}
                      />
                      <Typography sx={{ color: "rgba(255,255,255,0.86)", fontSize: 14 }}>{text}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>

              <Typography sx={{ color: "rgba(255,255,255,0.62)", fontSize: 12, lineHeight: 1.7 }}>
                DCloud Console は auth provider を外部に委ねず、identity を直接使う構成です。
              </Typography>
            </Box>

            <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
              <Box sx={{ display: "grid", gap: 2.5 }}>
                <Box sx={{ display: "grid", gap: 0.9 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <KeyOutlinedIcon sx={{ fontSize: 22, color: "primary.main" }} />
                    <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.15 }}>
                      ログイン
                    </Typography>
                  </Box>
                  <Typography color="text.secondary">
                    既存アカウントでログインするか、新規アカウントを作成してください。
                  </Typography>
                </Box>

                <Box component="form" onSubmit={onLogin} sx={{ display: "grid", gap: 1.5 }}>
                  <TextField
                    label="ユーザ名"
                    value={form.username}
                    onChange={(event) => onChange({ username: event.target.value })}
                    autoComplete="username"
                    fullWidth
                  />
                  <TextField
                    label="パスワード"
                    type="password"
                    value={form.password}
                    onChange={(event) => onChange({ password: event.target.value })}
                    autoComplete="current-password"
                    fullWidth
                  />

                  <Divider sx={{ my: 0.5 }} />

                  <Box sx={{ display: "grid", gap: 0.6 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      新規登録用の追加情報
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      アカウント作成時だけ入力してください。ログインだけなら空欄のままで構いません。
                    </Typography>
                  </Box>

                  <TextField
                    label="メールアドレス"
                    type="email"
                    value={form.email}
                    onChange={(event) => onChange({ email: event.target.value })}
                    autoComplete="email"
                    fullWidth
                  />
                  <TextField
                    label="表示名"
                    value={form.name}
                    onChange={(event) => onChange({ name: event.target.value })}
                    autoComplete="name"
                    fullWidth
                  />

                  <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1.5, pt: 0.5 }}>
                    <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
                      ログイン
                    </Button>
                    <Button type="button" variant="outlined" size="large" onClick={onRegister} disabled={loading} fullWidth>
                      アカウント作成
                    </Button>
                  </Box>
                </Box>

                {error ? <Alert severity="error">{error}</Alert> : null}
              </Box>
            </CardContent>
          </Box>
        </Card>
      </Container>
    </Box>
  );
}
