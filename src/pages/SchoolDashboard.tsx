import { useEffect, useState } from 'react';
import {
  getStudentLocationStats,
  getSingleStudentLocation,
  createStudentLocation,
  type StudentLocationStats,
  getLocationWiseData,
  updateLocation,
} from '../api/service/studentService';
import type { StudentSummary, StudentLocationRecord, IPayload, LocationWiseStudentResponse } from '../types/studentTypes';
import SummaryCards from '../components/studentComponents/SummaryCards';
import StudentDataTable from '../components/studentComponents/StudentDataTable';
import AddLocationDialog from '../components/studentComponents/AddLocationDialog';
import LocationWiseStudentsGrid from '../components/studentComponents/LocationWiseStudentsGrid';

const SchoolDashboard = () => {

  const [summary, setSummary] = useState<StudentSummary | null>(null);
  const [rows, setRows] = useState<StudentLocationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentLocationId, setStudentLocationId] = useState("");
  const [locationID, setLocationID] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<StudentLocationRecord | null>(null);

  // Pagination for location table
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  // Pagination for student details table
  const [detailsPage, setDetailsPage] = useState(1);
  const [detailsPageSize, setDetailsPageSize] = useState(10);
  const [detailsTotalRows, setDetailsTotalRows] = useState(0);
  const [studentRows, setStudentRows] = useState<any>(null);
  const [locationData, setLocationData] =
    useState<LocationWiseStudentResponse | null>(null);

  // Fetch location data
  useEffect(() => {
    fetchData(page, pageSize);
  }, [page, pageSize]);

  // Fetch student details when location is selected
  useEffect(() => {
    if (studentLocationId) {
      fetchStudentLocationData(detailsPage, detailsPageSize);
    }
  }, [studentLocationId, detailsPage, detailsPageSize]);

  useEffect(() => {
    if (!locationID) return;

    getLocationWiseData(1, 10, locationID)
      .then((res) => {
        setLocationData(res);
      })
      .catch((err) => {
        console.error("Failed to fetch location wise data", err);
      });
  }, [locationID]);


  async function fetchData(page: number, limit: number) {
    try {
      setLoading(true);
      const response: StudentLocationStats = await getStudentLocationStats(page, limit);

      setSummary({
        totalLocations: response.summary.total_schools || 0,
        totalStudents: response.summary.total_students || 0,
        activeStudents: response.summary.active_subscribers || 0,
        inactiveStudents: response.summary.expired_subscribers || 0
      });
      // Ensure all required fields are present in the data
      const formattedData = response.data.map(item => ({
        ...item,
        status: 'status' in item ? item.status : 'active',
      }));
      setRows(formattedData);
      setTotalRows(response.pagination.total);
    } catch (error) {
      console.error("Error fetching student location stats:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStudentLocationData(page: number, limit: number) {
    if (!studentLocationId) return;

    try {
      setLoading(true);
      const response = await getSingleStudentLocation(page, limit, studentLocationId);
      setStudentRows(response); // Store the full response object
      setDetailsTotalRows(response.total);
    } catch (error) {
      console.error("Error fetching student location details:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (data: IPayload) => {
    try {
      if (selectedLocation?._id) {

        await updateLocation({ ...data, _id: selectedLocation.externalId  });
      } else {
        await createStudentLocation(data);
      }
      // Refresh data
      fetchData(page, pageSize);
    } catch (error) {
      console.error("Error submitting location:", error);
    } finally {
      setSelectedLocation(null);
    }
  };

  return (
    <div className="p-6">
      {summary && <SummaryCards summary={summary} />}

      {loading && !studentLocationId && !locationID && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {!loading && !studentLocationId && !locationID && (
        <>
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-semibold">Student Location Management</h1>
            {/* <Button
              variant="contained"
              color="primary"
              sx={{bgcolor: "#3E6AB3"}}
              onClick={() => setOpen(true)}
            >
              Add New Location
            </Button> */}
          </div>

          <StudentDataTable
            rows={rows}
            page={page}
            pageSize={pageSize}
            totalRows={totalRows}
            onPageChange={(newPage) => setPage(newPage)}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1); // Reset to first page
            }}
            setStudentLocationId={setLocationID}
            setSelectedLocation={setSelectedLocation}
            setOpen={setOpen}
            onRefresh={() => fetchData(page, pageSize)}
          />
        </>
      )}

      {locationID && <LocationWiseStudentsGrid
        locationData={locationData}
        loading={loading}
        setLocationID={setLocationID}
        setStudentLocationId={setStudentLocationId}
        studentLocationId={studentLocationId}
        studentLocationData={studentRows}
        detailsPage={detailsPage}
        detailsPageSize={detailsPageSize}
        detailsTotalRows={detailsTotalRows}
        onDetailsPageChange={setDetailsPage}
        onDetailsPageSizeChange={setDetailsPageSize}
        onRowClick={(row: any) => console.log("clicked row:", row)}
      />}

      <AddLocationDialog
        open={open}
        setOpen={setOpen}
        handleLocationSubmit={handleSubmit}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
      />
    </div>
  )
}

export default SchoolDashboard