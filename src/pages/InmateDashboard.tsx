import { useEffect, useState } from "react";
import { createInmateLocation, getInmateLocationStats, getSingleInmateLocation, updateInmateLocation } from "../api/service/inmateService";
import type { InmateLocationRecord, InmateSummary, IPayload, SingleInmateRecord } from "../types/inmateTypes";
import SummaryCards from "../components/inmateComponents/SummaryCards";
import LocationTable from "../components/inmateComponents/InmateDatatable";
import InmateLocationTable from "../components/inmateComponents/Inmatelocationtable";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Alert } from "@mui/material";
import { FaLongArrowAltRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import GlobalLocationDialog from "../components/inmateComponents/AddLocationDialogBox";

export default function InmateDashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<InmateSummary | null>(null);
  const [rows, setRows] = useState<InmateLocationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [inmateLocationId, setInmateLocationId] = useState("");
  const [open, setOpen] = useState(false);
  const [seletedLocation, setSelectedLocation] = useState<any>(null);
  const [syncWarning, setSyncWarning] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  const [locationpage, setLocationPage] = useState(1);
  const [locationPageSize, locationSetPageSize] = useState(10);
  const [locationTotalRows, setLocationTotalRows] = useState(0);
  const [locationRows, setlocationRows] = useState<SingleInmateRecord[]>([]);

  useEffect(() => {
    fetchData(page, pageSize);
  }, [page, pageSize]);

  useEffect(() => {
    if (inmateLocationId) fetchInmateLocationData(locationpage, locationPageSize)
  }, [inmateLocationId, locationPageSize, locationpage])

  async function fetchData(page: number, limit: number) {
    try {
      setLoading(true);
      const response = await getInmateLocationStats(page, limit);
      setSummary(response.summary);
      setRows(response.data);
      setTotalRows(response.pagination.total);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchInmateLocationData(page: number, limit: number) {
    try {
      setLoading(true);
      const response: any = await getSingleInmateLocation(page, limit, inmateLocationId);

      setlocationRows(response.data);         // array of SingleInmateRecord
      setLocationTotalRows(response.total);   // total number of rows
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (data: IPayload) => {
    try {
      if (seletedLocation?._id) {
        await updateInmateLocation({...data, _id: seletedLocation?._id});
      } else {
        const created = await createInmateLocation(data);
        if (created.locationSync?.status === "failed") {
          setSyncWarning(created.locationSync.message);
        }
      }
      await fetchData(page, pageSize);
    } catch (error) {
      console.log(error)
    }finally{
      setSelectedLocation(null);
    }

  }

  return (
    <div className="p-6">
      {summary && <SummaryCards summary={summary} />}
      {loading && !inmateLocationId && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
      {!loading && !inmateLocationId &&
        <>
          <div className="flex items-center justify-between mb-3">
            <h1>Inmate Location Table</h1>
            <div className="flex items-center gap-2">
              <Button variant="contained" color="success" onClick={() => setOpen(true)}>Create New Location</Button>
              <Button
                variant="contained"
                sx={{ bgcolor: "#3E6AB3", color: "#fff", display: "flex", gap: "0.5rem" }}
                onClick={() => navigate("admin")}
              >Admin <FaLongArrowAltRight /></Button>
            </div>
          </div>
          <LocationTable
            rows={rows}
            page={page}
            pageSize={pageSize}
            totalRows={totalRows}
            onPageChange={(newPage) => setPage(newPage)}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1); // reset to first page
            }}
            setInmateLocationId={setInmateLocationId}
            setSelectedLocation={setSelectedLocation}
            setOpen={setOpen}
          />
        </>}
      {inmateLocationId &&
        <>
          <div className="flex items-center justify-between mb-3">
            <h1>Inmate Detailed Table</h1>
            <Button variant="contained" color="error" onClick={() => setInmateLocationId("")}>View All Location</Button>
          </div>
          <InmateLocationTable
            rows={locationRows}
            page={locationpage}
            pageSize={locationPageSize}
            totalRows={locationTotalRows}
            onPageChange={(newPage) => setLocationPage(newPage)}
            onPageSizeChange={(newSize) => {
              locationSetPageSize(newSize);
              setLocationPage(1); // reset page to 1 when pageSize changes
            }}
          />
        </>
      }

      <GlobalLocationDialog open={open} setOpen={setOpen} handleLocationSubmit={handleSubmit} seletedLocation={seletedLocation} setSelectedLocation={setSelectedLocation} />

      <Dialog open={!!syncWarning} onClose={() => setSyncWarning(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Location Created</DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            The location was created, but it could not be synced to the local
            server{syncWarning ? `: ${syncWarning}` : ""}. It may not appear in
            the Add Admin dropdown until the next edit re-syncs it.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSyncWarning(null)} variant="contained">
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
