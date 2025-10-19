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
  MenuItem,
} from "@mui/material";

import { getOffCampuses } from "src/api/offCampus";
import {
  getOpeningBalances,
  createOpeningBalance,
  updateOpeningBalance,
  deleteOpeningBalance,
  OpeningBalanceProps,
} from "src/api/opening-balances";

export default function OpeningBalancesPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [balances, setBalances] = useState<OpeningBalanceProps[]>([]);
  const [campuses, setCampuses] = useState<any[]>([]);

  // Form states
  const [campus, setCampus] = useState("");
  const [amount, setAmount] = useState("");

  // Edit states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingCampus, setEditingCampus] = useState("");
  const [editingAmount, setEditingAmount] = useState("");

  const fetchData = async () => {
    try {
      const [balanceData, campusData] = await Promise.all([
        getOpeningBalances(),
        getOffCampuses(),
      ]);
      setBalances(balanceData);
      setCampuses(campusData);
    } catch {
      enqueueSnackbar("Failed to fetch data", { variant: "error" });
    }
  };

  useEffect(() => {
    fetchData();
    const handleUpdate = () => fetchData();
    window.addEventListener("openingbalance-update", handleUpdate);
    return () => window.removeEventListener("openingbalance-update", handleUpdate);
  }, []);

  // Add new
  const handleAdd = async () => {
    if (!campus || !amount) {
      enqueueSnackbar("Please fill all fields", { variant: "warning" });
      return;
    }
    try {
      await createOpeningBalance({
        campus: Number(campus),
        amount: Number(amount),
      });
      enqueueSnackbar("Opening Balance added successfully!", { variant: "success" });
      setCampus("");
      setAmount("");
      fetchData();
    } catch {
      enqueueSnackbar("Failed to add Opening Balance", { variant: "error" });
    }
  };

  // Update existing
  const handleUpdate = async (id: number) => {
    if (!editingCampus || !editingAmount) {
      enqueueSnackbar("Please fill all fields", { variant: "warning" });
      return;
    }
    try {
      await updateOpeningBalance(id, {
        campus: Number(editingCampus),
        amount: Number(editingAmount),
      });
      enqueueSnackbar("Opening Balance updated successfully!", { variant: "success" });
      setEditingId(null);
      fetchData();
    } catch {
      enqueueSnackbar("Failed to update Opening Balance", { variant: "error" });
    }
  };

  // Delete
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this Opening Balance?")) return;
    try {
      await deleteOpeningBalance(id);
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
        <Typography>Opening Balances</Typography>
      </Breadcrumbs>

      <Typography variant="h6" gutterBottom>
        Opening Balances
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
            label="Campus"
            value={campus}
            onChange={(e) => setCampus(e.target.value)}
            size="small"
            sx={{ backgroundColor: "white", minWidth: 180 }}
          >
            {campuses.map((c) => {
              const isDisabled = balances.some((b) => b.campus === c.id);
              return (
                <MenuItem key={c.id} value={c.id} disabled={isDisabled}>
                  {c.name} {isDisabled && "(Already Added)"}
                </MenuItem>
              );
            })}
          </TextField>

          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            size="small"
            sx={{ backgroundColor: "white", minWidth: 150 }}
          />

          <Button variant="contained" onClick={handleAdd}>
            + Opening Balance
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ maxWidth: 700, boxShadow: 3, borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ textAlign: "center" }}>SL. No.</TableCell>
              <TableCell sx={{ textAlign: "center" }}>Campus</TableCell>
              <TableCell sx={{ textAlign: "center" }}>Amount</TableCell>
              <TableCell sx={{ textAlign: "center" }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {balances.map((b, index) => (
              <TableRow key={b.id}>
                <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>

                {/* Campus */}
                <TableCell sx={{ textAlign: "center" }}>
                  {campuses.find((c) => c.id === b.campus)?.name || b.campus}
                </TableCell>

                {/* Amount */}
                <TableCell sx={{ textAlign: "center" }}>
                  {editingId === b.id ? (
                    <TextField
                      type="number"
                      size="small"
                      value={editingAmount}
                      onChange={(e) => setEditingAmount(e.target.value)}
                      sx={{ backgroundColor: "white", minWidth: 120 }}
                    />
                  ) : (
                    b.amount
                  )}
                </TableCell>                

                {/* Actions */}
                <TableCell sx={{ textAlign: "center" }}>
                  {editingId === b.id ? (
                    <>
                      <Button size="small" onClick={() => handleUpdate(b.id!)}>Save</Button>
                      <Button size="small" onClick={() => setEditingId(null)}>Cancel</Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="small"
                        onClick={() => {
                          setEditingId(b.id!);
                          setEditingCampus(b.campus.toString());
                          setEditingAmount(b.amount.toString());
                        }}
                      >
                        Edit
                      </Button>
                      <Button size="small" color="error" onClick={() => handleDelete(b.id!)}>
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
