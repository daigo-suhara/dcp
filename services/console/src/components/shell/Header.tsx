import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import { Box, Button, IconButton, MenuItem, TextField, Toolbar, AppBar } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { Project } from "../../types";
import { Brand } from "./Brand";
import { shellHeaderRowSx } from "./constants";

type HeaderProps = {
  activeProjectId: string;
  hasProjects: boolean;
  onLogout: () => void;
  onProjectSelect: (projectId: string) => void;
  onToggleSidebar: () => void;
  projects: Project[];
};

export function Header({ activeProjectId, hasProjects, onLogout, onProjectSelect, onToggleSidebar, projects }: HeaderProps) {
  return (
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
      <Toolbar disableGutters sx={{ ...shellHeaderRowSx, flexWrap: "wrap", rowGap: 1, py: 1 }}>
        <IconButton onClick={onToggleSidebar} aria-label="navigation" sx={{ width: 40, height: 40, p: 0, flex: "0 0 auto" }}>
          <MenuIcon />
        </IconButton>
        <Brand />
        <Box sx={{ flex: 1, minWidth: 0, display: { xs: "none", sm: "block" } }} />
        <TextField
          select
          size="small"
          value={activeProjectId}
          onChange={(event) => onProjectSelect(event.target.value)}
          disabled={!hasProjects}
          sx={{
            minWidth: { xs: 0, sm: 220 },
            width: { xs: "calc(100% - 96px)", sm: "auto" },
            flex: { xs: "1 1 180px", sm: "0 0 auto" },
            bgcolor: "background.paper"
          }}
          slotProps={{ htmlInput: { "aria-label": "プロジェクトを切り替え" } }}
        >
          {projects.map((project) => (
            <MenuItem key={project.id} value={project.id}>
              {project.name}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="outlined" startIcon={<LogoutIcon />} onClick={onLogout} sx={{ whiteSpace: "nowrap", width: { xs: "100%", sm: "auto" } }}>
          ログアウト
        </Button>
      </Toolbar>
    </AppBar>
  );
}
