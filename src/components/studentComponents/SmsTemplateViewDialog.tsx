import type { ReactNode } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip, Divider } from "@mui/material";
import type { SmsTemplate } from "../../types/smsTemplate";
import { buildPreview, countPlaceholders } from "../../utils/smsTemplatePreview";

type Props = {
  open: boolean;
  template: SmsTemplate | null;
  onClose: () => void;
};

const Row = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="flex gap-3 text-sm py-1">
    <span className="w-40 shrink-0 text-gray-500">{label}</span>
    <span className="text-gray-900 break-words">{value}</span>
  </div>
);

const fmt = (d?: string) => (d ? new Date(d).toLocaleString() : "—");

export default function SmsTemplateViewDialog({ open, template, onClose }: Props) {
  if (!template) return null;

  const slots = countPlaceholders(template.approvedText);
  const preview = buildPreview(
    template.approvedText,
    template.fields?.map((f) => `<${f.label}>`) ?? Array.from({ length: slots }, () => ""),
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="flex items-center justify-between">
        <span>{template.name}</span>
        <Chip
          size="small"
          label={template.status}
          color={template.status === "ACTIVE" ? "success" : "default"}
        />
      </DialogTitle>
      <DialogContent dividers>
        <Row label="Description" value={template.description || "—"} />
        <Row label="Domain" value={template.domain} />
        <Row label="DLT Template ID" value={template.dltTemplateId || <em className="text-amber-700">not set</em>} />
        <Row label="Version" value={`v${template.version}`} />
        <Row label="Dynamic slots" value={slots} />
        <Row
          label="Fields"
          value={
            template.fields?.length
              ? template.fields.map((f) => `${f.label} (${f.source}, ≤${f.maxLength})`).join(", ")
              : "—"
          }
        />

        <Divider className="my-3" />

        <p className="text-xs font-semibold text-gray-500 mb-1">Approved Text</p>
        <div className="bg-gray-50 border rounded-lg p-3 whitespace-pre-wrap text-sm text-gray-800">
          {template.approvedText}
        </div>

        <p className="text-xs font-semibold text-gray-500 mb-1 mt-3">Preview</p>
        <div className="bg-gray-50 border rounded-lg p-3 whitespace-pre-wrap text-sm text-gray-800">{preview}</div>
        <p className="text-xs text-gray-500 mt-1">{template.approvedText.length} characters (approved text)</p>

        <Divider className="my-3" />

        <Row label="Created" value={`${fmt(template.createdAt)} by ${template.createdBy?.username || "—"}`} />
        <Row label="Updated" value={`${fmt(template.updatedAt)} by ${template.updatedBy?.username || "—"}`} />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
