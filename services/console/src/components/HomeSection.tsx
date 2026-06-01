import { alpha } from "@mui/material/styles";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { Box, Button, Card, CardContent, Chip, Paper, TextField, Typography } from "@mui/material";
import type { FormEvent } from "react";
import type { Project } from "../types";

type HomeSectionProps = {
  activeProjectId: string;
  creatingProject: boolean;
  deletingProjectId: string;
  onCreateProject: (event: FormEvent<HTMLFormElement>) => void;
  onProjectNameChange: (value: string) => void;
  onRequestDeleteProject: (projectId: string) => void;
  onSelectProject: (projectId: string) => void;
  onToggleCreateForm: () => void;
  projectName: string;
  projects: Project[];
  showProjectCreateForm: boolean;
};

export function HomeSection({
  activeProjectId,
  creatingProject,
  deletingProjectId,
  onCreateProject,
  onProjectNameChange,
  onRequestDeleteProject,
  onSelectProject,
  onToggleCreateForm,
  projectName,
  projects,
  showProjectCreateForm
}: HomeSectionProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 3, display: "grid", gap: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
            <Box>
              <Typography variant="overline" color="primary">
                プロジェクト
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
                プロジェクト管理
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={onToggleCreateForm}>
              プロジェクトを作成
            </Button>
          </Box>

          {showProjectCreateForm ? (
            <Box component="form" onSubmit={onCreateProject} sx={{ display: "grid", gap: 2, maxWidth: 560 }}>
              <TextField
                label="プロジェクト名"
                value={projectName}
                onChange={(event) => onProjectNameChange(event.target.value)}
                placeholder="新しいプロジェクト"
                fullWidth
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button type="submit" variant="contained" disabled={creatingProject || !projectName.trim()}>
                  作成
                </Button>
              </Box>
            </Box>
          ) : null}

          <Box sx={{ display: "grid", gap: 1 }}>
            <Box sx={{ display: { xs: "none", md: "grid" }, gridTemplateColumns: "minmax(180px, 1fr) minmax(0, 1fr) auto", gap: 1.5, px: 1.5, color: "text.secondary", fontSize: 12, fontWeight: 700 }}>
              <Box>名前</Box>
              <Box>ID</Box>
              <Box />
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
              {projects.map((project) => {
                const isActive = project.id === activeProjectId;
                const canDelete = project.name !== "default";
                return (
                  <Paper
                    key={project.id}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      borderColor: isActive ? alpha("#2563eb", 0.4) : "divider",
                      bgcolor: isActive ? alpha("#2563eb", 0.04) : "background.paper"
                    }}
                  >
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(180px, 1fr) minmax(0, 1fr) auto" }, gap: 1.5, alignItems: "center" }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Button onClick={() => onSelectProject(project.id)} sx={{ width: "100%", justifyContent: "flex-start", textAlign: "left", px: 0, color: "inherit" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                            <Typography sx={{ fontWeight: 700 }}>{project.name}</Typography>
                            {isActive ? <Chip label="現在使用中" size="small" color="primary" variant="outlined" /> : null}
                          </Box>
                        </Button>
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "break-all" }}>
                          {project.id}
                        </Typography>
                      </Box>
                      <Box>
                        <Button
                          variant="outlined"
                          color="inherit"
                          startIcon={<DeleteOutlinedIcon />}
                          disabled={!canDelete || deletingProjectId === project.id}
                          onClick={() => onRequestDeleteProject(project.id)}
                          fullWidth
                        >
                          {deletingProjectId === project.id ? "削除中..." : "削除"}
                        </Button>
                      </Box>
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
