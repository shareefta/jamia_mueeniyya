import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { Add, Edit, Delete, Search, } from "@mui/icons-material";
import {
  Box, Button, Card, Paper, Grid, IconButton, MenuItem, Select, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Typography, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Tooltip, InputAdornment,} from "@mui/material";

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
  const [filteredCashBooks, setFilteredCashBooks] = useState<CashBookProps[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

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

  useEffect(() => {
    if (!searchTerm) {
      setFilteredCashBooks(cashBooks);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredCashBooks(
        cashBooks.filter((cb) => cb.name.toLowerCase().includes(term))
      );
    }
  }, [searchTerm, cashBooks]);

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
    <Box sx={{ p: { xs: 1.5, sm: 3 } }}>
      <Card sx={{ borderRadius: 4, boxShadow: 5, p: { xs: 2, sm: 3 } }}>
        {/* Row 1: Heading + Search */}
        <Grid container spacing={2} alignItems="center" justifyContent="center">
          <Grid size={{ xs: 12, sm:6, md:4 }}>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Search Cash Books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                backgroundColor: "#fff",
                borderRadius: 2,
                boxShadow: 1,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm:6, md:8 }} textAlign="center">
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Cash Books – Jamia Mueeniyya
            </Typography>
          </Grid>
        </Grid>

        {/* Row 2: Campus selector + Add button */}
        <Grid
          container
          alignItems="center"
          spacing={1}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          <Grid>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, color: "text.secondary", mr: 1 }}
            >
              Select Campus:
            </Typography>
          </Grid>
          <Grid sx={{ flex: 1 }}>
            <Select
              value={selectedCampus || ""}
              onChange={(e) => setSelectedCampus(Number(e.target.value))}
              size="small"
              fullWidth
              sx={{
                backgroundColor: "#fff",
                borderRadius: 2,
                boxShadow: 1,
                minWidth: 220,
              }}
            >
              {campuses.map((campus) => (
                <MenuItem key={campus.id} value={campus.id}>
                  {campus.name}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          <Grid size={{ xs: 12, sm:'auto' }} textAlign="right">
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
                "&:hover": { background: "linear-gradient(135deg, #5b0db5 0%, #1f60d6 100%)" },
              }}
            >
              Cash Book
            </Button>
          </Grid>
        </Grid>

        {/* Row 3: Table */}
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 3,
            boxShadow: 3,
            overflowX: "auto",
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Cash Book Name</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  Edit
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  Delete
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredCashBooks.length > 0 ? (
                filteredCashBooks.map((cb, index) => (
                  <TableRow
                    key={cb.id}
                    sx={{
                      "&:hover": {
                        backgroundColor: "#f1f8ff",
                        transform: "scale(1.01)",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                      },
                      transition: "all 0.25s ease-in-out",
                    }}
                  >
                    <TableCell>{index + 1}</TableCell>

                    <TableCell>
                      <Link
                        to={`${getRolePrefix()}/transaction-list/${cb.id}`}
                        style={{
                          textDecoration: "none",
                          color: "#1b5e20",
                          fontWeight: 600,
                          fontSize: "1rem",
                        }}
                      >
                        {cb.name}
                      </Link>
                    </TableCell>

                    <TableCell align="center">
                      <Tooltip title="Edit Cash Book">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDialog(cb)}
                          sx={{
                            backgroundColor: "#e3f2fd",
                            "&:hover": { backgroundColor: "#bbdefb" },
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>

                    <TableCell align="center">
                      <Tooltip title="Delete Cash Book">
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(cb.id!)}
                          sx={{
                            backgroundColor: "#ffebee",
                            "&:hover": { backgroundColor: "#ffcdd2" },
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
                  <TableCell colSpan={4} align="center" sx={{ py: 3, color: "#777" }}>
                    No Cash Books found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editMode ? "Edit Cash Book" : "Add New Cash Book"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Cash Book Name"
            value={cashBookName}
            onChange={(e) => setCashBookName(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={editMode ? handleUpdate : handleCreate}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
              color: "white",
            }}
          >
            {editMode ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}