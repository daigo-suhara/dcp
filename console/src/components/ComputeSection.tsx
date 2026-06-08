import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { alpha } from "@mui/material/styles";
import { Box, Button, Card, CardContent, CircularProgress, Paper, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import type { ComputeMachine } from "../types";
import { formatComputeTimestamp } from "../utils";

type ComputeSectionProps = {
  loading: boolean;
  deletingMachineName: string;
  machines: ComputeMachine[];
  onDeleteMachine: (name: string) => void;
  onOpenCreate: () => void;
};

export function ComputeSection({ loading, deletingMachineName, machines, onDeleteMachine, onOpenCreate }: ComputeSectionProps) {
  return (
    <Box sx={{ display: "grid", gap: 3 }}>
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 3, display: "grid", gap: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
            <Box sx={{ display: "grid", gap: 0.75 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                仮想マシン
              </Typography>
              <Typography variant="body2" color="text.secondary">
                作成済みの VM を一覧で確認できます。
              </Typography>
            </Box>
            <Button variant="contained" onClick={onOpenCreate}>
              仮想マシンを作成
            </Button>
          </Box>

          <Box sx={{ display: "grid", gap: 0 }}>
            <Box
              sx={{
                display: { xs: "none", sm: "grid" },
                gridTemplateColumns: "42px minmax(0, 1fr) 160px max-content",
                alignItems: "center",
                minHeight: 36,
                px: 1,
                color: "text.secondary",
                fontSize: 11,
                fontWeight: 700,
                borderBottom: "1px solid rgba(148, 163, 184, 0.18)"
              }}
            >
              <Box />
              <Box>名前</Box>
              <Box>更新日時</Box>
              <Box sx={{ textAlign: "right" }}>操作</Box>
            </Box>

            <Box sx={{ borderTop: "1px solid rgba(148, 163, 184, 0.18)" }}>
              {machines.length > 0 ? (
                machines.map((machine) => {
                  const isReady = machine.ready;
                  const statusIcon = isReady ? <CheckCircleIcon fontSize="small" /> : <CircularProgress size={14} thickness={5.5} sx={{ color: "inherit" }} />;

                  return (
                    <Paper
                      key={machine.name}
                      variant="outlined"
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "42px minmax(0, 1fr) 160px max-content",
                        gap: 0,
                        alignItems: "center",
                        minHeight: { xs: 40, sm: 44 },
                        p: { xs: 1, sm: 0 },
                        borderRadius: 0,
                        borderLeft: 0,
                        borderRight: 0,
                        borderTop: 0
                      }}
                    >
                      <Box sx={{ display: "grid", placeItems: "center" }}>
                        <Box
                          sx={{
                            width: 22,
                            height: 22,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: "999px",
                            bgcolor: isReady ? "transparent" : alpha("#2563eb", 0.12),
                            color: isReady ? "success.main" : "primary.main"
                          }}
                        >
                          {statusIcon}
                        </Box>
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Button
                          component={RouterLink}
                          to={`/compute/${encodeURIComponent(machine.name)}`}
                          variant="text"
                          size="small"
                          sx={{
                            justifyContent: "flex-start",
                            minWidth: 0,
                            px: 0,
                            py: 0,
                            fontSize: "0.95rem",
                            fontWeight: 700,
                            textTransform: "none",
                            color: "text.primary",
                            wordBreak: "break-all",
                            "&:hover": { backgroundColor: "transparent", textDecoration: "underline" }
                          }}
                        >
                          {machine.name}
                        </Button>
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                          {formatComputeTimestamp(machine.updatedAt || machine.createdAt)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "flex-end", minWidth: 0 }}>
                        <Button
                          variant="text"
                          size="small"
                          color="error"
                          startIcon={
                            deletingMachineName === machine.name ? <CircularProgress size={14} thickness={5} sx={{ color: "inherit" }} /> : <DeleteOutlinedIcon fontSize="small" />
                          }
                          onClick={() => onDeleteMachine(machine.name)}
                          disabled={deletingMachineName === machine.name}
                          sx={{ minWidth: 0, whiteSpace: "nowrap" }}
                        >
                          {deletingMachineName === machine.name ? "削除中..." : "削除"}
                        </Button>
                      </Box>
                    </Paper>
                  );
                })
              ) : (
                <Paper variant="outlined" sx={{ mt: 1.5, p: 2, borderRadius: 2, borderStyle: "dashed", bgcolor: alpha("#ffffff", 0.7) }}>
                  <Typography color="text.secondary">{loading ? "読み込み中..." : "まだ仮想マシンはありません。"}</Typography>
                </Paper>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
