import { useState } from "react";
import AddSchoolAdminDialog from "../components/studentComponents/AddAdminDialog";
import { Button } from "@mui/material";
import { FaPlus } from "react-icons/fa";
import { createAdmin } from "../api/service/studentService";

type SchoolAdmin = {
    username: string;
    fullname: string;
};

const SchoolAdmins = () => {
    const [openAdmin, setOpenAdmin] = useState<boolean>(false);
    const [selectedAdmin, setSelectedAdmin] = useState<SchoolAdmin | null>(null);

    const handleSubmitAdmin = async (data: any) => {
        try {
           await createAdmin(data);

        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-semibold">School Admin</h1>

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

            {/* ✅ Dialog */}
            <AddSchoolAdminDialog
                open={openAdmin}
                setOpen={setOpenAdmin}
                handleSubmitAdmin={handleSubmitAdmin}
                selectedAdmin={selectedAdmin}
                setSelectedAdmin={setSelectedAdmin}
            />
        </div>
    );
};

export default SchoolAdmins;