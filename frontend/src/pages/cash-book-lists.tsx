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

  const selectedCampusName =
    campuses.find((c) => c.id === selectedCampus)?.name || "Campus";

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 } }}>
      <Card sx={{ borderRadius: 4, boxShadow: 5, p: { xs: 2, sm: 3 } }}>
        {/* Search Bar */}
        <Box sx={{ mb: 2, maxWidth: 350 }}>
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
            sx={{ backgroundColor: "#fff", borderRadius: 2, boxShadow: 1 }}
          />
        </Box>
        
        {/* Header with Section Name and Dropdown */}
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexWrap="wrap"
          mb={2}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mr: 1,
            }}
          >
            Cash Books –
          </Typography>
          <Select
            value={selectedCampus || ""}
            onChange={(e) => setSelectedCampus(Number(e.target.value))}
            size="small"
            sx={{
              backgroundColor: "#fff",
              borderRadius: 2,
              boxShadow: 1,
              minWidth: 180,
              fontWeight: 600,
            }}
          >
            {campuses.map((campus) => (
              <MenuItem key={campus.id} value={campus.id}>
                {campus.name}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Table (without head row) */}
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 3,
            boxShadow: 3,
            overflowX: "auto",
          }}
        >
          <Table>
            <TableBody>
              {filteredCashBooks.length > 0 ? (
                filteredCashBooks.map((cb, index) => (
                  <TableRow
                    key={cb.id}
                    sx={{
                      "&:hover": {
                        backgroundColor: "#f1f8ff",
                      },
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    <TableCell sx={{ width: 50, fontWeight: 600 }}>
                      {index + 1}
                    </TableCell>

                    <TableCell
                      sx={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontWeight: 600,
                        position: "relative",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Link
                          to={`${getRolePrefix()}/transaction-list/${cb.id}`}
                          style={{
                            textDecoration: "none",
                            color: "#1b5e20",
                            fontWeight: 600,
                          }}
                        >
                          {cb.name}
                        </Link>

                        {/* Edit/Delete appear only on hover */}
                        <Box
                          sx={{
                            opacity: 0,
                            transition: "opacity 0.2s ease-in-out",
                            "&:hover": { opacity: 1 },
                            ml: 2,
                          }}
                        >
                          <Tooltip title="Edit">
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={(e) => {
                                e.preventDefault();
                                handleOpenDialog(cb);
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={(e) => {
                                e.preventDefault();
                                handleDelete(cb.id!);
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ py: 3, color: "#777" }}>
                    No Cash Books found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* + Cash Book Button (Bottom Right) */}
        <Box textAlign="right" mt={2}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #5b0db5 0%, #1f60d6 100%)",
              },
            }}
          >
            Cash Book
          </Button>
        </Box>
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