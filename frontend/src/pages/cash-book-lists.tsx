import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import CancelIcon from "@mui/icons-material/Cancel";
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
  MenuItem,
  IconButton,
} from "@mui/material";

import { getOffCampuses } from "src/api/offCampus";
import {
  getCashBooks,
  createCashBook,
  updateCashBook,
  deleteCashBook,
  CashBookProps,
} from "src/api/cash-book";

export default function CashBooksListsPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [cashBooks, setCashBooks] = useState<CashBookProps[]>([]);
  const [offCampuses, setOffCampuses] = useState<any[]>([]);

  // Form states
  const [offCampus, setOffCampus] = useState("");
  const [name, setName] = useState("");

  // Edit states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingOffCampus, setEditingOffCampus] = useState("");
  const [editingName, setEditingName] = useState("");

  const fetchData = async () => {
    try {
      const [offCampusData, cashBookData] = await Promise.all([
        getOffCampuses(),
        getCashBooks(),
      ]);
      setOffCampuses(offCampusData);
      setCashBooks(cashBookData);
    } catch {
      enqueueSnackbar("Failed to fetch data", { variant: "error" });
    }
  };

  useEffect(() => {
    fetchData();
    const handleUpdate = () => fetchData();
    window.addEventListener("cashbook-update", handleUpdate);
    return () => window.removeEventListener("cashbook-update", handleUpdate);
  }, []);

  // Add new
  const handleAdd = async () => {
    if (!offCampus || !name) {
      enqueueSnackbar("Please fill all fields", { variant: "warning" });
      return;
    }
    try {
      await createCashBook({
        campus: Number(offCampus),
        name,
      });
      enqueueSnackbar("Cash Book added successfully!", { variant: "success" });
      setOffCampus("");
      setName("");
      fetchData();
    } catch {
      enqueueSnackbar("Failed to add Cash Book", { variant: "error" });
    }
  };

  // Update existing
  const handleUpdate = async (id: number) => {
    if (!editingOffCampus || !editingName) {
      enqueueSnackbar("Please fill all fields", { variant: "warning" });
      return;
    }
    try {
      await updateCashBook(id, {
        campus: Number(editingOffCampus),
        name: editingName,
      });
      enqueueSnackbar("Cash Book updated successfully!", { variant: "success" });
      setEditingId(null);
      fetchData();
    } catch {
      enqueueSnackbar("Failed to update Cash Book", { variant: "error" });
    }
  };

  // Delete
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this Cash Book?")) return;
    try {
      await deleteCashBook(id);
      enqueueSnackbar("Deleted successfully!", { variant: "success" });
      fetchData();
    } catch {
      enqueueSnackbar("Failed to delete", { variant: "error" });
    }
  };

  return (
    <>
      {/* Breadcrumb */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component="button" onClick={() => navigate("/settings")}>
          Settings
        </Link>
        <Typography>Cash Books</Typography>
      </Breadcrumbs>

      <Typography variant="h6" gutterBottom>
        Cash Books
      </Typography>

      {/* Add Form */}
      <Box sx={{ maxWidth: 700, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            p: 2,
            background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
            borderRadius: 2,
            boxShadow: 3,
            alignItems: "center",
          }}
        >
          <TextField
            select
            label="Campus Name"
            value={offCampus}
            onChange={(e) => setOffCampus(e.target.value)}
            size="small"
            sx={{ backgroundColor: "white", minWidth: 180 }}
          >
            {offCampuses.map((campus) => (
              <MenuItem key={campus.id} value={campus.id}>
                {campus.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Cash Book Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="small"
            sx={{ backgroundColor: "white", minWidth: 150 }}
          />

          <Button variant="contained" onClick={handleAdd}>
            + Cash Book
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ maxWidth: 700, boxShadow: 3, borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ textAlign: "center" }}>SL. No.</TableCell>
              <TableCell sx={{ textAlign: "center" }}>Campus Name</TableCell>
              <TableCell sx={{ textAlign: "center" }}>Cash Book Name</TableCell>
              <TableCell sx={{ textAlign: "center" }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {cashBooks.map((c, index) => (
              <TableRow key={c.id}>
                <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>

                {/* Campus Name */}
                <TableCell sx={{ textAlign: "center" }}>
                  {offCampuses.find((campus) => campus.id === c.campus)?.name || "N/A"}
                </TableCell>

                {/* Cash Book Name */}
                <TableCell sx={{ textAlign: "center" }}>
                  {editingId === c.id ? (
                    <TextField
                      type="text"
                      size="small"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      sx={{ backgroundColor: "white", minWidth: 120 }}
                    />
                  ) : (
                    c.name
                  )}
                </TableCell>

                {/* Actions */}
                <TableCell sx={{ textAlign: "center" }}>
                  {editingId === c.id ? (
                    <>
                      <IconButton size="small" color="primary" onClick={() => handleUpdate(c.id!)}>
                        <SaveIcon />
                      </IconButton>
                      <IconButton size="small" color="inherit" onClick={() => setEditingId(null)}>
                        <CancelIcon />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => {
                          setEditingId(c.id!);
                          setEditingOffCampus(c.campus!.toString());
                          setEditingName(c.name.toString());
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(c.id!)}>
                        <DeleteIcon />
                      </IconButton>
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