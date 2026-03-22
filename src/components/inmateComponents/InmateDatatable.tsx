import { DataGrid, type GridColDef, type GridPaginationModel } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import type { InmateLocationRecord } from "../../types/inmateTypes";

type LocationTableProps = {
  rows: InmateLocationRecord[];
  page: number;
  pageSize: number;
  totalRows: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  setInmateLocationId: React.Dispatch<React.SetStateAction<string>>,
  setSelectedLocation: any,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function LocationTable({
  rows,
  page,
  pageSize,
  totalRows,
  onPageChange,
  onPageSizeChange,
  setInmateLocationId,
  setSelectedLocation,
  setOpen
}: LocationTableProps) {
  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "location", headerName: "Location", flex: 1 },
    { field: "subscription_amount", headerName: "Subscription Amount", flex: 1 },
    { field: "total_inmates", headerName: "Total Inmates", flex: 1 },
    { field: "total_subscriptions", headerName: "Total Subscriptions", flex: 1 },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => (
        <div className="flex gap-2 items-center h-full">
          <Button size="small" sx={{ background: "#EF5675", color: "#fff" }} variant="contained"
            onClick={() => setInmateLocationId(params?.row._id)}
          >View</Button>
          <Button size="small" sx={{ background: "#3E6AB3", color: "#fff" }} variant="outlined"
            onClick={() => {setOpen(true);setSelectedLocation(params?.row)}}
          >Edit</Button>
        </div>
      ),
    },
  ];

  // Controlled pagination model
  const paginationModel: GridPaginationModel = { page: page - 1, pageSize };

  return (
    <div style={{ width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row._id}
        autoHeight
        rowCount={totalRows}
        paginationMode="server"
        paginationModel={paginationModel} // Controlled
        onPaginationModelChange={(model) => {
          // Convert DataGrid 0-indexed page to API 1-indexed
          if (model.page !== page - 1) onPageChange(model.page + 1);
          if (model.pageSize !== pageSize) onPageSizeChange(model.pageSize);
        }}
        disableRowSelectionOnClick
        isCellEditable={() => false}
        hideFooterSelectedRowCount
      />
    </div>
  );
}
