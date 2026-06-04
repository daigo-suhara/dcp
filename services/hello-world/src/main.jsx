import React from "react";
import { createRoot } from "react-dom/client";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { App } from "./App";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#4f46e5"
    }
  },
  typography: {
    fontFamily: [
      "Roboto",
      "system-ui",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "sans-serif"
    ].join(",")
  },
  shape: {
    borderRadius: 20
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        code: {
          fontFamily:
            '"Roboto Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          color: "#a30038",
          backgroundColor: "#f8f8f8",
          border: "1px solid #ddd",
          borderRadius: "2px",
          padding: "0 6px",
          fontWeight: 500
        }
      }
    }
  }
});

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
