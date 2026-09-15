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
  Divider,
} from "@mui/material";
import {
  getSchoolSmsConfig,
  updateSchoolSmsConfig,
} from "../../api/service/schoolSmsConfigService";
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
  (err as { response?: { data?: { message?: string } } }).response?.data
    ?.message || fallback;

export default function SchoolSmsConfigDialog({
  open,
  externalId,
  schoolName,
  meta,
  onClose,
  onSaved,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configured, setConfigured] = useState(false);
  const [senders, setSenders] = useState<AvailableSender[]>([]);
  const [checked, setChecked] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !externalId) return;

    setLoading(true);
    setError(null);

    getSchoolSmsConfig(externalId)
      .then((res) => {
        const d = res.data;

        setConfigured(d.configured);
        setSenders(d.availableSenders);
        setChecked(d.assignedSenderId ?? null);
      })
      .catch((err) =>
        setError(errMsg(err, "Failed to load configuration")),
      )
      .finally(() => setLoading(false));
  }, [open, externalId]);

  const toggle = (header: string) => {
    setChecked((prev) => (prev === header ? null : header));
  };

  const totalTemplates = useMemo(
    () =>
      senders.find((s) => s.header === checked)?.templateCount ?? 0,
    [senders, checked],
  );

  const save = async () => {
    if (!externalId) return;

    setSaving(true);
    setError(null);

    try {
      await updateSchoolSmsConfig(externalId, {
        assignedSenderId: checked ?? "",
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
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        SMS Sender ID — {schoolName || "…"}
      </DialogTitle>

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
              Assign the DLT Sender ID this school may send under. Its
              templates come automatically from the Sender ID → Template
              mapping in the DLT Manager.
            </p>

            {!configured && (
              <Alert severity="info" className="mb-2">
                Not configured yet — this school currently sends via the
                default sender. Saving with no sender selected disables SMS
                for this school.
              </Alert>
            )}

            <div className="flex flex-col gap-1">
              {senders.length === 0 ? (
                <p className="text-sm text-gray-400 py-4">
                  No sender IDs exist yet. Add one under “Sender IDs”.
                </p>
              ) : (
                senders.map((s) => {
                  const bad =
                    s.status !== "ACTIVE" || !s.registered;

                  const isChecked = checked === s.header;

                  return (
                    <div
                      key={s.header}
                      className="rounded-md border border-gray-100 px-2"
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isChecked}
                            onChange={() => toggle(s.header)}
                          />
                        }
                        label={
                          <span className="text-sm">
                            <b>{s.header}</b>

                            <span className="text-gray-400">
                              {" "}
                              · {s.templateCount} template
                              {s.templateCount === 1 ? "" : "s"}
                            </span>

                            {bad && (
                              <span className="text-amber-700">
                                {" "}
                                ·{" "}
                                {s.registered
                                  ? "inactive"
                                  : "unregistered"}
                              </span>
                            )}
                          </span>
                        }
                      />

                      {isChecked && s.templates.length > 0 && (
                        <p className="text-xs text-gray-500 pb-2 pl-9">
                          {s.templates.map((t) => t.name).join(", ")}
                        </p>
                      )}

                      {isChecked && s.templates.length === 0 && (
                        <p className="text-xs text-amber-700 pb-2 pl-9">
                          No active templates registered under this sender —
                          nothing will be sendable.
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <Divider className="my-3" />

            <p className="text-sm text-gray-600">
              This school will see{" "}
              <b>{totalTemplates}</b>{" "}
              template{totalTemplates === 1 ? "" : "s"} under{" "}
              <b>{checked ? 1 : 0}</b>{" "}
              sender.
            </p>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="error"
          disabled={saving}
        >
          Cancel
        </Button>

        <Button
          onClick={save}
          variant="contained"
          disabled={saving || loading}
          startIcon={
            saving ? <CircularProgress size={18} /> : null
          }
        >
          Save Configuration
        </Button>
      </DialogActions>
    </Dialog>
  );
}