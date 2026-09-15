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
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff } from "react-icons/fa";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import SenderIdDialog from "../components/studentComponents/SenderIdDialog";
import {
  listSenderIds,
  createSenderId,
  updateSenderId,
  setSenderIdStatus,
  deleteSenderId,
} from "../api/service/senderIdService";
import type { SenderId, SenderIdPayload, SenderIdStatus } from "../types/senderId";

type StatusFilter = "" | SenderIdStatus;
type Toast = { open: boolean; msg: string; severity: "success" | "error" };

const fmtDate = (d?: string) => (d ? new Date(d).toLocaleString() : "—");
const errMsg = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } } }).response?.data?.message || fallback;

export default function SenderIds() {
  const [rows, setRows] = useState<SenderId[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<SenderId | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; row: SenderId | null }>({ open: false, row: null });
  const [confirmToggle, setConfirmToggle] = useState<{ open: boolean; row: SenderId | null }>({ open: false, row: null });
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<Toast>({ open: false, msg: "", severity: "success" });

  const notify = (msg: string, severity: "success" | "error" = "success") => setToast({ open: true, msg, severity });

  const fetchRows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listSenderIds({
        page: page + 1,
        limit: rowsPerPage,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
      });
      setRows(res.data);
      setTotal(res.pagination?.total ?? res.data.length);
    } catch (err: unknown) {
      setError(errMsg(err, "Failed to load sender IDs"));
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchRows, 250);
    return () => clearTimeout(t);
  }, [fetchRows]);

  const handleSubmit = async (payload: SenderIdPayload) => {
    if (selected) {
      await updateSenderId(selected.id, payload);
      notify("Sender ID updated");
    } else {
      await createSenderId(payload);
      notify("Sender ID created");
    }
    fetchRows();
  };

  const doDelete = async () => {
    if (!confirmDelete.row) return;
    setBusy(true);
    try {
      await deleteSenderId(confirmDelete.row.id);
      notify("Sender ID deleted");
      fetchRows();
    } catch (err: unknown) {
      notify(errMsg(err, "Failed to delete"), "error");
    } finally {
      setBusy(false);
      setConfirmDelete({ open: false, row: null });
    }
  };

  const doToggle = async () => {
    if (!confirmToggle.row) return;
    const next: SenderIdStatus = confirmToggle.row.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setBusy(true);
    try {
      await setSenderIdStatus(confirmToggle.row.id, next);
      notify(`Sender ID ${next === "ACTIVE" ? "activated" : "deactivated"}`);
      fetchRows();
    } catch (err: unknown) {
      notify(errMsg(err, "Failed to change status"), "error");
    } finally {
      setBusy(false);
      setConfirmToggle({ open: false, row: null });
    }
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <div>
          <h1 className="text-xl font-semibold">Sender IDs</h1>
          <p className="text-sm text-gray-500">
            DLT-approved sender headers. Each SMS template is registered under one of these; School Admins never pick a
            sender directly.
          </p>
        </div>
        <Button
          onClick={() => {
            setSelected(null);
            setFormOpen(true);
          }}
          sx={{ bgcolor: "#3E6AB3", color: "#fff", display: "flex", gap: "0.5rem" }}
        >
          <FaPlus />
          New Sender ID
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 mb-3">
        <TextField
          size="small"
          label="Search header / description"
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
              <TableCell>Header</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>DLT Entity ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Updated At</TableCell>
              <TableCell>Updated By</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" style={{ padding: 32 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" style={{ padding: 32 }} className="text-gray-400">
                  No sender IDs found
                </TableCell>
              </TableRow>
            ) : (
              rows.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell className="font-medium">{s.header}</TableCell>
                  <TableCell>{s.description || "—"}</TableCell>
                  <TableCell>{s.dltEntityId || "—"}</TableCell>
                  <TableCell>
                    <Chip size="small" label={s.status} color={s.status === "ACTIVE" ? "success" : "default"} />
                  </TableCell>
                  <TableCell>{fmtDate(s.updatedAt)}</TableCell>
                  <TableCell>{s.updatedBy?.username || "—"}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => {
                          setSelected(s);
                          setFormOpen(true);
                        }}
                      >
                        <FaEdit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={s.status === "ACTIVE" ? "Deactivate" : "Activate"}>
                      <IconButton
                        size="small"
                        color={s.status === "ACTIVE" ? "warning" : "success"}
                        onClick={() => setConfirmToggle({ open: true, row: s })}
                      >
                        {s.status === "ACTIVE" ? <FaToggleOn /> : <FaToggleOff />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => setConfirmDelete({ open: true, row: s })}>
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

      <SenderIdDialog
        open={formOpen}
        setOpen={setFormOpen}
        onSubmit={handleSubmit}
        selected={selected}
        setSelected={setSelected}
      />

      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete sender ID"
        message={`Delete "${confirmDelete.row?.header}"? Templates still using it must be reassigned first.`}
        confirmText="Delete"
        loading={busy}
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete({ open: false, row: null })}
      />

      <ConfirmDialog
        open={confirmToggle.open}
        title={confirmToggle.row?.status === "ACTIVE" ? "Deactivate sender ID" : "Activate sender ID"}
        message={
          confirmToggle.row?.status === "ACTIVE"
            ? `Deactivate "${confirmToggle.row?.header}"? It can no longer be assigned to templates.`
            : `Activate "${confirmToggle.row?.header}"?`
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
