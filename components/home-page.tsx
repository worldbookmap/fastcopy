"use client";

import ContentCopyRounded from "@mui/icons-material/ContentCopyRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import HistoryRounded from "@mui/icons-material/HistoryRounded";
import NoteAddRounded from "@mui/icons-material/NoteAddRounded";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";

import type { SnippetRecord } from "@/lib/snippets";

type HomePageProps = {
  initialSnippets: SnippetRecord[];
};

const copyIconUrl = "https://cdn-icons-png.flaticon.com/512/1621/1621635.png";
const writeIconUrl = "https://cdn-icons-png.flaticon.com/512/1159/1159633.png";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function HomePage({ initialSnippets }: HomePageProps) {
  const [snippets, setSnippets] = useState(initialSnippets);
  const [draft, setDraft] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [clearingHistory, setClearingHistory] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const latestSnippet = snippets[0] ?? null;
  const historySnippets = useMemo(() => snippets.slice(1), [snippets]);

  async function handleCopy(snippet: SnippetRecord) {
    await navigator.clipboard.writeText(snippet.content);
    setCopiedId(snippet.id);
    window.setTimeout(() => {
      setCopiedId((current) => (current === snippet.id ? null : current));
    }, 1800);
  }

  async function handleSave() {
    if (!draft.trim()) {
      setErrorMessage("저장할 내용을 입력해 주세요.");
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/snippets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: draft }),
      });

      const result = (await response.json()) as {
        snippets?: SnippetRecord[];
        message?: string;
      };

      if (!response.ok || !result.snippets) {
        throw new Error(result.message ?? "저장에 실패했습니다.");
      }

      setSnippets(result.snippets);
      setDraft("");
      setDialogOpen(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteHistoryItem(snippet: SnippetRecord) {
    const confirmed = window.confirm("이 과거 기록을 삭제할까요?");

    if (!confirmed) {
      return;
    }

    setDeletingId(snippet.id);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/snippets", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: snippet.id }),
      });

      const result = (await response.json()) as {
        snippets?: SnippetRecord[];
        message?: string;
      };

      if (!response.ok || !result.snippets) {
        throw new Error(result.message ?? "기록 삭제에 실패했습니다.");
      }

      setSnippets(result.snippets);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "기록 삭제에 실패했습니다.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleClearHistory() {
    const confirmed = window.confirm("과거 기록을 모두 삭제할까요? 최신 항목은 유지됩니다.");

    if (!confirmed) {
      return;
    }

    setClearingHistory(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/snippets", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scope: "history" }),
      });

      const result = (await response.json()) as {
        snippets?: SnippetRecord[];
        message?: string;
      };

      if (!response.ok || !result.snippets) {
        throw new Error(result.message ?? "전체 삭제에 실패했습니다.");
      }

      setSnippets(result.snippets);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "전체 삭제에 실패했습니다.");
    } finally {
      setClearingHistory(false);
    }
  }

  return (
    <Box sx={{ py: { xs: 4, md: 7 } }}>
      <Container maxWidth="md">
        <Stack spacing={3.5}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 6,
              overflow: "hidden",
              border: "1px solid var(--line)",
              background: "linear-gradient(145deg, rgba(255,250,243,0.98), rgba(250,240,228,0.92))",
              boxShadow: "var(--shadow)",
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Stack spacing={3}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                >
                  <Stack spacing={1.5}>
                    <Chip
                      label="FastCopy"
                      sx={{
                        alignSelf: "flex-start",
                        bgcolor: "rgba(185, 98, 44, 0.12)",
                        color: "var(--accent)",
                        fontWeight: 700,
                      }}
                    />
                    <Typography
                      variant="h2"
                      sx={{
                        fontFamily: '"Iowan Old Style", "Georgia", serif',
                        fontSize: { xs: "2.2rem", md: "3.2rem" },
                        lineHeight: 1.05,
                        letterSpacing: "-0.04em",
                      }}
                    >
                      지금 가장 최신으로 저장된
                      <br />
                      복사용 문구
                    </Typography>
                    <Typography variant="body1" sx={{ color: "var(--muted)", maxWidth: 620 }}>
                      누구나 열어서 바로 복사하고 붙여넣을 수 있게 만든 공개 보드입니다. 새 내용을
                      저장하면 첫 화면의 카드가 즉시 최신 내용으로 바뀝니다.
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1.5}>
                    <Box
                      component="img"
                      src={writeIconUrl}
                      alt="글쓰기 아이콘"
                      sx={{
                        width: { xs: 58, md: 72 },
                        height: { xs: 58, md: 72 },
                        borderRadius: 4,
                        bgcolor: "rgba(255,255,255,0.7)",
                        p: 1,
                        border: "1px solid rgba(99,74,47,0.09)",
                      }}
                    />
                    <Box
                      component="img"
                      src={copyIconUrl}
                      alt="복사 아이콘"
                      sx={{
                        width: { xs: 58, md: 72 },
                        height: { xs: 58, md: 72 },
                        borderRadius: 4,
                        bgcolor: "rgba(255,255,255,0.7)",
                        p: 1,
                        border: "1px solid rgba(99,74,47,0.09)",
                      }}
                    />
                  </Stack>
                </Stack>

                {latestSnippet ? (
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 2.5, md: 3 },
                      borderRadius: 5,
                      bgcolor: "var(--paper-strong)",
                      border: "1px solid rgba(99, 74, 47, 0.12)",
                    }}
                  >
                    <Stack spacing={2.5}>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1.5}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", sm: "center" }}
                      >
                        <Stack spacing={0.4}>
                          <Typography variant="overline" sx={{ color: "var(--accent)", fontWeight: 700 }}>
                            Latest Copy
                          </Typography>
                          <Typography variant="body2" sx={{ color: "var(--muted)" }}>
                            {formatDate(latestSnippet.createdAt)}
                          </Typography>
                        </Stack>
                        <Button
                          variant="contained"
                          startIcon={<ContentCopyRounded />}
                          onClick={() => handleCopy(latestSnippet)}
                          sx={{
                            borderRadius: 999,
                            px: 2.2,
                            py: 1.1,
                            bgcolor: "var(--accent)",
                            boxShadow: "none",
                            '&:hover': {
                              bgcolor: "#9d4e1e",
                              boxShadow: "none",
                            },
                          }}
                        >
                          {copiedId === latestSnippet.id ? "복사 완료" : "지금 복사하기"}
                        </Button>
                      </Stack>

                      <Typography
                        variant="body1"
                        sx={{
                          whiteSpace: "pre-wrap",
                          fontSize: { xs: "1rem", md: "1.08rem" },
                          lineHeight: 1.8,
                        }}
                      >
                        {latestSnippet.content}
                      </Typography>
                    </Stack>
                  </Paper>
                ) : (
                  <Alert severity="info">아직 저장된 내용이 없습니다. 첫 내용을 등록해 주세요.</Alert>
                )}

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  justifyContent="space-between"
                  alignItems={{ xs: "stretch", sm: "center" }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<NoteAddRounded />}
                    onClick={() => setDialogOpen(true)}
                    sx={{
                      alignSelf: { xs: "stretch", sm: "flex-start" },
                      borderRadius: 999,
                      px: 2.6,
                      py: 1.3,
                      bgcolor: "var(--accent)",
                      boxShadow: "none",
                      '&:hover': {
                        bgcolor: "#9d4e1e",
                        boxShadow: "none",
                      },
                    }}
                  >
                    다른 새로운 내용 입력하기
                  </Button>
                  <Typography variant="body2" sx={{ color: "var(--muted)" }}>
                    최신 30개까지 저장되며, 첫 화면에는 가장 최근 항목만 크게 노출됩니다.
                  </Typography>
                </Stack>

                {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
              </Stack>
            </CardContent>
          </Card>

          <Accordion
            disableGutters
            elevation={0}
            sx={{
              borderRadius: 5,
              overflow: "hidden",
              background: "var(--paper)",
              border: "1px solid var(--line)",
              boxShadow: "var(--shadow)",
              '&:before': {
                display: "none",
              },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreRounded />}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <HistoryRounded sx={{ color: "var(--accent)" }} />
                <Box>
                  <Typography variant="h6">과거 저장 기록 보기</Typography>
                  <Typography variant="body2" sx={{ color: "var(--muted)" }}>
                    기본 상태에서는 숨겨져 있고, 펼치면 이전 기록을 확인할 수 있습니다.
                  </Typography>
                </Box>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, pb: 2.5 }}>
              {historySnippets.length === 0 ? (
                <Alert severity="info">현재는 최신 항목만 있습니다.</Alert>
              ) : (
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="flex-end">
                    <Button
                      color="error"
                      startIcon={<DeleteOutlineRounded />}
                      onClick={handleClearHistory}
                      disabled={clearingHistory}
                    >
                      {clearingHistory ? "전체 삭제 중..." : "과거 기록 전체 삭제"}
                    </Button>
                  </Stack>
                  {historySnippets.map((snippet, index) => (
                    <Paper
                      key={snippet.id}
                      elevation={0}
                      sx={{
                        p: 2.2,
                        borderRadius: 4,
                        border: "1px solid rgba(99, 74, 47, 0.12)",
                        bgcolor: "rgba(255, 252, 247, 0.9)",
                      }}
                    >
                      <Stack spacing={1.3}>
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={1}
                          justifyContent="space-between"
                          alignItems={{ xs: "flex-start", sm: "center" }}
                        >
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              size="small"
                              label={`기록 ${historySnippets.length - index}`}
                              sx={{ bgcolor: "rgba(185, 98, 44, 0.12)", color: "var(--accent)" }}
                            />
                            <Typography variant="body2" sx={{ color: "var(--muted)" }}>
                              {formatDate(snippet.createdAt)}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1}>
                            <Button size="small" onClick={() => handleCopy(snippet)}>
                              {copiedId === snippet.id ? "복사 완료" : "복사"}
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              startIcon={<DeleteOutlineRounded />}
                              onClick={() => handleDeleteHistoryItem(snippet)}
                              disabled={deletingId === snippet.id || clearingHistory}
                            >
                              {deletingId === snippet.id ? "삭제 중..." : "삭제"}
                            </Button>
                          </Stack>
                        </Stack>
                        <Divider />
                        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.75 }}>
                          {snippet.content}
                        </Typography>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              )}
            </AccordionDetails>
          </Accordion>

          <Typography variant="caption" sx={{ color: "var(--muted)", textAlign: "center" }}>
            아이콘 출처: Flaticon의 Copy 아이콘과 Edit 아이콘 사용. 배포 시 Flaticon 라이선스 표기를 유지해
            주세요.
          </Typography>
        </Stack>
      </Container>

      <Dialog
        open={dialogOpen}
        onClose={() => {
          if (!saving) {
            setDialogOpen(false);
          }
        }}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 5,
            background: "linear-gradient(180deg, rgba(255,251,245,0.98), rgba(249,240,230,0.98))",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>새로운 내용을 입력하고 저장</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" sx={{ color: "var(--muted)" }}>
              저장하면 즉시 첫 화면의 대표 문구가 바뀌고, 기존 내용은 아래 기록으로 내려갑니다.
            </Typography>
            <TextField
              autoFocus
              multiline
              minRows={8}
              placeholder="복사해서 쓰게 할 문구를 입력하세요"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            닫기
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ bgcolor: "var(--accent)" }}>
            {saving ? "저장 중..." : "저장하기"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}