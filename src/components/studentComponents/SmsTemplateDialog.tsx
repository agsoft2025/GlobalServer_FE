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
import type {
  SmsTemplate,
  SmsTemplateFieldSpec,
  SmsTemplatePayload,
  SmsTemplateStatus,
} from "../../types/smsTemplate";
import { RECORD_FIELD_OPTIONS } from "../../types/smsTemplate";
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

const MAX_VAR_LENGTH = 30; // DLT per-variable norm — the default for a new slot
const MAX_VAR_CEILING = 500; // hard ceiling the Super Admin may widen a slot to

const defaultSlot = (i: number): SmsTemplateFieldSpec => ({
  key: `value_${i + 1}`,
  label: `Value ${i + 1}`,
  type: "alphanumeric",
  maxLength: MAX_VAR_LENGTH,
  required: true,
  source: "input",
});

// Grow / shrink the per-slot spec so it always has exactly `count` entries,
// preserving what the Super Admin already configured for the lower slots.
const reconcileFields = (count: number, existing: SmsTemplateFieldSpec[]): SmsTemplateFieldSpec[] =>
  Array.from({ length: count }, (_, i) => existing[i] ?? defaultSlot(i));

export default function SmsTemplateDialog({ open, setOpen, onSubmit, selected, setSelected }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [fields, setFields] = useState<SmsTemplateFieldSpec[]>([]);
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
      const count = countPlaceholders(selected.approvedText || "");
      setFields(reconcileFields(count, selected.fields || []));
    } else {
      setForm(EMPTY);
      setFields([]);
    }
    setErrors({});
    setServerError(null);
  }, [selected, open]);

  const placeholderCount = useMemo(() => countPlaceholders(form.approvedText), [form.approvedText]);

  // Keep the slot editor in lock-step with the {#...#} slots in the text.
  useEffect(() => {
    setFields((prev) => (prev.length === placeholderCount ? prev : reconcileFields(placeholderCount, prev)));
  }, [placeholderCount]);

  const preview = useMemo(
    () => buildPreview(form.approvedText, fields.map((f) => (f.label ? `[${f.label}]` : ""))),
    [form.approvedText, fields],
  );

  const change = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const patchField = (idx: number, patch: Partial<SmsTemplateFieldSpec>) => {
    setFields((prev) => prev.map((f, i) => (i === idx ? { ...f, ...patch } : f)));
    setErrors((prev) => ({ ...prev, [`field_${idx}`]: "" }));
  };

  const setSource = (idx: number, source: SmsTemplateFieldSpec["source"]) => {
    if (source === "record") {
      patchField(idx, { source, key: "", type: "text" });
    } else {
      patchField(idx, { source, key: `value_${idx + 1}`, type: "alphanumeric" });
    }
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Template name is required";
    if (!form.approvedText.trim()) next.approvedText = "Approved template text is required";
    else if (placeholderCount < 1) next.approvedText = "Approved text must contain at least one {#...#} placeholder";
    if (form.status === "ACTIVE" && !form.dltTemplateId.trim())
      next.dltTemplateId = "A DLT Template ID is required to activate a template";

    fields.forEach((f, i) => {
      if (!f.label.trim()) next[`field_${i}`] = "Give this slot a label";
      else if (f.source === "record" && !f.key) next[`field_${i}`] = "Choose which student field fills this slot";
    });
    // A record slot bound to the same student field twice would map wrong.
    const recordKeys = fields.filter((f) => f.source === "record").map((f) => f.key);
    recordKeys.forEach((k, i) => {
      if (k && recordKeys.indexOf(k) !== i) {
        const dupIdx = fields.findIndex((f) => f.source === "record" && f.key === k && recordKeys.indexOf(k) !== i);
        if (dupIdx >= 0) next[`field_${dupIdx}`] = "This student field is already used by another slot";
      }
    });

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const close = () => {
    setOpen(false);
    setSelected(null);
    setForm(EMPTY);
    setFields([]);
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
        fields: fields.map((f, i) => ({
          key: f.source === "record" ? f.key : `value_${i + 1}`,
          label: f.label.trim() || `Value ${i + 1}`,
          type: f.type,
          maxLength: Math.min(Math.max(1, Number(f.maxLength) || MAX_VAR_LENGTH), MAX_VAR_CEILING),
          required: f.source === "record" ? true : f.required,
          source: f.source,
        })),
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

            {placeholderCount > 0 && (
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs font-semibold text-gray-600 mb-1">Slot mapping</p>
                <p className="text-xs text-gray-500 mb-3">
                  For each <code>{"{#...#}"}</code> slot, in order, tell the School Admin&apos;s SMS Center where its value
                  comes from. <b>From student record</b> is filled automatically for every recipient; <b>Type in SMS
                  Center</b> is a box the School Admin fills before sending.
                </p>

                <div className="flex flex-col gap-3">
                  {fields.map((f, i) => (
                    <div key={i} className="rounded-md bg-gray-50 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-gray-500">Slot {i + 1}</span>
                        <code className="text-[11px] text-gray-400">
                          {f.source === "record" ? `record: ${f.key || "?"}` : `input: value_${i + 1}`}
                        </code>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <TextField
                          size="small"
                          label="Label"
                          value={f.label}
                          onChange={(e) => patchField(i, { label: e.target.value })}
                          fullWidth
                          error={!!errors[`field_${i}`]}
                        />
                        <TextField
                          size="small"
                          select
                          label="Value source"
                          value={f.source}
                          onChange={(e) => setSource(i, e.target.value as SmsTemplateFieldSpec["source"])}
                          fullWidth
                        >
                          <MenuItem value="input">Type in SMS Center</MenuItem>
                          <MenuItem value="record">From student record</MenuItem>
                        </TextField>

                        {f.source === "record" ? (
                          <TextField
                            size="small"
                            select
                            label="Student field"
                            value={f.key}
                            onChange={(e) => patchField(i, { key: e.target.value })}
                            fullWidth
                            error={!!errors[`field_${i}`]}
                          >
                            {RECORD_FIELD_OPTIONS.map((o) => (
                              <MenuItem key={o.key} value={o.key}>
                                {o.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        ) : (
                          <TextField
                            size="small"
                            type="number"
                            label="Max length"
                            value={f.maxLength}
                            onChange={(e) => patchField(i, { maxLength: Number(e.target.value) })}
                            fullWidth
                            inputProps={{ min: 1, max: MAX_VAR_CEILING }}
                            helperText="30 is the usual DLT limit"
                          />
                        )}
                      </div>

                      {errors[`field_${i}`] && (
                        <p className="text-[11px] text-red-600 mt-1">{errors[`field_${i}`]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <TextField select label="Status" name="status" value={form.status} onChange={change} fullWidth>
              <MenuItem value="INACTIVE">INACTIVE</MenuItem>
              <MenuItem value="ACTIVE">ACTIVE</MenuItem>
            </TextField>

            {form.approvedText.trim() && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">Preview (slots shown as [Label])</p>
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
