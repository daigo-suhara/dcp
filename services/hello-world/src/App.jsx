import {
  Box,
  Stack,
  Typography
} from "@mui/material";
import heavyContainer from "../assets/heavy-container.png";

export function App() {
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
      <Stack spacing={3} alignItems="center" sx={{ width: "100%", maxWidth: 960, textAlign: "center" }}>
        <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <Box
            component="img"
            src={heavyContainer}
            alt="Container illustration"
            sx={{
              width: "min(100%, 330px)",
              height: "auto",
              display: "block"
            }}
          />
        </Box>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
          It&apos;s running!
        </Typography>
      </Stack>
    </Box>
  );
}
