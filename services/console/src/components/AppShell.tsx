import { alpha } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import CloudQueueOutlinedIcon from "@mui/icons-material/CloudQueueOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Snackbar,
  TextField,
  Toolbar,
  Typography
} from "@mui/material";
import type { ReactNode } from "react";
import { navItems, type Project, type RouteState } from "../types";
import { shellBg } from "../theme";

type AppShellProps = {
  activeProjectId: string;
  children: ReactNode;
  deletingName: string;
  deletingProjectId: string;
  hasProjects: boolean;
  message: string;
  onCancelDelete: () => void;
  onCancelProjectDelete: () => void;
  onCloseSidebar: () => void;
  onConfirmDelete: (name: string) => void;
  onConfirmDeleteProject: (projectId: string) => void;
  onNavigate: (section: RouteState["section"]) => void;
  onProjectSelect: (projectId: string) => void;
  onToggleSidebar: () => void;
  onLogout: () => void;
  onClearMessage: () => void;
  pendingDeleteName: string;
  pendingProjectDeleteId: string;
  projects: Project[];
  route: RouteState;
  sidebarOpen: boolean;
};

export function AppShell({
  activeProjectId,
  children,
  deletingName,
  deletingProjectId,
  hasProjects,
  message,
  onCancelDelete,
  onCancelProjectDelete,
  onCloseSidebar,
  onConfirmDelete,
  onConfirmDeleteProject,
  onNavigate,
  onProjectSelect,
  onToggleSidebar,
  onLogout,
  onClearMessage,
  pendingDeleteName,
  pendingProjectDeleteId,
  projects,
  route,
  sidebarOpen
}: AppShellProps) {
  return (
    <Box sx={{ minHeight: "100vh", ...shellBg }}>
      <Snackbar open={Boolean(message)} autoHideDuration={3500} onClose={onClearMessage} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert severity="success" variant="filled" sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>

      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          backdropFilter: "blur(18px)",
          backgroundColor: alpha("#ffffff", 0.78),
          borderBottom: "1px solid rgba(148, 163, 184, 0.18)"
        }}
      >
        <Toolbar sx={{ gap: 1.5, minHeight: 64 }}>
          <IconButton edge="start" onClick={onToggleSidebar} aria-label="navigation">
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
            <CloudQueueOutlinedIcon sx={{ color: "primary.main" }} />
            <Typography variant="h6" sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
              D Cloud
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }} />
          <TextField
            select
            size="small"
            value={activeProjectId}
            onChange={(event) => onProjectSelect(event.target.value)}
            disabled={!hasProjects}
            sx={{ minWidth: { xs: 120, sm: 220 }, bgcolor: "background.paper" }}
            slotProps={{ htmlInput: { "aria-label": "プロジェクトを切り替え" } }}
          >
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </TextField>
          <Button variant="outlined" startIcon={<LogoutIcon />} onClick={onLogout} sx={{ whiteSpace: "nowrap" }}>
            ログアウト
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        open={sidebarOpen}
        onClose={onCloseSidebar}
        variant="temporary"
        ModalProps={{ keepMounted: true }}
        slotProps={{
          paper: {
            sx: {
              width: 300,
              borderRadius: 2,
              m: 2,
              border: "1px solid rgba(148, 163, 184, 0.24)",
              boxShadow: "0 24px 48px rgba(15, 23, 42, 0.12)"
            }
          }
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <CloudQueueOutlinedIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                D Cloud
              </Typography>
            </Box>
            <IconButton onClick={onCloseSidebar} aria-label="close navigation">
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          <List disablePadding>
            {navItems.map((item) => (
              <ListItemButton
                key={item.id}
                selected={route.section === item.id}
                onClick={() => {
                  onNavigate(item.id);
                  if (window.matchMedia("(max-width: 760px)").matches) {
                    onCloseSidebar();
                  }
                }}
                sx={{
                  mb: 1,
              borderRadius: 1.5,
                  border: "1px solid rgba(148, 163, 184, 0.24)",
                  "&.Mui-selected": {
                    bgcolor: alpha("#2563eb", 0.08),
                    borderColor: alpha("#2563eb", 0.28)
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.id === "home" ? <HomeOutlinedIcon /> : item.id === "container" ? <StorageOutlinedIcon /> : <CloudUploadOutlinedIcon />}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Container maxWidth={false} sx={{ py: { xs: 2, md: 3 }, px: { xs: 1.5, sm: 2, md: 3 } }}>
        {children}
      </Container>

      <Dialog open={Boolean(pendingDeleteName)} onClose={onCancelDelete} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DeleteOutlinedIcon color="error" />
          削除の確認
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {pendingDeleteName}
            </Typography>
            <Typography color="text.secondary">このサービスを削除しますか？</Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onCancelDelete} variant="outlined">
            キャンセル
          </Button>
          <Button onClick={() => onConfirmDelete(pendingDeleteName)} variant="contained" color="error" disabled={deletingName === pendingDeleteName}>
            {deletingName === pendingDeleteName ? "削除中..." : "削除"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(pendingProjectDeleteId)} onClose={onCancelProjectDelete} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DeleteOutlinedIcon color="error" />
          削除の確認
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              プロジェクトの削除
            </Typography>
            <Typography color="text.secondary">このプロジェクトを削除しますか？</Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onCancelProjectDelete} variant="outlined">
            キャンセル
          </Button>
          <Button onClick={() => onConfirmDeleteProject(pendingProjectDeleteId)} variant="contained" color="error" disabled={deletingProjectId === pendingProjectDeleteId}>
            {deletingProjectId === pendingProjectDeleteId ? "削除中..." : "削除"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
