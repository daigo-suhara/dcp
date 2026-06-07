import { Alert, Box, Button, Card, CardContent, Container, Tab, Tabs, TextField, Typography } from "@mui/material";
import CloudQueueOutlinedIcon from "@mui/icons-material/CloudQueueOutlined";
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
      <Container maxWidth="sm" className="auth-shell">
        <Box sx={{ width: "100%", maxWidth: 460, display: "grid", gap: 1.75 }}>
          <Card variant="outlined" className="auth-card" sx={{ width: "100%", overflow: "hidden" }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3.25 } }}>
              <Box sx={{ display: "grid", gap: 2.25 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                  <CloudQueueOutlinedIcon sx={{ fontSize: 30, color: "primary.main", flex: "0 0 auto" }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", textAlign: "center" }}>
                    DCloud
                  </Typography>
                </Box>

                <Box sx={{ borderBottom: 1, borderColor: "divider", mx: -0.75 }}>
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
                    label="メールアドレス"
                    type="email"
                    value={form.email}
                    onChange={(event) => onChange({ email: event.target.value })}
                    autoComplete="email"
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
