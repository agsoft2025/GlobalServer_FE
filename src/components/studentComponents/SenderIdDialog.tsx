import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import type { SenderId, SenderIdPayload, SenderIdStatus } from "../../types/senderId";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit: (payload: SenderIdPayload) => Promise<void>;
  selected: SenderId | null;
  setSelected: (s: SenderId | null) => void;
};

type FormState = {
  header: string;
  description: string;
  dltEntityId: string;
  status: SenderIdStatus;
};

const EMPTY: FormState = { header: "", description: "", dltEntityId: "", status: "ACTIVE" };

const HEADER_RE = /^[A-Z0-9]{3,11}$/;

export default function SenderIdDialog({ open, setOpen, onSubmit, selected, setSelected }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (selected) {
      setForm({
        header: selected.header || "",
        description: selected.description || "",
        dltEntityId: selected.dltEntityId || "",
        status: selected.status || "ACTIVE",
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
    setServerError(null);
  }, [selected, open]);

  const change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "header" ? value.toUpperCase() : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!HEADER_RE.test(form.header.trim())) {
      next.header = "3–11 upper-case letters/digits (e.g. AGSWSL)";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const close = () => {
    setOpen(false);
    setSelected(null);
    setForm(EMPTY);
    setErrors({});
    setServerError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setServerError(null);
    try {
      await onSubmit({
        header: form.header.trim().toUpperCase(),
        description: form.description.trim(),
        dltEntityId: form.dltEntityId.trim(),
        status: form.status,
      });
      close();
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string } } };
      setServerError(anyErr.response?.data?.message || "Failed to save sender ID");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={submitting ? undefined : close} maxWidth="sm" fullWidth>
      <form onSubmit={submit}>
        <DialogTitle>{selected ? "Edit Sender ID" : "New Sender ID"}</DialogTitle>
        <DialogContent dividers>
          <div className="grid grid-cols-1 gap-3">
            {serverError && <Alert severity="error">{serverError}</Alert>}

            <TextField
              label="Sender Header"
              name="header"
              value={form.header}
              onChange={change}
              fullWidth
              error={!!errors.header}
              helperText={errors.header || "Exactly as approved in the operator's DLT Manager, e.g. AGSWSL"}
              inputProps={{ maxLength: 11 }}
            />

            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={change}
              fullWidth
            />

            <TextField
              label="DLT Entity / PE ID (optional)"
              name="dltEntityId"
              value={form.dltEntityId}
              onChange={change}
              fullWidth
              helperText="Informational only"
            />

            <TextField select label="Status" name="status" value={form.status} onChange={change} fullWidth>
              <MenuItem value="ACTIVE">ACTIVE</MenuItem>
              <MenuItem value="INACTIVE">INACTIVE</MenuItem>
            </TextField>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={close} variant="outlined" color="error" disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={18} /> : null}
          >
            {selected ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
