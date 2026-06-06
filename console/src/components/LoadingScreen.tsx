import { Box, Card, CardContent, CircularProgress, Container, Typography } from "@mui/material";

export function LoadingScreen() {
  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Container maxWidth="sm" sx={{ minHeight: "100vh", display: "grid", placeItems: "center", py: 4 }}>
        <Card variant="outlined" sx={{ width: "100%", borderRadius: 4, boxShadow: "0 24px 48px rgba(15, 23, 42, 0.12)" }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 2 }}>
              <CircularProgress />
              <Box>
                <Typography variant="overline" color="primary">
                  DCloud Console
                </Typography>
                <Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>
                  認証状態を確認しています
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  ログイン情報を確認して、管理画面を表示します。
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
