import { DataGrid, type GridColDef, type GridPaginationModel } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import { IoEye } from "react-icons/io5";
import { Delete, Edit } from "@mui/icons-material";
import { deleteLocation } from "../../api/service/studentService";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { useState } from "react";

type StudentDataTableProps = {
  rows: any[];
  page: number;
  pageSize: number;
  totalRows: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  setStudentLocationId: (id: string) => void;
  setSelectedLocation: (location: any) => void;
  setOpen: (open: boolean) => void;
  onRefresh: () => void;
};

export default function StudentDataTable({
  rows,
  page,
  pageSize,
  totalRows,
  onPageChange,
  onPageSizeChange,
  setStudentLocationId,
  setSelectedLocation,
  setOpen,
  onRefresh,
}: StudentDataTableProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "School Name",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "location",
      headerName: "Location",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "baseUrl",
      headerName: "Base URL",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "amount",
      headerName: "Amount",
      minWidth: 30,
    },
    {
      field: "total_revenue",
      headerName: "Revenue",
      type: "number",
      align: "right",
      headerAlign: "right",
      flex: 1,
    },
    {
      field: "total_subscribers",
      headerName: "Subscribers",
      type: "number",
      align: "right",
      headerAlign: "right",
      flex: 1,
    },
    {
      field: "active_subscribers",
      headerName: "Subscribers",
      type: "number",
      align: "right",
      headerAlign: "right",
      flex: 1,
    },
    {
      field: "expired_subscribers",
      headerName: "Expired Subscribers",
      type: "number",
      align: "right",
      headerAlign: "right",
      flex: 1,
    },
    {
      field: "updatedAt",
      headerName: "Last Updated",
      flex: 1,
      valueFormatter: (params) => new Date(params).toLocaleDateString(),
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      filterable: false,
      width: 170,
      renderCell: (params) => (
        <div style={{ display: 'flex', gap: '16px', alignItems: "center", height: "100%" }}>
          <Button
            size="small"
            variant="contained"
            sx={{ bgcolor: "#EF5675", minWidth: 'auto', padding: '4px 8px' }}
            onClick={(e) => {
              e.stopPropagation();
              setStudentLocationId(params.row.location_id);
            }}
          >
            <IoEye style={{ width: '20px', height: '20px' }} />
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedLocation(params.row);
              setOpen(true);
            }}
            sx={{ bgcolor: "#3E6AB3", color: "#fff", minWidth: 'auto', padding: '4px 8px' }}
          >
            <Edit style={{ width: '20px', height: '20px' }} />
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmDialog({
                open: true,
                title: 'Delete Location',
                message: `Are you sure you want to delete "${params.row.name}"? This action cannot be undone.`,
                onConfirm: async () => {
                  setIsDeleting(true);
                  try {
                    await deleteLocation(params?.row);
                    onRefresh();
                    setConfirmDialog({ ...confirmDialog, open: false });
                  } catch (error) {
                    console.error('Error deleting location:', error);
                  } finally {
                    setIsDeleting(false);
                  }
                },
              });
            }}
            sx={{ minWidth: 'auto', padding: '4px 8px' }}
          >
            <Delete style={{ width: '20px', height: '20px' }} />
          </Button>
        </div>
      ),
    },
  ];

  // Convert page to 0-based index for DataGrid
  const paginationModel: GridPaginationModel = {
    page: page - 1,
    pageSize
  };

  return (
    <>
      <div style={{ width: "100%", height: 600 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row._id}
          autoHeight
          rowCount={totalRows}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={(model) => {
            // Convert DataGrid 0-indexed page to API 1-indexed
            if (model.page !== page - 1) onPageChange(model.page + 1);
            if (model.pageSize !== pageSize) onPageSizeChange(model.pageSize);
          }}
          disableRowSelectionOnClick
          isCellEditable={() => false}
          hideFooterSelectedRowCount
          sortingMode="server"
          disableColumnMenu
          disableColumnFilter
          disableColumnSelector
        />
      </div>
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, open: false })}
        loading={isDeleting}
      />
    </>
  );
}