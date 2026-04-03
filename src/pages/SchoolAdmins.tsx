import { useState, useEffect } from "react";
import AddSchoolAdminDialog from "../components/studentComponents/AddAdminDialog";
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TablePagination } from "@mui/material";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { createAdmin } from "../api/service/studentService";
import { getAdmins, deleteAdmin, updateAdmin, type Admin, type AdminQueryParams } from "../api/service/adminService";
import { ConfirmDialog } from "../components/common/ConfirmDialog";

const SchoolAdmins = () => {
    const [openAdmin, setOpenAdmin] = useState<boolean>(false);
    const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; admin: Admin | null }>({ open: false, admin: null });

    const fetchAdmins = async () => {
        try {
            const params: AdminQueryParams = {
                page: page + 1,
                limit: rowsPerPage,
            };
            const response = await getAdmins(params);
            setAdmins(response.data);
            setTotalItems(response.pagination.totalItems);
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
                // Update
                await updateAdmin(selectedAdmin._id, data);
            } else {
                // Create
                await createAdmin(data);
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
                            <TableCell>Role</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {admins.map((admin) => (
                            <TableRow key={admin._id}>
                                <TableCell>{admin.username}</TableCell>
                                <TableCell>{admin.fullname}</TableCell>
                                <TableCell>{admin.location?.name || "N/A"}</TableCell>
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
        </div>
    );
};

export default SchoolAdmins;