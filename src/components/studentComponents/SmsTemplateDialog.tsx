import React, { useEffect, useMemo, useState } from "react";
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
import type { SmsTemplate, SmsTemplatePayload, SmsTemplateStatus } from "../../types/smsTemplate";
import { buildPreview, countPlaceholders } from "../../utils/smsTemplatePreview";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit: (payload: SmsTemplatePayload) => Promise<void>;
  selected: SmsTemplate | null;
  setSelected: (t: SmsTemplate | null) => void;
};

type FormState = {
  name: string;
  description: string;
  dltTemplateId: string;
  approvedText: string;
  status: SmsTemplateStatus;
};

const EMPTY: FormState = {
  name: "",
  description: "",
  dltTemplateId: "",
  approvedText: "",
  status: "INACTIVE",
};

export default function SmsTemplateDialog({ open, setOpen, onSubmit, selected, setSelected }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (selected) {
      setForm({
        name: selected.name || "",
        description: selected.description || "",
        dltTemplateId: selected.dltTemplateId || "",
        approvedText: selected.approvedText || "",
        status: selected.status || "INACTIVE",
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
    setServerError(null);
  }, [selected, open]);

  const placeholderCount = useMemo(() => countPlaceholders(form.approvedText), [form.approvedText]);
  const preview = useMemo(
    () => buildPreview(form.approvedText, Array.from({ length: placeholderCount }, () => "")),
    [form.approvedText, placeholderCount],
  );

  const change = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Template name is required";
    if (!form.approvedText.trim()) next.approvedText = "Approved template text is required";
    else if (placeholderCount < 1) next.approvedText = "Approved text must contain at least one {#...#} placeholder";
    if (form.status === "ACTIVE" && !form.dltTemplateId.trim())
      next.dltTemplateId = "A DLT Template ID is required to activate a template";
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
        name: form.name.trim(),
        description: form.description.trim(),
        domain: "SCHOOL",
        dltTemplateId: form.dltTemplateId.trim(),
        approvedText: form.approvedText.trim(),
        status: form.status,
      });
      close();
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string } } };
      setServerError(anyErr.response?.data?.message || "Failed to save template");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={submitting ? undefined : close} maxWidth="sm" fullWidth>
      <form onSubmit={submit}>
        <DialogTitle>{selected ? "Edit SMS Template" : "New SMS Template"}</DialogTitle>
        <DialogContent dividers>
          <div className="grid grid-cols-1 gap-3">
            {serverError && <Alert severity="error">{serverError}</Alert>}

            <TextField
              label="Template Name"
              name="name"
              value={form.name}
              onChange={change}
              fullWidth
              error={!!errors.name}
              helperText={errors.name}
            />

            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={change}
              fullWidth
            />

            <TextField label="Domain" name="domain" value="SCHOOL" fullWidth disabled helperText="School templates only" />

            <TextField
              label="DLT Template ID"
              name="dltTemplateId"
              value={form.dltTemplateId}
              onChange={change}
              fullWidth
              error={!!errors.dltTemplateId}
              helperText={errors.dltTemplateId || "Operator/DLT-registered numeric id. Required before activation."}
            />

            <TextField
              label="Approved Template Text"
              name="approvedText"
              value={form.approvedText}
              onChange={change}
              fullWidth
              multiline
              minRows={3}
              error={!!errors.approvedText}
              helperText={
                errors.approvedText ||
                `Exact DLT-approved text incl. signature. Use {#alphanumeric#} for each dynamic slot. Detected slots: ${placeholderCount}`
              }
            />

            <TextField select label="Status" name="status" value={form.status} onChange={change} fullWidth>
              <MenuItem value="INACTIVE">INACTIVE</MenuItem>
              <MenuItem value="ACTIVE">ACTIVE</MenuItem>
            </TextField>

            {form.approvedText.trim() && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">Preview (slots shown as ____)</p>
                <div className="bg-gray-50 border rounded-lg p-3 whitespace-pre-wrap text-sm text-gray-800">
                  {preview}
                </div>
                <p className="text-xs text-gray-500 mt-1">{form.approvedText.length} characters (approved text)</p>
              </div>
            )}
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
