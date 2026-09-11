import { useState, useEffect } from "react";

import AddSchoolAdminDialog from "../components/studentComponents/AddAdminDialog";
import SchoolSmsConfigDialog from "../components/studentComponents/SchoolSmsConfigDialog";

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
    Tooltip,
    Snackbar,
    Alert,
    Chip,
} from "@mui/material";

import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaCommentDots,
} from "react-icons/fa";

import { createAdmin } from "../api/service/studentService";

import {
    getAdmins,
    deleteAdmin,
    updateAdmin,
    type Admin,
    type AdminQueryParams,
} from "../api/service/adminService";

import {
    listSchoolSmsConfigs,
    updateSchoolSmsConfig,
} from "../api/service/schoolSmsConfigService";

import { ConfirmDialog } from "../components/common/ConfirmDialog";

// -----------------------------------------------------------------------------
// LOCATION
// -----------------------------------------------------------------------------

type AdminLocation = {
    _id: string;
    schoolName?: string;
    locationName?: string;
};

const getAdminLocation = (
    admin: Admin
): AdminLocation | null => {
    if (
        admin.location_id &&
        typeof admin.location_id === "object"
    ) {
        return admin.location_id as AdminLocation;
    }

    return null;
};

// -----------------------------------------------------------------------------
// SCHOOL SMS CONFIG
// -----------------------------------------------------------------------------

type SchoolSmsConfig = { externalId: string; schoolCode?: string; name?: string; location?: string; assignedSenderId: string; templateCount?: number; };

// -----------------------------------------------------------------------------
// COMPONENT
// -----------------------------------------------------------------------------

