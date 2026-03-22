import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import type { SingleInmateRecord } from "../../types/inmateTypes";

type InmateLocationTableProps = {
    rows: SingleInmateRecord[];
    page: number;
    pageSize: number;
    totalRows: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
};

export default function InmateLocationTable({
    rows,
    page,
    pageSize,
    totalRows,
    onPageChange,
    onPageSizeChange,
}: InmateLocationTableProps) {
    const columns: GridColDef<SingleInmateRecord>[] = [
        {
            field: "inmateId",
            headerName: "Inmate ID",
            flex: 1,
            renderCell: (params) => {
                return <span>{params.row?.inmate_info?.inmateId ?? "-"}</span>;
            },
        },
        {
            field: "firstName",
            headerName: "First Name",
            flex: 1,
            renderCell: (params) => {
                return <span>{params.row?.inmate_info?.inmate_name ?? "-"}</span>;
            },
        },
        {
            field: "lastName",
            headerName: "Last Name",
            flex: 1,
            renderCell: (params) => {
                return <span>{params.row?.inmate_info?.inmate_lastName ?? "-"}</span>;
            },
        },
        {
            field: "custodyType",
            headerName: "Custody Type",
            flex: 1,
            renderCell: (params) => {
                return <span>{params.row?.inmate_info?.custodyType ?? "-"}</span>;
            },
        },
        {
            field: "cellNumber",
            headerName: "Cell Number",
            flex: 1,
            renderCell: (params) => {
                return <span>{params.row?.inmate_info.cellNumber ?? "-"}</span>;
            },
        },
        { field: "subscription_type", headerName: "Subscription Type", flex: 1 },
        { field: "subscription_months", headerName: "Months", flex: 1 },
        { field: "amount", headerName: "Amount (₹)", flex: 1 },
        { field: "payment_status", headerName: "Payment Status", flex: 1 },
        {
            field: "is_active",
            headerName: "Active",
            flex: 1,
            renderCell: (params) => {
                return <span>{params.row?.is_active ? "Yes" : "No"}</span>;
            },
        }
    ];

    return (
        <div style={{ width: "100%" }}>
            <DataGrid
                rows={rows}
                columns={columns}
                getRowId={(row) => row._id}
                autoHeight
                rowCount={totalRows}
                paginationMode="server"
                paginationModel={{ page: page - 1, pageSize }}
                onPaginationModelChange={(model) => {
                    onPageChange(model.page + 1);
                    onPageSizeChange(model.pageSize);
                }}
                disableRowSelectionOnClick
                isCellEditable={() => false}
                hideFooterSelectedRowCount
            />
        </div>
    );
}
