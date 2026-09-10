import { useState, useEffect } from "react";
import AddSchoolAdminDialog from "../components/studentComponents/AddAdminDialog";
import SchoolSmsConfigDialog from "../components/studentComponents/SchoolSmsConfigDialog";
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TablePagination, Tooltip, Snackbar, Alert, Chip } from "@mui/material";
import { FaPlus, FaEdit, FaTrash, FaCommentDots } from "react-icons/fa";
import { createAdmin } from "../api/service/studentService";
import { getAdmins, deleteAdmin, updateAdmin, type Admin, type AdminQueryParams } from "../api/service/adminService";
import { listSchoolSmsConfigs, updateSchoolSmsConfig } from "../api/service/schoolSmsConfigService";
import { ConfirmDialog } from "../components/common/ConfirmDialog";

// The populated location object carried on an admin row. `_id` is the tenant key
// (local StudentLocation._id) that the per-school SMS config is stored under.
type AdminLocation = { _id: string; schoolName?: string; locationName?: string };
const adminLocation = (a: Admin): AdminLocation | null =>
  a.location_id && typeof a.location_id === "object" ? (a.location_id as AdminLocation) : null;

const SchoolAdmins = () => {
    const [openAdmin, setOpenAdmin] = useState<boolean>(false);
    const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; admin: Admin | null }>({ open: false, admin: null });
    const [smsConfig, setSmsConfig] = useState<{ externalId: string; name: string; location: string } | null>(null);
    const [toast, setToast] = useState<{ open: boolean; msg: string }>({ open: false, msg: "" });
    // externalId (== location_id._id) -> assigned Sender ID headers
    const [sendersByLocation, setSendersByLocation] = useState<Record<string, string[]>>({});

    const fetchAdmins = async () => {
        try {
            const params: AdminQueryParams = {
                page: page + 1,
                limit: rowsPerPage,
            };
            const response = await getAdmins(params);
            setAdmins(response.data);
            // The local /admin endpoint returns totalItems at the top level; keep
            // the nested pagination shape as a fallback.
            const r = response as unknown as { totalItems?: number; pagination?: { totalItems?: number } };
            setTotalItems(r.pagination?.totalItems ?? r.totalItems ?? response.data.length);
        } catch (error) {
            console.error("Failed to fetch admins:", error);
        }
    };

    const fetchSmsConfigs = async () => {
        try {
            const res = await listSchoolSmsConfigs();
            setSendersByLocation(
                Object.fromEntries(res.data.map((c) => [c.externalId, c.assignedSenderIds])),
            );
        } catch (error) {
            console.error("Failed to fetch SMS sender assignments:", error);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, [page, rowsPerPage]);

    useEffect(() => {
        fetchSmsConfigs();
    }, []);

    const handleSubmitAdmin = async (data: any) => {
        try {
            const { assignedSenderIds, ...adminData } = data;
            if (selectedAdmin) {
                await updateAdmin(selectedAdmin._id, adminData);
            } else {
                await createAdmin(adminData);
            }

            // Sender IDs are a property of the school/location, not the admin —
            // persist them against the location the admin belongs to.
            const locationId =
                adminData.location_id ||
                (selectedAdmin && (typeof selectedAdmin.location_id === "object"
                    ? selectedAdmin.location_id?._id
                    : selectedAdmin.location_id));
            if (Array.isArray(assignedSenderIds) && locationId) {
                try {
                    await updateSchoolSmsConfig(locationId, { assignedSenderIds });
                    fetchSmsConfigs();
                } catch (cfgErr) {
                    console.error("Sender assignment failed:", cfgErr);
                    setToast({ open: true, msg: "Admin saved, but the Sender ID assignment failed — set it from the SMS action." });
                }
            }

            fetchAdmins();
            setOpenAdmin(false);
            setSelectedAdmin(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (admin: Admin) => {
        setSelectedAdmin(admin);
        setOpenAdmin(true);
    };

    const handleDelete = (admin: Admin) => {
        setConfirmDelete({ open: true, admin });
    };

    const confirmDeleteAdmin = async () => {
        if (confirmDelete.admin) {
            try {
                await deleteAdmin(confirmDelete.admin._id);
                fetchAdmins();
            } catch (error) {
                console.error("Failed to delete admin:", error);
            }
        }
        setConfirmDelete({ open: false, admin: null });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-semibold">School Admins</h1>

                {/* ✅ Button to open dialog */}
                <Button
                    onClick={() => {
                        setSelectedAdmin(null); // ensure it's create mode
                        setOpenAdmin(true);
                    }}
                    sx={{ bgcolor: "#3E6AB3", color: "#fff", display: "flex", gap: "0.5rem" }}
                >
                    <FaPlus />
                    Add Admin
                </Button>
            </div>

            {/* Admins Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Username</TableCell>
                            <TableCell>Full Name</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>SMS Sender ID</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {admins.map((admin) => (
                            <TableRow key={admin._id}>
                                <TableCell>{admin.username}</TableCell>
                                <TableCell>{admin.fullname}</TableCell>
                                <TableCell>
                                    {typeof admin.location_id === "object" && admin.location_id
                                        ? admin.location_id.schoolName || admin.location_id.locationName || "N/A"
                                        : "N/A"}
                                </TableCell>
                                <TableCell>
                                    {(() => {
                                        const loc = adminLocation(admin);
                                        if (admin.role === "SUPER ADMIN" || !loc) return "—";
                                        const headers = sendersByLocation[loc._id];
                                        if (headers === undefined)
                                            return <span className="text-gray-400 text-sm">— (default)</span>;
                                        if (headers.length === 0)
                                            return <span className="text-amber-700 text-sm">none — disabled</span>;
                                        return (
                                            <span className="flex gap-1 flex-wrap">
                                                {headers.map((h) => (
                                                    <Chip key={h} size="small" label={h} />
                                                ))}
                                            </span>
                                        );
                                    })()}
                                </TableCell>
                                <TableCell>{admin.role}</TableCell>
                                <TableCell>
                                    {admin.role !== "SUPER ADMIN" && (
                                        <Tooltip
                                            title={
                                                adminLocation(admin)
                                                    ? "SMS templates & sender IDs for this school"
                                                    : "Assign this admin to a school first"
                                            }
                                        >
                                            <span>
                                                <IconButton
                                                    color="secondary"
                                                    disabled={!adminLocation(admin)}
                                                    onClick={() => {
                                                        const loc = adminLocation(admin)!;
                                                        setSmsConfig({
                                                            externalId: loc._id,
                                                            name: loc.schoolName || "",
                                                            location: loc.locationName || "",
                                                        });
                                                    }}
                                                >
                                                    <FaCommentDots />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    )}
                                    <IconButton onClick={() => handleEdit(admin)} color="primary">
                                        <FaEdit />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(admin)} color="error">
                                        <FaTrash />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={totalItems}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(event) => {
                    setRowsPerPage(parseInt(event.target.value, 10));
                    setPage(0);
                }}
            />

            {/* ✅ Dialog */}
            <AddSchoolAdminDialog
                open={openAdmin}
                setOpen={setOpenAdmin}
                handleSubmitAdmin={handleSubmitAdmin}
                selectedAdmin={selectedAdmin}
                setSelectedAdmin={setSelectedAdmin}
            />

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                open={confirmDelete.open}
                onCancel={() => setConfirmDelete({ open: false, admin: null })}
                onConfirm={confirmDeleteAdmin}
                title="Delete Admin"
                message={`Are you sure you want to delete ${confirmDelete.admin?.fullname}?`}
            />

            {/* Per-school SMS template / sender-ID assignment */}
            <SchoolSmsConfigDialog
                open={!!smsConfig}
                externalId={smsConfig?.externalId ?? null}
                schoolName={smsConfig ? [smsConfig.name, smsConfig.location].filter(Boolean).join(" — ") : ""}
                meta={smsConfig ? { name: smsConfig.name, location: smsConfig.location } : undefined}
                onClose={() => setSmsConfig(null)}
                onSaved={() => {
                    setToast({ open: true, msg: "SMS configuration saved" });
                    fetchSmsConfigs();
                }}
            />

            <Snackbar
                open={toast.open}
                autoHideDuration={3000}
                onClose={() => setToast({ open: false, msg: "" })}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert severity="success" onClose={() => setToast({ open: false, msg: "" })}>
                    {toast.msg}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default SchoolAdmins;