const SchoolAdmins = () => {
    // ---------------------------------------------------------------------------
    // ADMIN STATE
    // ---------------------------------------------------------------------------

    const [openAdmin, setOpenAdmin] =
        useState(false);

    const [selectedAdmin, setSelectedAdmin] =
        useState<Admin | null>(null);

    const [admins, setAdmins] =
        useState<Admin[]>([]);

    const [page, setPage] =
        useState(0);

    const [rowsPerPage, setRowsPerPage] =
        useState(10);

    const [totalItems, setTotalItems] =
        useState(0);

    // ---------------------------------------------------------------------------
    // DELETE
    // ---------------------------------------------------------------------------

    const [confirmDelete, setConfirmDelete] =
        useState<{
            open: boolean;
            admin: Admin | null;
        }>({
            open: false,
            admin: null,
        });

    // ---------------------------------------------------------------------------
    // SMS CONFIG DIALOG
    // ---------------------------------------------------------------------------

    const [smsConfig, setSmsConfig] =
        useState<{
            externalId: string;
            name: string;
            location: string;
        } | null>(null);

    // ---------------------------------------------------------------------------
    // SMS SENDER IDS
    // ---------------------------------------------------------------------------
    //
    // externalId -> assignedSenderId
    //
    // Example:
    //
    // {
    //   "school-id-1": "AGSWSL",
    //   "school-id-2": ""
    // }
    //
    // undefined = no config document => backend fallback
    // ""        = config exists but sender is explicitly cleared
    // "AGSWSL"  = sender assigned
    //

    const [
        senderByLocation,
        setSenderByLocation,
    ] = useState<Record<string, string>>({});

    // ---------------------------------------------------------------------------
    // TOAST
    // ---------------------------------------------------------------------------

    const [toast, setToast] =
        useState<{
            open: boolean;
            msg: string;
        }>({
            open: false,
            msg: "",
        });

    // ===========================================================================
    // FETCH ADMINS
    // ===========================================================================

    const fetchAdmins = async () => {
        try {
            const params: AdminQueryParams = {
                page: page + 1,
                limit: rowsPerPage,
            };

            const response =
                await getAdmins(params);

            setAdmins(response.data);

            const result =
                response as unknown as {
                    totalItems?: number;
                    pagination?: {
                        totalItems?: number;
                    };
                };

            setTotalItems(
                result.pagination?.totalItems ??
                result.totalItems ??
                response.data.length
            );
        } catch (error) {
            console.error(
                "Failed to fetch admins:",
                error
            );
        }
    };

    // ===========================================================================
    // FETCH SCHOOL SMS CONFIGS
    // ===========================================================================

    const fetchSmsConfigs = async () => {
        try {
            const response =
                await listSchoolSmsConfigs();

            const map: Record<string, string> =
                {};

            response.data.forEach(
                (config: SchoolSmsConfig) => {
                    map[config.externalId] =
                        config.assignedSenderId || "";
                }
            );

            setSenderByLocation(map);
        } catch (error) {
            console.error(
                "Failed to fetch SMS sender assignments:",
                error
            );
        }
    };

    // ===========================================================================
    // INITIAL LOAD
    // ===========================================================================

    useEffect(() => {
        fetchAdmins();
    }, [page, rowsPerPage]);

    useEffect(() => {
        fetchSmsConfigs();
    }, []);

    // ===========================================================================
    // SAVE ADMIN
    // ===========================================================================

    const handleSubmitAdmin = async (
        data: any
    ) => {
        try {
            // Sender ID belongs to the school, not the admin.
            const {
                assignedSenderId,
                ...adminData
            } = data;

            // -----------------------------------------------------------------------
            // CREATE / UPDATE ADMIN
            // -----------------------------------------------------------------------

            if (selectedAdmin) {
                await updateAdmin(
                    selectedAdmin._id,
                    adminData
                );
            } else {
                await createAdmin(adminData);
            }

            // -----------------------------------------------------------------------
            // FIND SCHOOL / LOCATION ID
            // -----------------------------------------------------------------------

            let locationId: string | undefined;

            if (adminData.location_id) {
                if (
                    typeof adminData.location_id ===
                    "object"
                ) {
                    locationId =
                        adminData.location_id._id;
                } else {
                    locationId =
                        adminData.location_id;
                }
            } else if (selectedAdmin) {
                if (
                    selectedAdmin.location_id &&
                    typeof selectedAdmin.location_id ===
                    "object"
                ) {
                    locationId =
                        selectedAdmin.location_id._id;
                } else {
                    locationId =
                        selectedAdmin.location_id as
                        | string
                        | undefined;
                }
            }

            // -----------------------------------------------------------------------
            // SAVE SCHOOL SENDER ID
            // -----------------------------------------------------------------------

            if (
                locationId &&
                assignedSenderId !== undefined
            ) {
                try {
                    await updateSchoolSmsConfig(
                        locationId,
                        {
                            assignedSenderId:
                                String(
                                    assignedSenderId || ""
                                )
                                    .trim()
                                    .toUpperCase(),
                        }
                    );

                    await fetchSmsConfigs();
                } catch (configError) {
                    console.error(
                        "Sender assignment failed:",
                        configError
                    );

                    setToast({
                        open: true,
                        msg:
                            "Admin saved, but Sender ID assignment failed.",
                    });
                }
            }

            // -----------------------------------------------------------------------
            // REFRESH
            // -----------------------------------------------------------------------

            await fetchAdmins();

            setOpenAdmin(false);
            setSelectedAdmin(null);
        } catch (error) {
            console.error(
                "Failed to save admin:",
                error
            );
        }
    };

    // ===========================================================================
    // EDIT
    // ===========================================================================

    const handleEdit = (
        admin: Admin
    ) => {
        setSelectedAdmin(admin);
        setOpenAdmin(true);
    };

    // ===========================================================================
    // DELETE
    // ===========================================================================

    const handleDelete = (
        admin: Admin
    ) => {
        setConfirmDelete({
            open: true,
            admin,
        });
    };

    // ===========================================================================
    // CONFIRM DELETE
    // ===========================================================================

    const confirmDeleteAdmin =
        async () => {
            if (!confirmDelete.admin) {
                return;
            }

            try {
                await deleteAdmin(
                    confirmDelete.admin._id
                );

                await fetchAdmins();
            } catch (error) {
                console.error(
                    "Failed to delete admin:",
                    error
                );
            }

            setConfirmDelete({
                open: false,
                admin: null,
            });
        };

    // ===========================================================================
    // RENDER
    // ===========================================================================

    return (
        <div>
            {/* =====================================================================
          HEADER
          ===================================================================== */}

            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-semibold">
                    School Admins
                </h1>

                <Button
                    onClick={() => {
                        setSelectedAdmin(null);
                        setOpenAdmin(true);
                    }}
                    sx={{
                        bgcolor: "#3E6AB3",
                        color: "#fff",
                        display: "flex",
                        gap: "0.5rem",
                    }}
                >
                    <FaPlus />
                    Add Admin
                </Button>
            </div>

            {/* =====================================================================
          TABLE
          ===================================================================== */}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                Username
                            </TableCell>

                            <TableCell>
                                Full Name
                            </TableCell>

                            <TableCell>
                                Location
                            </TableCell>

                            <TableCell>
                                SMS Sender ID
                            </TableCell>

                            <TableCell>
                                Role
                            </TableCell>

                            <TableCell>
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {admins.map((admin) => {
                            const location =
                                getAdminLocation(admin);

                            let senderText:
                                | string
                                | null = null;

                            if (
                                admin.role !== "SUPER_ADMIN" &&
                                location
                            ) {
                                const value = senderByLocation[location._id];

                                if (value === undefined) {
                                    senderText = "DEFAULT";
                                } else if (!value) {
                                    senderText = "NONE";
                                } else {
                                    senderText = value;
                                }
                            }

                            return (
                                <TableRow
                                    key={admin._id}
                                >
                                    {/* USERNAME */}

                                    <TableCell>
                                        {admin.username}
                                    </TableCell>

                                    {/* FULL NAME */}

                                    <TableCell>
                                        {admin.fullname}
                                    </TableCell>

                                    {/* LOCATION */}

                                    <TableCell>
                                        {location
                                            ? location.schoolName ||
                                            location.locationName ||
                                            "N/A"
                                            : "N/A"}
                                    </TableCell>

                                    {/* SMS SENDER */}

                                    <TableCell>
                                        {admin.role === "SUPER_ADMIN" || !location ? (
                                            "—"
                                        ) : senderText === "DEFAULT" ? (
                                            <span className="text-gray-400 text-sm">
                                                — (default)
                                            </span>
                                        ) : senderText === "NONE" ? (
                                            <span className="text-amber-700 text-sm">
                                                none — disabled
                                            </span>
                                        ) : (
                                            <Chip
                                                size="small"
                                                label={senderText}
                                            />
                                        )}
                                    </TableCell>

                                    {/* ROLE */}

                                    <TableCell>
                                        {admin.role}
                                    </TableCell>

                                    {/* ACTIONS */}

                                    <TableCell>
                                        {/* SMS CONFIG */}

                                        {admin.role !== "SUPER_ADMIN" && (
                                            <Tooltip
                                                title={
                                                    location
                                                        ? "SMS templates & sender ID for this school"
                                                        : "Assign this admin to a school first"
                                                }
                                            >
                                                <span>
                                                    <IconButton
                                                        color="secondary"
                                                        disabled={
                                                            !location
                                                        }
                                                        onClick={() => {
                                                            if (
                                                                !location
                                                            ) {
                                                                return;
                                                            }

                                                            setSmsConfig({
                                                                externalId:
                                                                    location._id,

                                                                name:
                                                                    location.schoolName ||
                                                                    "",

                                                                location:
                                                                    location.locationName ||
                                                                    "",
                                                            });
                                                        }}
                                                    >
                                                        <FaCommentDots />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        )}

                                        {/* EDIT */}

                                        <IconButton
                                            onClick={() =>
                                                handleEdit(
                                                    admin
                                                )
                                            }
                                            color="primary"
                                        >
                                            <FaEdit />
                                        </IconButton>

                                        {/* DELETE */}

                                        <IconButton
                                            onClick={() =>
                                                handleDelete(
                                                    admin
                                                )
                                            }
                                            color="error"
                                        >
                                            <FaTrash />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* =====================================================================
          PAGINATION
          ===================================================================== */}

            <TablePagination
                component="div"
                count={totalItems}
                page={page}
                onPageChange={(
                    _event,
                    newPage
                ) => {
                    setPage(newPage);
                }}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(
                    event
                ) => {
                    setRowsPerPage(
                        parseInt(
                            event.target.value,
                            10
                        )
                    );

                    setPage(0);
                }}
            />

            {/* =====================================================================
          ADMIN DIALOG
          ===================================================================== */}

            <AddSchoolAdminDialog
                open={openAdmin}
                setOpen={setOpenAdmin}
                handleSubmitAdmin={
                    handleSubmitAdmin
                }
                selectedAdmin={
                    selectedAdmin
                }
                setSelectedAdmin={
                    setSelectedAdmin
                }
            />

            {/* =====================================================================
          DELETE DIALOG
          ===================================================================== */}

            <ConfirmDialog
                open={
                    confirmDelete.open
                }
                onCancel={() => {
                    setConfirmDelete({
                        open: false,
                        admin: null,
                    });
                }}
                onConfirm={
                    confirmDeleteAdmin
                }
                title="Delete Admin"
                message={`Are you sure you want to delete ${confirmDelete.admin?.fullname}?`}
            />

            {/* =====================================================================
          SMS CONFIG DIALOG
          ===================================================================== */}

            <SchoolSmsConfigDialog
                open={!!smsConfig}
                externalId={
                    smsConfig?.externalId ??
                    null
                }
                schoolName={
                    smsConfig
                        ? [
                            smsConfig.name,
                            smsConfig.location,
                        ]
                            .filter(Boolean)
                            .join(" — ")
                        : ""
                }
                meta={
                    smsConfig
                        ? {
                            name: smsConfig.name,
                            location:
                                smsConfig.location,
                        }
                        : undefined
                }
                onClose={() => {
                    setSmsConfig(null);
                }}
                onSaved={() => {
                    setToast({
                        open: true,
                        msg: "SMS configuration saved",
                    });

                    fetchSmsConfigs();
                }}
            />

            {/* =====================================================================
          TOAST
          ===================================================================== */}

            <Snackbar
                open={toast.open}
                autoHideDuration={3000}
                onClose={() => {
                    setToast({
                        open: false,
                        msg: "",
                    });
                }}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                }}
            >
                <Alert
                    severity="success"
                    onClose={() => {
                        setToast({
                            open: false,
                            msg: "",
                        });
                    }}
                >
                    {toast.msg}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default SchoolAdmins;