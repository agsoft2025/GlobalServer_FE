import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Alert,
  Chip,
  Divider,
} from "@mui/material";
import { getSchoolSmsConfig, updateSchoolSmsConfig } from "../../api/service/schoolSmsConfigService";
import type { AvailableSender } from "../../types/schoolSmsConfig";

type Props = {
  open: boolean;
  externalId: string | null;
  schoolName?: string;
  meta?: { name?: string; location?: string; schoolCode?: string };
  onClose: () => void;
  onSaved: () => void;
};

const errMsg = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } } }).response?.data?.message || fallback;

export default function SchoolSmsConfigDialog({ open, externalId, schoolName, meta, onClose, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configured, setConfigured] = useState(false);
  const [senders, setSenders] = useState<AvailableSender[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open || !externalId) return;
    setLoading(true);
    setError(null);
    getSchoolSmsConfig(externalId)
      .then((res) => {
        const d = res.data;
        setConfigured(d.configured);
        setSenders(d.availableSenders);
        setChecked(new Set(d.assignedSenderIds));
      })
      .catch((err) => setError(errMsg(err, "Failed to load configuration")))
      .finally(() => setLoading(false));
  }, [open, externalId]);

  const toggle = (header: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(header)) next.delete(header);
      else next.add(header);
      return next;
    });

  const totalTemplates = useMemo(
    () => senders.filter((s) => checked.has(s.header)).reduce((n, s) => n + s.templateCount, 0),
    [senders, checked],
  );

  const save = async () => {
    if (!externalId) return;
    setSaving(true);
    setError(null);
    try {
      await updateSchoolSmsConfig(externalId, {
        assignedSenderIds: [...checked],
        name: meta?.name,
        location: meta?.location,
        schoolCode: meta?.schoolCode,
      });
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(errMsg(err, "Failed to save configuration"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>SMS Sender IDs — {schoolName || "…"}</DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" className="mb-3">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <CircularProgress size={24} />
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-2">
              Assign the DLT Sender ID(s) this school may send under. Its templates come automatically from the
              Sender&nbsp;ID&nbsp;→&nbsp;Template mapping in the DLT Manager — no per-template setup.
            </p>
            {!configured && (
              <Alert severity="info" className="mb-2">
                Not configured yet — this school currently sends via the default sender. Saving locks it to exactly what
                you tick. Saving with nothing ticked disables SMS for this school.
              </Alert>
            )}

            <div className="flex flex-col gap-1">
              {senders.length === 0 ? (
                <p className="text-sm text-gray-400 py-4">No sender IDs exist yet. Add one under “Sender IDs”.</p>
              ) : (
                senders.map((s) => {
                  const bad = s.status !== "ACTIVE" || !s.registered;
                  return (
                    <div key={s.header} className="rounded-md border border-gray-100 px-2">
                      <FormControlLabel
                        control={<Checkbox checked={checked.has(s.header)} onChange={() => toggle(s.header)} />}
                        label={
                          <span className="text-sm">
                            <b>{s.header}</b>
                            <span className="text-gray-400">
                              {" "}
                              · {s.templateCount} template{s.templateCount === 1 ? "" : "s"}
                            </span>
                            {bad && <span className="text-amber-700"> · {s.registered ? "inactive" : "unregistered"}</span>}
                          </span>
                        }
                      />
                      {checked.has(s.header) && s.templates.length > 0 && (
                        <p className="text-xs text-gray-500 pb-2 pl-9">
                          {s.templates.map((t) => t.name).join(", ")}
                        </p>
                      )}
                      {checked.has(s.header) && s.templates.length === 0 && (
                        <p className="text-xs text-amber-700 pb-2 pl-9">
                          No active templates registered under this sender — nothing will be sendable.
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <Divider className="my-3" />
            <p className="text-sm text-gray-600">
              This school will see <b>{totalTemplates}</b> template{totalTemplates === 1 ? "" : "s"} across{" "}
              <b>{checked.size}</b> sender{checked.size === 1 ? "" : "s"}.
            </p>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="error" disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={save}
          variant="contained"
          disabled={saving || loading}
          startIcon={saving ? <CircularProgress size={18} /> : null}
        >
          Save Configuration
        </Button>
      </DialogActions>
    </Dialog>
  );
}
