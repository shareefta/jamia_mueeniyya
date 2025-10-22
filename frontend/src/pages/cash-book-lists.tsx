import React, { useEffect, useState } from "react";

import { Add, Edit, Delete } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
} from "@mui/material";

import { getOffCampuses } from "../api/offCampus";
import {
  getCashBooks,
  createCashBook,
  updateCashBook,
  deleteCashBook,
  CashBookProps,
} from "../api/cash-book";

export default function CashBookListPage() {
  const [cashBooks, setCashBooks] = useState<CashBookProps[]>([]);
  const [campuses, setCampuses] = useState<any[]>([]);
 const [selectedCampus, setSelectedCampus] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [cashBookName, setCashBookName] = useState("");
  const [selectedCashBookId, setSelectedCashBookId] = useState<number | null>(null);

  // Fetch campuses & cashbooks
  useEffect(() => {
    fetchCampuses();
  }, []);

  useEffect(() => {
    if (selectedCampus) fetchCashBooks();
  }, [selectedCampus]);

  useEffect(() => {
    window.addEventListener("cashbook-update", fetchCashBooks);
    return () => window.removeEventListener("cashbook-update", fetchCashBooks);
  }, []);

  const fetchCampuses = async () => {
    const data = await getOffCampuses();
    setCampuses(data);
    if (data.length > 0) setSelectedCampus(data[0].id);
  };

  const fetchCashBooks = async () => {
    const data = await getCashBooks();
    const filtered = selectedCampus ? data.filter((cb: any) => cb.campus === selectedCampus) : data;
    setCashBooks(filtered);
  };

  const handleCreate = async () => {
    if (!cashBookName.trim() || !selectedCampus) return;
    await createCashBook({ name: cashBookName, campus: selectedCampus });
    setOpenDialog(false);
    setCashBookName("");
  };

  const handleUpdate = async () => {
    if (!selectedCashBookId || !cashBookName.trim()) return;
    await updateCashBook(selectedCashBookId, { name: cashBookName, campus: selectedCampus });
    setOpenDialog(false);
    setCashBookName("");
    setEditMode(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this Cash Book?")) {
      await deleteCashBook(id);
    }
  };

  const handleOpenDialog = (cashBook?: CashBookProps) => {
    if (cashBook) {
      setEditMode(true);
      setSelectedCashBookId(cashBook.id || null);
      setCashBookName(cashBook.name);
    } else {
      setEditMode(false);
      setCashBookName("");
      setSelectedCashBookId(null);
    }
    setOpenDialog(true);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Card sx={{ borderRadius: 3, boxShadow: 4, p: 2 }}>
        <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              Cash Books
            </Typography>
            <Select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(Number(e.target.value))}
              size="small"
              sx={{
                minWidth: 200,
                backgroundColor: "white",
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              {campuses.map((campus) => (
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
                "&:hover": {
                  background: "linear-gradient(135deg, #5b0db5 0%, #1f60d6 100%)",
                },
              }}
            >
              New Cash Book
            </Button>
          </Grid>
        </Grid>

        <TableContainer sx={{ borderRadius: 2, boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f6fa" }}>
                <TableCell sx={{ fontWeight: 600 }}>Sl. No.</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Cash Book Name</TableCell>
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
                      "&:hover": { backgroundColor: "#f1f2f6" },
                      transition: "0.3s",
                    }}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{cb.name}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit Cash Book">
                        <IconButton onClick={() => handleOpenDialog(cb)} color="primary">
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Delete Cash Book">
                        <IconButton onClick={() => handleDelete(cb.id!)} color="error">
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No Cash Books found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Create / Edit Dialog */}
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
