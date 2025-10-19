import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Breadcrumbs,
  Link,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
} from "@mui/material";

import {
    OffCampus,
    getOffCampuses,
    createOffCampus,
    updateOffCampus,
    deleteOffCampus,
} from "src/api/offCampus";

export default function OffCampusPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [offCampuses, setOffCampuses] = useState<OffCampus[]>([]);

  // New OffCampus states
  const [newOffCampusName, setNewOffCampusName] = useState("");
  const [newOffCampusAddress, setNewOffCampusAddress] = useState("");
  const [newOffCampusContactNumber, setNewOffCampusContactNumber] = useState("");
  const [newOffCampusEmail, setNewOffCampusEmail] = useState("");

  // Edit states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingOffCampusName, setEditingOffCampusName] = useState("");
  const [editingOffCampusAddress, setEditingOffCampusAddress] = useState("");
  const [editingOffCampusContactNumber, setEditingOffCampusContactNumber] = useState("");
  const [editingOffCampusEmail, setEditingOffCampusEmail] = useState("");

  // Fetchers
  const fetchOffCampuses = async () => {
    try {
      const offCampusData = await getOffCampuses();
      setOffCampuses(offCampusData);
    } catch {
      enqueueSnackbar("Failed to fetch off-campuses", { variant: "error" });
    }
  };

  useEffect(() => {
    fetchOffCampuses();

    // ✅ Listen for offcampus updates
    const handleUpdateEvent = () => fetchOffCampuses();
    window.addEventListener('offcampus-update', handleUpdateEvent);

    return () => {
      window.removeEventListener('offcampus-update', handleUpdateEvent);
    };
  }, []);

  // Handlers
  const handleAdd = async () => {
    if (!newOffCampusName || !newOffCampusAddress || !newOffCampusContactNumber) {
      enqueueSnackbar("Please fill all required fields", { variant: "warning" });
      return;
    }
    try {
      await createOffCampus({
        name: newOffCampusName,
        address: newOffCampusAddress,
        contact_number: newOffCampusContactNumber,
        email: newOffCampusEmail,
      });
      enqueueSnackbar("Off-campus added successfully!", { variant: "success" });
      // reset
      setNewOffCampusName("");
      setNewOffCampusAddress("");
      setNewOffCampusContactNumber("");
      setNewOffCampusEmail("");
    } catch {
      enqueueSnackbar("Failed to add off-campus", { variant: "error" });
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editingOffCampusName || !editingOffCampusAddress || !editingOffCampusContactNumber) {
      enqueueSnackbar("Please fill all required fields", { variant: "warning" });
      return;
    }
    try {
      await updateOffCampus(id, {
        name: editingOffCampusName,
        address: editingOffCampusAddress,
        contact_number: editingOffCampusContactNumber,
        email: editingOffCampusEmail,
      });
      enqueueSnackbar("Off-campus updated successfully!", { variant: "success" });
      setEditingId(null);
      setEditingOffCampusName("");
      setEditingOffCampusAddress("");
      setEditingOffCampusContactNumber("");
      setEditingOffCampusEmail("");
    } catch {
      enqueueSnackbar("Failed to update off-campus", { variant: "error" });
    }
  }; 

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this Off-Campus?")) return;
    try {
      await deleteOffCampus(id);
      enqueueSnackbar("Off-Campus deleted successfully!", { variant: "success" });
      fetchOffCampuses();
    } catch {
      enqueueSnackbar("Failed to delete Off-Campus", { variant: "error" });
    }
  };

  return (
    <>
      {/* Breadcrumb */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component="button" onClick={() => navigate("/settings")}>
          Settings
        </Link>
        <Typography>Off-Campus</Typography>
      </Breadcrumbs>

      <Typography variant="h6" gutterBottom>
        Off-Campus
      </Typography>
      
      <Box sx={{ maxWidth: 1400, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            p: 2,
            background: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
            borderRadius: 2,
            boxShadow: 3,
            alignItems: "center",
          }}
        >
          <TextField
            label="Off-Campus Name"
            value={newOffCampusName}
            onChange={(e) => setNewOffCampusName(e.target.value)}
            size="small"
            sx={{ backgroundColor: "white" }}
          />          
          <TextField
            label="Address"
            value={newOffCampusAddress}
            onChange={(e) => setNewOffCampusAddress(e.target.value)}
            size="small"
            sx={{ backgroundColor: "white" }}
          />
          <TextField
            label="Contact Number"
            value={newOffCampusContactNumber}
            onChange={(e) => setNewOffCampusContactNumber(e.target.value)}
            size="small"
            sx={{ backgroundColor: "white" }}
          />
          <TextField
            label="Email"
            value={newOffCampusEmail}
            onChange={(e) => setNewOffCampusEmail(e.target.value)}
            size="small"
            sx={{ backgroundColor: "white" }}
          />          
          <Button variant="contained" onClick={handleAdd}>
            Add Off-Campus
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ maxWidth: 1400, boxShadow: 3, borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ textAlign: "center" }}>SL No</TableCell>
              <TableCell sx={{ textAlign: "center" }}>Off-Campus Name</TableCell>
              <TableCell sx={{ textAlign: "center" }}>Address</TableCell>
              <TableCell sx={{ textAlign: "center" }}>Contact Number</TableCell>
              <TableCell sx={{ textAlign: "center" }}>Email</TableCell>
              <TableCell sx={{ textAlign: "center" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {offCampuses.map((offCampus, index) => (
              <TableRow key={offCampus.id}>
                <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>

                {/* Name */}
                <TableCell>
                  {editingId === offCampus.id ? (
                    <TextField
                      value={editingOffCampusName}
                      onChange={(e) => setEditingOffCampusName(e.target.value)}
                      size="small"
                      sx={{ backgroundColor: "white", minWidth: 200 }}
                    />
                  ) : (
                    offCampus.name
                  )}
                </TableCell>

                {/* Building */}
                <TableCell sx={{ textAlign: "center" }}>
                  {editingId === offCampus.id ? (
                    <TextField
                      value={editingOffCampusAddress}
                      size="small"
                      onChange={(e) => setEditingOffCampusAddress(e.target.value)}
                      sx={{ backgroundColor: "white" }}
                    />
                  ) : (
                    offCampus.address || "—"
                  )}
                </TableCell>

                {/* Street */}
                <TableCell sx={{ textAlign: "center" }}>
                  {editingId === offCampus.id ? (
                    <TextField
                      value={editingOffCampusContactNumber}
                      size="small"
                      onChange={(e) => setEditingOffCampusContactNumber(e.target.value)}
                      sx={{ backgroundColor: "white" }}
                    />
                  ) : (
                    offCampus.contact_number || "—"
                  )}
                </TableCell>

                {/* Zone */}
                <TableCell sx={{ textAlign: "center" }}>
                  {editingId === offCampus.id ? (
                    <TextField
                      value={editingOffCampusEmail}
                      size="small"
                      onChange={(e) => setEditingOffCampusEmail(e.target.value)}
                      sx={{ backgroundColor: "white" }}
                    />
                  ) : (
                    offCampus.email || "—"
                  )}
                </TableCell>

                {/* Actions */}
                <TableCell sx={{ textAlign: "center" }}>
                  {editingId === offCampus.id ? (
                    <>
                      <Button size="small" onClick={() => handleUpdate(offCampus.id)}>
                        Save
                      </Button>
                      <Button size="small" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="small"
                        onClick={() => {
                          setEditingId(offCampus.id);
                          setEditingOffCampusName(offCampus.name);
                          setEditingOffCampusAddress(offCampus.address || "");
                          setEditingOffCampusContactNumber(offCampus.contact_number || "");
                          setEditingOffCampusEmail(offCampus.email || "");
                        }}
                      >
                        Edit
                      </Button>
                      <Button size="small" color="error" onClick={() => handleDelete(offCampus.id)}>
                        Delete
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}