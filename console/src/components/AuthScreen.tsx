import { Alert, Box, Button, Card, CardContent, Container, Divider, Tab, Tabs, TextField, Typography } from "@mui/material";
import { useState, type FormEvent } from "react";
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
  const [mode, setMode] = useState<"login" | "register">("login");

  function handleRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onRegister();
  }

  return (
    <Box className="auth-page" sx={{ minHeight: "100vh" }}>
      <Container maxWidth="lg" className="auth-shell">
        <Box sx={{ width: "100%", display: "grid", gap: 2.25 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em" }}>
            DCloud Console
          </Typography>

          <Card variant="outlined" className="auth-card auth-hero-card" sx={{ width: "100%", overflow: "hidden" }}>
            <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
              <Box sx={{ display: "grid", gap: 2.5 }}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs value={mode} onChange={(_, value: "login" | "register") => setMode(value)} variant="fullWidth">
                    <Tab value="login" label="ログイン" />
                    <Tab value="register" label="アカウント作成" />
                  </Tabs>
                </Box>

                <Box
                  component="form"
                  onSubmit={mode === "login" ? onLogin : handleRegisterSubmit}
                  sx={{ display: "grid", gap: 1.5 }}
                >
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

                  {mode === "register" ? (
                    <>
                      <Divider sx={{ my: 0.5 }} />
                      <Box sx={{ display: "grid", gap: 0.6 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          アカウント作成の追加情報
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          作成時だけ入力してください。ログイン時は不要です。
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
                    </>
                  ) : null}

                  <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1.5, pt: 0.5 }}>
                    {mode === "login" ? (
                      <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
                        ログイン
                      </Button>
                    ) : (
                      <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
                        アカウント作成
                      </Button>
                    )}
                  </Box>
                </Box>

                {error ? <Alert severity="error">{error}</Alert> : null}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}
