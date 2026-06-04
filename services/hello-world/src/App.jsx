import {
  Alert,
  Box,
  Card,
  CardContent,
  Container,
  Stack,
  Typography
} from "@mui/material";
import heavyContainer from "../assets/heavy-container.png";
import { getRuntimeConfig } from "./runtimeConfig";

export function App() {
  const { projectName, serviceName, errorMessage } = getRuntimeConfig();
  const isOnDCloud = projectName === "D Cloud";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
        py: 6,
        bgcolor: "#ffffff",
        backgroundImage:
          "radial-gradient(circle at 20% 14%, rgba(66, 133, 244, 0.08), transparent 16rem), radial-gradient(circle at 80% 10%, rgba(52, 168, 83, 0.08), transparent 14rem), radial-gradient(circle at 50% 88%, rgba(251, 188, 5, 0.06), transparent 18rem)"
      }}
    >
      <Container maxWidth="md" sx={{ width: "100%" }}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid rgba(15, 23, 42, 0.08)",
            boxShadow: "0 14px 32px rgba(15, 23, 42, 0.08)",
            bgcolor: "rgba(255, 255, 255, 0.94)",
            overflow: "hidden"
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            <Stack spacing={4}>
              <Box sx={{ textAlign: "center" }}>
                <Box
                  component="img"
                  src={heavyContainer}
                  alt="Container illustration"
                  sx={{
                    width: "min(100%, 330px)",
                    height: "auto",
                    mb: 2.5
                  }}
                />
                <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 0.75 }}>
                  It&apos;s running
                </Typography>
              </Box>

              {errorMessage ? <Alert severity="warning">{errorMessage}</Alert> : null}

              {isOnDCloud ? (
                <>
                  <Box
                  sx={{
                      textAlign: "center",
                      px: 2,
                      py: 1.5,
                      borderRadius: 2,
                      bgcolor: "rgba(248, 250, 252, 0.92)",
                      border: "1px solid rgba(15, 23, 42, 0.08)"
                    }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      Project: <Box component="code">{projectName}</Box>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                      Service: <Box component="code">{serviceName}</Box>
                    </Typography>
                  </Box>
                </>
              ) : (
                <Alert severity="info">This container is not running on D Cloud.</Alert>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
