import { DataGrid, type GridColDef } from '@mui/x-data-grid';

type StudentDetailRecord = {
  _id: string;
  studentName: string;
  studentId: string;
  status: 'active' | 'inactive';
  lastSeen: string;
  location: string;
};

type StudentLocationTableProps = {
  rows: StudentDetailRecord[];
  page: number;
  pageSize: number;
  totalRows: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
};

export default function StudentLocationTable({
  rows,
  page,
  pageSize,
  totalRows,
  onPageChange,
  onPageSizeChange,
}: StudentLocationTableProps) {
  const columns: GridColDef<StudentDetailRecord>[] = [
    {
      field: 'studentName',
      headerName: 'Student Name',
      flex: 1.2,
      minWidth: 150,
    },
    {
      field: 'studentId',
      headerName: 'Student ID',
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.8,
      minWidth: 100,
      renderCell: (params) => (
        <span
          style={{
            color: params.value === 'active' ? '#4caf50' : '#f44336',
            fontWeight: 'bold',
          }}
        >
          {params.value.charAt(0).toUpperCase() + params.value.slice(1)}
        </span>
      ),
    },
    {
      field: 'location',
      headerName: 'Location',
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'lastSeen',
      headerName: 'Last Seen',
      flex: 1.2,
      minWidth: 160,
      valueGetter: (_, row) => new Date(row.lastSeen).toLocaleString(),
    },
  ];

  if (!rows.length) {
    return (
      <div style={{ width: '100%', height: 400 }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 440 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row._id}
        pagination
        pageSizeOptions={[5, 10, 25]}
        paginationModel={{
          page: page - 1, // DataGrid uses 0-based page
          pageSize: pageSize,
        }}
        onPaginationModelChange={(model) => {
          if (model.page !== page - 1) {
            onPageChange(model.page + 1);
          }
          if (model.pageSize !== pageSize) {
            onPageSizeChange(model.pageSize);
          }
        }}
        rowCount={totalRows}
        paginationMode="server"
        disableRowSelectionOnClick
        sortingMode="client"
      />
    </div>
  );
}


