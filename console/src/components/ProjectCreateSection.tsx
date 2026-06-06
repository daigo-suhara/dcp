import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { Box, Button, Card, CardContent, Paper, TextField, Typography } from "@mui/material";
import type { FormEvent } from "react";

type ProjectCreateSectionProps = {
  creatingProject: boolean;
  hasProjects: boolean;
  onBack: () => void;
  onCreateProject: (event: FormEvent<HTMLFormElement>) => void;
  onProjectNameChange: (value: string) => void;
  projectName: string;
};

export function ProjectCreateSection({
  creatingProject,
  hasProjects,
  onBack,
  onCreateProject,
  onProjectNameChange,
  projectName
}: ProjectCreateSectionProps) {
  const normalizedName = projectName.trim();
  const isValidName = /^[a-z0-9-]+$/.test(normalizedName) && !normalizedName.startsWith("-") && !normalizedName.endsWith("-");
  const showError = normalizedName.length > 0 && !isValidName;

  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Card variant="outlined" sx={{ width: "100%", maxWidth: 720, borderRadius: 2 }}>
        <CardContent sx={{ p: 3, display: "grid", gap: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
            <Box sx={{ display: "grid", gap: 0.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                プロジェクトを作成
              </Typography>
            </Box>
            {hasProjects ? (
              <Button variant="outlined" startIcon={<ArrowBackOutlinedIcon />} onClick={onBack}>
                戻る
              </Button>
            ) : null}
          </Box>

          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "background.paper" }}>
            <Box component="form" onSubmit={onCreateProject} sx={{ display: "grid", gap: 2 }}>
              <TextField
                autoFocus
                label="プロジェクト名"
                value={projectName}
                onChange={(event) => onProjectNameChange(event.target.value)}
                placeholder="新しいプロジェクト"
                error={showError}
                helperText={showError ? "英小文字・数字・ハイフンのみ" : ""}
                fullWidth
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button type="submit" variant="contained" startIcon={<AddOutlinedIcon />} disabled={creatingProject || !normalizedName || !isValidName}>
                  作成
                </Button>
              </Box>
            </Box>
          </Paper>
        </CardContent>
      </Card>
    </Box>
  );
}
