import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TablePagination,
  TextField,
  MenuItem,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";
import { FaPlus, FaEdit, FaTrash, FaEye, FaToggleOn, FaToggleOff } from "react-icons/fa";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import SmsTemplateDialog from "../components/studentComponents/SmsTemplateDialog";
import SmsTemplateViewDialog from "../components/studentComponents/SmsTemplateViewDialog";
import {
  listSmsTemplates,
  createSmsTemplate,
  updateSmsTemplate,
  setSmsTemplateStatus,
  deleteSmsTemplate,
} from "../api/service/schoolTemplateService";
import type { SmsTemplate, SmsTemplatePayload, SmsTemplateStatus } from "../types/smsTemplate";

type StatusFilter = "" | SmsTemplateStatus;
type Toast = { open: boolean; msg: string; severity: "success" | "error" };

const fmtDate = (d?: string) => (d ? new Date(d).toLocaleString() : "—");

export default function SchoolSmsTemplates() {
  const [rows, setRows] = useState<SmsTemplate[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<SmsTemplate | null>(null);
  const [viewing, setViewing] = useState<SmsTemplate | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; row: SmsTemplate | null }>({
    open: false,
    row: null,
  });
  const [confirmToggle, setConfirmToggle] = useState<{ open: boolean; row: SmsTemplate | null }>({
    open: false,
    row: null,
  });
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<Toast>({ open: false, msg: "", severity: "success" });

  const notify = (msg: string, severity: "success" | "error" = "success") =>
    setToast({ open: true, msg, severity });

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listSmsTemplates({
        page: page + 1,
        limit: rowsPerPage,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
      });
      setRows(res.data);
      setTotal(res.pagination?.total ?? res.data.length);
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string } } };
      setError(anyErr.response?.data?.message || "Failed to load templates");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchTemplates, 250);
    return () => clearTimeout(t);
  }, [fetchTemplates]);

  const handleSubmit = async (payload: SmsTemplatePayload) => {
    if (selected) {
      await updateSmsTemplate(selected.id, payload);
      notify("Template updated");
    } else {
      await createSmsTemplate(payload);
      notify("Template created");
    }
    fetchTemplates();
  };

  const doDelete = async () => {
    if (!confirmDelete.row) return;
    setBusy(true);
    try {
      await deleteSmsTemplate(confirmDelete.row.id);
      notify("Template deleted");
      fetchTemplates();
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string } } };
      notify(anyErr.response?.data?.message || "Failed to delete", "error");
    } finally {
      setBusy(false);
      setConfirmDelete({ open: false, row: null });
    }
  };

  const doToggle = async () => {
    if (!confirmToggle.row) return;
    const next: SmsTemplateStatus = confirmToggle.row.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setBusy(true);
    try {
      await setSmsTemplateStatus(confirmToggle.row.id, next);
      notify(`Template ${next === "ACTIVE" ? "activated" : "deactivated"}`);
      fetchTemplates();
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string } } };
      notify(anyErr.response?.data?.message || "Failed to change status", "error");
    } finally {
      setBusy(false);
      setConfirmToggle({ open: false, row: null });
    }
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <div>
          <h1 className="text-xl font-semibold">SMS Template Management</h1>
          <p className="text-sm text-gray-500">Approved DLT SMS templates consumed by School Admins in the SMS Center.</p>
        </div>
        <Button
          onClick={() => {
            setSelected(null);
            setFormOpen(true);
          }}
          sx={{ bgcolor: "#3E6AB3", color: "#fff", display: "flex", gap: "0.5rem" }}
        >
          <FaPlus />
          New Template
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 mb-3">
        <TextField
          size="small"
          label="Search name / DLT ID"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />
        <TextField
          size="small"
          select
          label="Status"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as StatusFilter);
            setPage(0);
          }}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="ACTIVE">Active</MenuItem>
          <MenuItem value="INACTIVE">Inactive</MenuItem>
        </TextField>
      </div>

      {error && (
        <Alert severity="error" className="mb-3">
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Template Name</TableCell>
              <TableCell>Domain</TableCell>
              <TableCell>DLT Template ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Version</TableCell>
              <TableCell>Updated At</TableCell>
              <TableCell>Updated By</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" style={{ padding: 32 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" style={{ padding: 32 }} className="text-gray-400">
                  No templates found
                </TableCell>
              </TableRow>
            ) : (
              rows.map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell>{t.name}</TableCell>
                  <TableCell>{t.domain}</TableCell>
                  <TableCell>{t.dltTemplateId || <span className="text-amber-700">not set</span>}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={t.status}
                      color={t.status === "ACTIVE" ? "success" : "default"}
                    />
                  </TableCell>
                  <TableCell>v{t.version}</TableCell>
                  <TableCell>{fmtDate(t.updatedAt)}</TableCell>
                  <TableCell>{t.updatedBy?.username || "—"}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="View">
                      <IconButton size="small" onClick={() => setViewing(t)}>
                        <FaEye />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => {
                          setSelected(t);
                          setFormOpen(true);
                        }}
                      >
                        <FaEdit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t.status === "ACTIVE" ? "Deactivate" : "Activate"}>
                      <IconButton
                        size="small"
                        color={t.status === "ACTIVE" ? "warning" : "success"}
                        onClick={() => setConfirmToggle({ open: true, row: t })}
                      >
                        {t.status === "ACTIVE" ? <FaToggleOn /> : <FaToggleOff />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => setConfirmDelete({ open: true, row: t })}>
                        <FaTrash />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[10, 20, 50]}
      />

      <SmsTemplateDialog
        open={formOpen}
        setOpen={setFormOpen}
        onSubmit={handleSubmit}
        selected={selected}
        setSelected={setSelected}
      />

      <SmsTemplateViewDialog open={!!viewing} template={viewing} onClose={() => setViewing(null)} />

      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete template"
        message={`Delete "${confirmDelete.row?.name}"? It will be soft-deleted and hidden from School Admins.`}
        confirmText="Delete"
        loading={busy}
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete({ open: false, row: null })}
      />

      <ConfirmDialog
        open={confirmToggle.open}
        title={confirmToggle.row?.status === "ACTIVE" ? "Deactivate template" : "Activate template"}
        message={
          confirmToggle.row?.status === "ACTIVE"
            ? `Deactivate "${confirmToggle.row?.name}"? School Admins will no longer be able to send with it.`
            : `Activate "${confirmToggle.row?.name}"? School Admins will be able to send with it.`
        }
        confirmText={confirmToggle.row?.status === "ACTIVE" ? "Deactivate" : "Activate"}
        loading={busy}
        onConfirm={doToggle}
        onCancel={() => setConfirmToggle({ open: false, row: null })}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast.severity} onClose={() => setToast((s) => ({ ...s, open: false }))}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </div>
  );
}
