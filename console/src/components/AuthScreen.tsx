import { Alert, Box, Button, Card, CardContent, Container, Typography } from "@mui/material";
import CloudQueueOutlinedIcon from "@mui/icons-material/CloudQueueOutlined";

type AuthScreenProps = {
  error: string;
  onLogin: () => void;
  onRegister: () => void;
};

export function AuthScreen({ error, onLogin, onRegister }: AuthScreenProps) {
  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Container maxWidth="sm" sx={{ minHeight: "100vh", display: "grid", placeItems: "center", py: 4 }}>
        <Card variant="outlined" sx={{ width: "100%", overflow: "hidden", boxShadow: "0 18px 36px rgba(15, 23, 42, 0.10)" }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Box sx={{ display: "grid", gap: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                <CloudQueueOutlinedIcon sx={{ fontSize: 28, color: "primary.main" }} />
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>
                  DCloud Console
                </Typography>
              </Box>

              <Box sx={{ display: "grid", gap: 0.75 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.15 }}>
                  ログイン
                </Typography>
                <Typography color="text.secondary">
                  プロジェクトとサービスを管理します。
                </Typography>
              </Box>

              <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1.5 }}>
                <Button variant="contained" size="large" onClick={onLogin} fullWidth>
                  ログイン
                </Button>
                <Button variant="outlined" size="large" onClick={onRegister} fullWidth>
                  ユーザー登録
                </Button>
              </Box>

              {error ? <Alert severity="error">{error}</Alert> : null}
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
