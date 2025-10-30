import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { Add, Edit, Delete } from "@mui/icons-material";
import {
  Box, Button, Card, Paper, Grid, IconButton, MenuItem, Select, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Typography, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Tooltip,} from "@mui/material";

import { getOffCampuses } from "../api/offCampus";
import {
  getCashBooks,
  createCashBook,
  updateCashBook,
  deleteCashBook,
  CashBookProps,
} from "../api/cash-book";

export default function CashBookListPage() {
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();

  const [cashBooks, setCashBooks] = useState<CashBookProps[]>([]);
  const [campuses, setCampuses] = useState<any[]>([]);
  const [selectedCampus, setSelectedCampus] = useState<number | null>(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [cashBookName, setCashBookName] = useState("");
  const [selectedCashBookId, setSelectedCashBookId] = useState<number | null>(null);

  const getRolePrefix = () => {
    const role = localStorage.getItem('userRole');
    return role?.toLowerCase() === 'staff' ? '/staff' : '';
  };

  // Extract campusId from URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const campusId = params.get("campus");
    if (campusId) {
      setSelectedCampus(Number(campusId));
    }
  }, [location.search]);

  // Fetch campuses & cashbooks
  useEffect(() => {
    fetchCampuses();
  }, []);

  useEffect(() => {
    if (selectedCampus) fetchCashBooks();
  }, [selectedCampus]);

  const fetchCampuses = async () => {
    try {
      const data = await getOffCampuses();
      setCampuses(data);
      // Only set default if selectedCampus is not already from query param
      if (data.length > 0 && !selectedCampus) {
        setSelectedCampus(data[0].id);
      }
    } catch {
      enqueueSnackbar("Failed to fetch campuses", { variant: "error" });
    }
  };

  const fetchCashBooks = async () => {
    if (!selectedCampus) return;
    try {
      const data = await getCashBooks();
      const filtered = data.filter((cb: CashBookProps) => cb.campus === selectedCampus);
      setCashBooks(filtered);
    } catch {
      enqueueSnackbar("Failed to fetch cash books", { variant: "error" });
    }
  };

  // Create cash book
  const handleCreate = async () => {
    if (!cashBookName.trim() || !selectedCampus) return;
    try {
      await createCashBook({ name: cashBookName, campus: selectedCampus });
      enqueueSnackbar("Cash Book created successfully!", { variant: "success" });
      setCashBookName("");
      setOpenDialog(false);
      fetchCashBooks();
    } catch {
      enqueueSnackbar("Failed to create Cash Book", { variant: "error" });
    }
  };

  // Update cash book
  const handleUpdate = async () => {
    if (!selectedCashBookId || !cashBookName.trim() || !selectedCampus) return;
    try {
      await updateCashBook(selectedCashBookId, { name: cashBookName, campus: selectedCampus });
      enqueueSnackbar("Cash Book updated successfully!", { variant: "success" });
      setCashBookName("");
      setEditMode(false);
      setOpenDialog(false);
      fetchCashBooks();
    } catch {
      enqueueSnackbar("Failed to update Cash Book", { variant: "error" });
    }
  };

  // Delete cash book
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this Cash Book?")) return;

    try {
      const res = await deleteCashBook(id);
      // If backend returned success
      enqueueSnackbar(res.success || "Cash Book deleted successfully", { variant: "success" });

      // Update table locally
      setCashBooks(prev => prev.filter(cb => cb.id !== id));
    } catch (error: any) {
      // Backend error: show message
      enqueueSnackbar(error.message || "Failed to delete Cash Book", { variant: "error" });
    }
  };

  const handleOpenDialog = (cb?: CashBookProps) => {
    if (cb) {
      setEditMode(true);
      setSelectedCashBookId(cb.id || null);
      setCashBookName(cb.name);
    } else {
      setEditMode(false);
      setSelectedCashBookId(null);
      setCashBookName("");
    }
    setOpenDialog(true);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Card sx={{ borderRadius: 3, boxShadow: 4, p: 2 }}>
        <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 2 }} spacing={2}>
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Typography variant="h6" fontWeight={600}>
              Cash Books
            </Typography>
            <Select
              value={selectedCampus || ""}
              onChange={e => setSelectedCampus(Number(e.target.value))}
              size="small"
              sx={{ minWidth: 200, backgroundColor: "white", borderRadius: 2 }}
            >
              {campuses.map(campus => (
                <MenuItem key={campus.id} value={campus.id}>
                  {campus.name}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          <Grid size={{ xs: "auto" }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{
                background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
                color: "white",
                textTransform: "none",
                borderRadius: 2,
                "&:hover": { background: "linear-gradient(135deg, #5b0db5 0%, #1f60d6 100%)" },
              }}
            >
              New Cash Book
            </Button>
          </Grid>
        </Grid>

        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f6fa" }}>
                <TableCell sx={{ fontWeight: 600 }}>Sl. No.</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Cash Book</TableCell>
                <TableCell sx={{ textAlign: "center", fontWeight: 600 }}>Edit</TableCell>
                <TableCell sx={{ textAlign: "center", fontWeight: 600 }}>Delete</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {cashBooks.length > 0 ? (
                cashBooks.map((cb, index) => (
                  <TableRow
                    key={cb.id}
                    sx={{
                      "&:hover": {
                        backgroundColor: "#f1f8e9",
                        transform: "scale(1.01)",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                        "& .action-icons": { visibility: "visible" }, // show icons on hover
                      },
                      transition: "all 0.25s ease-in-out",
                      height: "50px",
                    }}
                  >
                    <TableCell
                      sx={{ fontWeight: 500, color: "#424242", py: 0.8, px: 1.5, width: "60px" }}
                    >
                      {index + 1}
                    </TableCell>

                    <TableCell sx={{ py: 0.8, px: 1.5 }}>
                      <Link
                        to={`${getRolePrefix()}/transaction-list/${cb.id}`}
                        style={{
                          textDecoration: "none",
                          color: "#1b5e20",
                          fontWeight: 700,
                          fontSize: "1rem",
                        }}
                      >
                        {cb.name}
                      </Link>
                    </TableCell>

                    <TableCell align="center" sx={{ py: 0.8, px: 1, width: "60px" }}>
                      <Tooltip title="Edit Cash Book">
                        <IconButton
                          onClick={() => handleOpenDialog(cb)}
                          color="primary"
                          size="small"
                          className="action-icons"
                          sx={{
                            backgroundColor: "#e3f2fd",
                            "&:hover": { backgroundColor: "#bbdefb" },
                            transition: "0.2s",
                            visibility: "hidden", // hidden by default
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>

                    <TableCell align="center" sx={{ py: 0.8, px: 1, width: "60px" }}>
                      <Tooltip title="Delete Cash Book">
                        <IconButton
                          onClick={() => handleDelete(cb.id!)}
                          color="error"
                          size="small"
                          className="action-icons"
                          sx={{
                            backgroundColor: "#ffebee",
                            "&:hover": { backgroundColor: "#ffcdd2" },
                            transition: "0.2s",
                            visibility: "hidden", // hidden by default
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3, color: "#757575" }}>
                    No Cash Books found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Dialog for Create/Edit */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editMode ? "Edit Cash Book" : "Add New Cash Book"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Cash Book Name"
            value={cashBookName}
            onChange={e => setCashBookName(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={editMode ? handleUpdate : handleCreate}
            variant="contained"
            sx={{ background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)", color: "white" }}
          >
            {editMode ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
