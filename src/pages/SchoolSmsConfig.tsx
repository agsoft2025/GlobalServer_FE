import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Chip,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { FaCog } from "react-icons/fa";
import SchoolSmsConfigDialog from "../components/studentComponents/SchoolSmsConfigDialog";
import {
  listSchoolSmsConfigs,
} from "../api/service/schoolSmsConfigService";
import {
  getSchoolLocations,
  type SchoolLocationOption,
} from "../api/service/adminService";
import type { SchoolSmsConfigRow } from "../types/schoolSmsConfig";

type Toast = {
  open: boolean;
  msg: string;
  severity: "success" | "error";
};

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleString() : "—";

type MergedRow = {
  externalId: string;
  name: string;
  location: string;
  configured: boolean;
  assignedSenderId: string;
  templateCount: number;
  updatedAt: string | null;
};

export default function SchoolSmsConfig() {
  const [schools, setSchools] = useState<SchoolLocationOption[]>([]);
  const [configs, setConfigs] = useState<SchoolSmsConfigRow[]>([]);
  const [countBySender, setCountBySender] = useState<Record<string, number>>(
    {},
  );
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<{
    externalId: string;
    name: string;
    location: string;
  } | null>(null);

  const [toast, setToast] = useState<Toast>({
    open: false,
    msg: "",
    severity: "success",
  });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [locs, cfg] = await Promise.all([
        getSchoolLocations(),
        listSchoolSmsConfigs(),
      ]);

      setSchools(locs);
      setConfigs(cfg.data);
      setCountBySender(cfg.templateCountBySender || {});
    } catch (err: unknown) {
      const anyErr = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      setError(
        anyErr.response?.data?.message ||
          "Failed to load school SMS configuration",
      );

      setSchools([]);
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const rows: MergedRow[] = useMemo(() => {
    const byExt = new Map(
      configs.map((c) => [c.externalId, c]),
    );

    const q = search.trim().toLowerCase();

    return schools
      .map((s) => {
        const cfg = byExt.get(s._id);

        const assignedSenderId = cfg?.assignedSenderId ?? "";

        return {
          externalId: s._id,
          name: s.schoolName || "—",
          location: s.locationName || "—",
          configured: !!cfg,
          assignedSenderId,

          templateCount:
            cfg?.templateCount ??
            (assignedSenderId
              ? countBySender[assignedSenderId] || 0
              : 0),

          updatedAt: cfg?.updatedAt ?? null,
        };
      })
      .filter(
        (r) =>
          !q ||
          r.name.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q),
      );
  }, [schools, configs, countBySender, search]);

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-semibold">
          SMS Configuration
        </h1>

        <p className="text-sm text-gray-500">
          Assign a DLT Sender ID to each school. Its templates follow
          automatically from the Sender&nbsp;ID&nbsp;→&nbsp;Template
          mapping. A school left <b>not configured</b> uses the default
          sender; a configured school with no sender cannot send.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-3">
        <TextField
          size="small"
          label="Search school / location"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
              <TableCell>School</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Sender ID</TableCell>
              <TableCell align="center">Templates</TableCell>
              <TableCell>Updated</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  style={{ padding: 32 }}
                >
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  style={{ padding: 32 }}
                  className="text-gray-400"
                >
                  No schools found
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.externalId} hover>
                  <TableCell>{r.name}</TableCell>

                  <TableCell>{r.location}</TableCell>

                  <TableCell>
                    {r.assignedSenderId ? (
                      <Chip
                        size="small"
                        label={r.assignedSenderId}
                      />
                    ) : r.configured ? (
                      <span className="text-amber-700 text-sm">
                        none — SMS disabled
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">
                        — (default)
                      </span>
                    )}
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={r.templateCount}
                      color={
                        r.assignedSenderId
                          ? "primary"
                          : "default"
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <span className="text-sm">
                      {r.configured ? (
                        fmtDate(r.updatedAt)
                      ) : (
                        <span className="text-amber-700">
                          not configured
                        </span>
                      )}
                    </span>
                  </TableCell>

                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<FaCog />}
                      onClick={() =>
                        setEditing({
                          externalId: r.externalId,
                          name: r.name,
                          location: r.location,
                        })
                      }
                    >
                      Configure
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <SchoolSmsConfigDialog
        open={!!editing}
        externalId={editing?.externalId ?? null}
        schoolName={
          editing
            ? `${editing.name} — ${editing.location}`
            : ""
        }
        meta={
          editing
            ? {
                name: editing.name,
                location: editing.location,
              }
            : undefined
        }
        onClose={() => setEditing(null)}
        onSaved={() => {
          setToast({
            open: true,
            msg: "SMS configuration saved",
            severity: "success",
          });

          fetchAll();
        }}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() =>
          setToast((s) => ({
            ...s,
            open: false,
          }))
        }
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <Alert
          severity={toast.severity}
          onClose={() =>
            setToast((s) => ({
              ...s,
              open: false,
            }))
          }
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </div>
  );
}