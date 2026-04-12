import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { FaEdit, FaTrash } from "react-icons/fa";
import AddSchoolAdminDialog from "../components/studentComponents/AddAdminDialog";
import {
  createInmateAdmin,
  getInmateAdmins,
  type CreateInmateAdminPayload,
  type InmateAdmin,
  type InmateAdminListParams,
  type UpdateInmateAdminPayload,
  updateInmateAdmin,
  deleteInmateAdmin,
} from "../api/service/inmateAdminService";
import { ConfirmDialog } from "../components/common/ConfirmDialog";

const SORT_FIELD: InmateAdminListParams["sortBy"] = "createdAt";
const SORT_ORDER: InmateAdminListParams["order"] = "desc";

interface LocationDetail {
  _id?: string;
  name?: string;
  locationName?: string;
  baseUrl?: string;
  custodyLimits?: Array<{
    custodyType?: string;
    spendLimit?: number;
    depositLimit?: number;
    purchaseStatus?: string;
  }>;
}

export default function InmateAdmins() {
  const [admins, setAdmins] = useState<InmateAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<InmateAdmin | null>(null);
  const [alert, setAlert] = useState<{ severity: "success" | "error"; message: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const params: InmateAdminListParams = {
        page: page + 1,
        limit: rowsPerPage,
        sortBy: SORT_FIELD,
        order: SORT_ORDER,
      };

      if (appliedSearch) {
        params.search = appliedSearch;
      }

      const response = await getInmateAdmins(params);
      setAdmins(response.data || []);
      setTotalAdmins(response.pagination?.total ?? 0);
    } catch (error) {
      console.error("Unable to load admins", error);
      setAlert({ severity: "error", message: "Failed to fetch inmate admins" });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, appliedSearch]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const trimmedSearch = useMemo(() => searchTerm.trim(), [searchTerm]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (appliedSearch !== trimmedSearch) {
        setAppliedSearch(trimmedSearch);
        setPage(0);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [trimmedSearch, appliedSearch]);

  const handleSubmitAdmin = async (payload: CreateInmateAdminPayload) => {
    try {
      if (selectedAdmin) {
        const updatePayload: UpdateInmateAdminPayload = {};
        if (payload.fullname) updatePayload.fullname = payload.fullname;
        if (payload.password) updatePayload.password = payload.password;

        await updateInmateAdmin(selectedAdmin._id, updatePayload);
        setAlert({ severity: "success", message: "Admin updated successfully." });
      } else {
        await createInmateAdmin(payload);
        setAlert({ severity: "success", message: "Admin created successfully." });
      }

      setDialogOpen(false);
      setSelectedAdmin(null);
      fetchAdmins();
    } catch (error: unknown) {
      const message =
        (error as any)?.response?.data?.message ||
        (error instanceof Error ? error.message : "Unable to submit admin");
      setAlert({ severity: "error", message });
    }
  };

  const handleEditAdmin = (admin: InmateAdmin) => {
    setSelectedAdmin(admin);
    setDialogOpen(true);
  };

  const [deleteTarget, setDeleteTarget] = useState<InmateAdmin | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteInmateAdmin(deleteTarget._id);
      setAlert({ severity: "success", message: "Admin deleted" });
      fetchAdmins();
    } catch (error) {
      const message =
        (error as any)?.response?.data?.message ||
        (error instanceof Error ? error.message : "Unable to delete admin");
      setAlert({ severity: "error", message });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const resolveLocationName = (admin: InmateAdmin) => {
    if (admin.location?.name) return admin.location.name;
    if (typeof admin.location === "string") return admin.location;

    const locationId = admin.location_id as
      | string
      | { name?: string }
      | null
      | undefined;

    if (typeof locationId === "string") return locationId;
    if (locationId?.name) return locationId.name;

    return "N/A";
  };

  const getLocationDetail = (admin: InmateAdmin): LocationDetail | null => {
    if (admin.location && typeof admin.location === "object") {
      return admin.location as LocationDetail;
    }

    if (admin.location_id && typeof admin.location_id === "object") {
      return admin.location_id as LocationDetail;
    }

    return null;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Typography variant="h5" component="h1" className="font-semibold">
          Inmate Admin Management
        </Typography>
        <Button variant="contained" color="primary" onClick={() => setDialogOpen(true)}>
          + Add Admin
        </Button>
      </div>

      {alert && (
        <Alert className="mb-4" severity={alert.severity} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      <Paper className="p-4 mb-4">
        <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "4fr 1fr" }} gap={2} alignItems="center">
          <Typography variant="body2" color="text.secondary">
            {/* Results refresh in ~400ms after you pause typing. */}
          </Typography>
          <TextField
            label="Search by username or name"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            size="small"
            fullWidth
            placeholder="Type to search, results update after you stop typing"
          />
        </Box>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
                  <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell>Full Name</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                    <CircularProgress size={20} />
                    <Typography variant="body2">Loading admin data...</Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : admins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No admins found for the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                admins.map((admin) => (
                  <TableRow key={admin._id} hover>
                    <TableCell>{admin.username}</TableCell>
                    <TableCell>{admin.fullname}</TableCell>
                    <TableCell>
                      {(() => {
                        const detail = getLocationDetail(admin);
                        if (detail) {
                          return (
                            <Tooltip
                              title={
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
                                  <Typography variant="subtitle2">
                                    {detail.locationName || detail.name || "Location details"}
                                  </Typography>
                                  {detail.baseUrl && (
                                    <Typography variant="caption" noWrap>
                                      URL: {detail.baseUrl}
                                    </Typography>
                                  )}
                                  {detail.custodyLimits?.map((limit) => (
                                    <Typography variant="caption" key={limit.custodyType}>
                                      {limit.custodyType}: spend {limit.spendLimit ?? "—"}, deposit{" "}
                                      {limit.depositLimit ?? "—"}, status {limit.purchaseStatus ?? "—"}
                                    </Typography>
                                  ))}
                                </Box>
                              }
                              arrow
                              placement="top"
                            >
                              <span>{resolveLocationName(admin)}</span>
                            </Tooltip>
                          );
                        }
                        return resolveLocationName(admin);
                      })()}
                    </TableCell>
                    <TableCell>{admin.role || "ADMIN"}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleEditAdmin(admin)} aria-label="Edit admin">
                        <FaEdit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteTarget(admin)}
                        aria-label="Delete admin"
                      >
                        <FaTrash />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider />

        <TablePagination
          component="div"
          count={totalAdmins}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            const value = parseInt(event.target.value, 10);
            setRowsPerPage(value);
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </Paper>

      <AddSchoolAdminDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        handleSubmitAdmin={handleSubmitAdmin}
        selectedAdmin={selectedAdmin}
        setSelectedAdmin={setSelectedAdmin}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Confirm delete"
        message={`Remove ${deleteTarget?.fullname || deleteTarget?.username}?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />
    </div>
  );
}
