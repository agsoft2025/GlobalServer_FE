import { useState, useEffect } from "react";
import AddInmateAdminDialog from "../components/inmateComponents/AddInmateAdminDialog";
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TablePagination } from "@mui/material";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import {
  getInmateAdmins,
  createInmateAdmin,
  updateInmateAdmin,
  deleteInmateAdmin,
  type InmateAdmin,
} from "../api/service/inmateAdminService";
import { ConfirmDialog } from "../components/common/ConfirmDialog";

const InmateAdmins = () => {
    const [openAdmin, setOpenAdmin] = useState<boolean>(false);
    const [selectedAdmin, setSelectedAdmin] = useState<InmateAdmin | null>(null);
    const [admins, setAdmins] = useState<InmateAdmin[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; admin: InmateAdmin | null }>({ open: false, admin: null });

    const fetchAdmins = async () => {
        try {
            const response = await getInmateAdmins({ page: page + 1, limit: rowsPerPage });
            setAdmins(response.data);
            setTotalItems(response.pagination.total);
        } catch (error) {
            console.error("Failed to fetch admins:", error);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, [page, rowsPerPage]);

    const handleSubmitAdmin = async (data: any) => {
        try {
            if (selectedAdmin) {
                await updateInmateAdmin(selectedAdmin._id, data);
            } else {
                await createInmateAdmin(data);
            }
            fetchAdmins();
            setOpenAdmin(false);
            setSelectedAdmin(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (admin: InmateAdmin) => {
        setSelectedAdmin(admin);
        setOpenAdmin(true);
    };

    const handleDelete = (admin: InmateAdmin) => {
        setConfirmDelete({ open: true, admin });
    };

    const confirmDeleteAdmin = async () => {
        if (confirmDelete.admin) {
            try {
                await deleteInmateAdmin(confirmDelete.admin._id);
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
                <h1 className="text-xl font-semibold">Inmate Admins</h1>

                <Button
                    onClick={() => {
                        setSelectedAdmin(null);
                        setOpenAdmin(true);
                    }}
                    sx={{ bgcolor: "#3E6AB3", color: "#fff", display: "flex", gap: "0.5rem" }}
                >
                    <FaPlus />
                    Add Admin
                </Button>
            </div>

            <TableContainer component={Paper}>
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
                        {admins.map((admin) => (
                            <TableRow key={admin._id}>
                                <TableCell>{admin.username}</TableCell>
                                <TableCell>{admin.fullname}</TableCell>
                                <TableCell>
                                    {typeof admin.location_id === "object" && admin.location_id
                                        ? admin.location_id.name || admin.location_id.locationName || "N/A"
                                        : "N/A"}
                                </TableCell>
                                <TableCell>{admin.role}</TableCell>
                                <TableCell>
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

            <AddInmateAdminDialog
                open={openAdmin}
                setOpen={setOpenAdmin}
                handleSubmitAdmin={handleSubmitAdmin}
                selectedAdmin={selectedAdmin}
                setSelectedAdmin={setSelectedAdmin}
            />

            <ConfirmDialog
                open={confirmDelete.open}
                onCancel={() => setConfirmDelete({ open: false, admin: null })}
                onConfirm={confirmDeleteAdmin}
                title="Delete Admin"
                message={`Are you sure you want to delete ${confirmDelete.admin?.fullname}?`}
            />
        </div>
    );
};

export default InmateAdmins;
