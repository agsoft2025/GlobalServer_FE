import * as React from "react";
import { Box, Button, Typography, Dialog, DialogTitle, DialogContent } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";

type PaymentStatus = "SUCCESS" | "FAILED" | "PENDING";
type SubscriptionType = "MONTHLY" | "YEARLY" | "WEEKLY" | "DAILY";

type Location = {
  _id: string;
  name: string;
  baseUrl: string;
  location: string;
};

type StudentInfo = {
  _id: string;
  registration_number: string;
  student_name: string;
  mother_name: string;
  father_name: string;
  contact_number: string;
  date_of_birth: string;
  gender: "Male" | "Female" | "Other";
  nationality: string;
  blood_group: string;
  class_info: string;
  location_id: string;
  user_id: string;
};

export type LocationWiseStudentRow = {
  _id: string;
  student_id: string;
  location_id: string;
  subscription_type: SubscriptionType;
  amount: number;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  payment_status: PaymentStatus;
  is_active: boolean;
  start_date: string;
  expire_date: string;
  createdAt: string;
  updatedAt: string;
  __v: number;

  student_info: StudentInfo;
  location: Location;
};

export type LocationWiseStudentResponse = {
  success: boolean;
  count: number;
  total: number;
  page: number;
  limit: number;
  pages: number;
  data: LocationWiseStudentRow[];
};

type Props = {
  locationData: any;
  loading?: boolean;
  onRowClick?: (row: LocationWiseStudentRow) => void;
  setLocationID: React.Dispatch<React.SetStateAction<string>>;
  setStudentLocationId: React.Dispatch<React.SetStateAction<string>>;
  studentLocationId: string;
  studentLocationData: any;
  detailsPage: number;
  detailsPageSize: number;
  detailsTotalRows: number;
  onDetailsPageChange: (page: number) => void;
  onDetailsPageSizeChange: (pageSize: number) => void;
};

const formatDate = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString();
};

export default function LocationWiseStudentsGrid({
  locationData,
  loading = false,
  setLocationID,
  setStudentLocationId,
  studentLocationId,
  studentLocationData,
  detailsPage,
  detailsPageSize,
  detailsTotalRows,
  onDetailsPageChange,
  onDetailsPageSizeChange,
  onRowClick,
}: Props) {
  const rows = locationData?.data ?? [];

  console.log("studentLocationData:", studentLocationData);
  console.log("studentLocationData?.data:", studentLocationData?.data);
  console.log("Data array length:", studentLocationData?.data?.length);
  

  // Define columns for student location history dialog
  const historyColumns = React.useMemo<GridColDef<any>[]>(
    () => [
      {
        field: "student_info.student_name",
        headerName: "Student Name",
        flex: 1.2,
        minWidth: 150,
        valueGetter: (_, row) => row.student_info?.student_name ?? "-",
      },
      {
        field: "student_info.registration_number",
        headerName: "Reg No",
        flex: 1,
        minWidth: 120,
        valueGetter: (_, row) => row.student_info?.registration_number ?? "-",
      },
      {
        field: "subscription_type",
        headerName: "Subscription",
        flex: 0.8,
        minWidth: 100,
      },
      {
        field: "amount",
        headerName: "Amount",
        flex: 0.6,
        minWidth: 80,
        valueGetter: (_, row) => `₹${row.amount ?? 0}`,
      },
      {
        field: "payment_status",
        headerName: "Payment Status",
        flex: 0.8,
        minWidth: 120,
      },
      {
        field: "start_date",
        headerName: "Start Date",
        flex: 0.8,
        minWidth: 120,
        valueGetter: (_, row) => formatDate(row.start_date),
      },
      {
        field: "expire_date",
        headerName: "Expire Date",
        flex: 0.8,
        minWidth: 120,
        valueGetter: (_, row) => formatDate(row.expire_date),
      },
      {
        field: "location.name",
        headerName: "Location",
        flex: 1,
        minWidth: 120,
        valueGetter: (_, row) => row.location?.name ?? "-",
      },
    ],
    []
  );

  const columns = React.useMemo<GridColDef<LocationWiseStudentRow>[]>(
    () => [
      {
        field: "registration_number",
        headerName: "Reg No",
        flex: 1,
        minWidth: 120,
        valueGetter: (_, row) => row.student_info?.registration_number ?? "-",
      },
      {
        field: "student_name",
        headerName: "Student",
        flex: 1.2,
        minWidth: 160,
        valueGetter: (_, row) => row.student_info?.student_name ?? "-",
      },
      {
        field: "contact_number",
        headerName: "Contact",
        flex: 1,
        minWidth: 140,
        valueGetter: (_, row) => row.student_info?.contact_number ?? "-",
      },
      {
        field: "subscription_type",
        headerName: "Plan",
        flex: 0.8,
        minWidth: 120,
      },
      {
        field: "amount",
        headerName: "Amount",
        type: "number",
        flex: 0.7,
        minWidth: 100,
      },
      {
        field: "payment_status",
        headerName: "Payment",
        flex: 0.9,
        minWidth: 120,
      },
      {
        field: "is_active",
        headerName: "Active",
        flex: 0.6,
        minWidth: 90,
        valueGetter: (_, row) => (row.is_active ? "Yes" : "No"),
      },
      {
        field: "start_date",
        headerName: "Start",
        flex: 0.8,
        minWidth: 120,
        valueGetter: (_, row) => formatDate(row.start_date),
      },
      {
        field: "expire_date",
        headerName: "Expire",
        flex: 0.8,
        minWidth: 120,
        valueGetter: (_, row) => formatDate(row.expire_date),
      },
      {
        field: "location_name",
        headerName: "Location",
        flex: 1.2,
        minWidth: 160,
        valueGetter: (_, row) => row.location?.name ?? "-",
      },
      {
        field: "action",
        headerName: "Action",
        flex: 1,
        renderCell: (param: any)=>{
            return <button onClick={()=>setStudentLocationId(param?.row?.student_id)}>View</button>
        }
      }
    ],
    []
  );

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          Location Wise Students
        </Typography>

        <Button variant="outlined" onClick={()=>{setLocationID("");setStudentLocationId("")}}>Back</Button>
      </Box>

      <Box sx={{ height: 520, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row._id}
          loading={loading}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: locationData?.limit ?? 10,
                page: (locationData?.page ?? 1) - 1, // DataGrid uses 0-based page
              },
            },
          }}
          onRowClick={(params) => onRowClick?.(params.row)}
        />
      </Box>

      {/* Student Location History Dialog */}
      <Dialog 
        open={!!studentLocationId} 
        onClose={() => setStudentLocationId("")}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Student Location History</DialogTitle>
        <DialogContent>
          <Box sx={{ height: 400, width: "100%", mt: 2 }}>
            <DataGrid
              rows={studentLocationData?.data ?? []}
              columns={historyColumns}
              getRowId={(row) => row.razorpay_payment_id || row.razorpay_order_id || JSON.stringify(row)}
              loading={!studentLocationData}
              disableRowSelectionOnClick
              pageSizeOptions={[10, 25, 50]}
              paginationModel={{
                page: detailsPage - 1, // DataGrid uses 0-based page
                pageSize: detailsPageSize,
              }}
              onPaginationModelChange={(model) => {
                if (model.page !== detailsPage - 1) {
                  onDetailsPageChange(model.page + 1);
                }
                if (model.pageSize !== detailsPageSize) {
                  onDetailsPageSizeChange(model.pageSize);
                }
              }}
              rowCount={detailsTotalRows}
              paginationMode="server"
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
