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
    PaymentModeProps,
    getPaymentModes,
    createPaymentMode,
    updatePaymentMode,
    deletePaymentMode,
} from "src/api/payment-modes";

export default function PaymentModesPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [paymentModes, setPaymentModes] = useState<PaymentModeProps[]>([]);

  // New PaymentMode states
  const [newPaymentModeName, setNewPaymentModeName] = useState("");

  // Edit states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingPaymentModeName, setEditingPaymentModeName] = useState("");

  // Fetchers
  const fetchPaymentModes = async () => {
    try {
      const paymentModeData = await getPaymentModes();
      setPaymentModes(paymentModeData);
    } catch {
      enqueueSnackbar("Failed to fetch payment modes", { variant: "error" });
    }
  };

  useEffect(() => {
    fetchPaymentModes();

    // ✅ Listen for payment mode updates
    const handleUpdateEvent = () => fetchPaymentModes();
    window.addEventListener('paymentmode-update', handleUpdateEvent);

    return () => {
      window.removeEventListener('paymentmode-update', handleUpdateEvent);
    };
  }, []);

  // Handlers
  const handleAdd = async () => {
    if (!newPaymentModeName) {
      enqueueSnackbar("Please fill name field", { variant: "warning" });
      return;
    }
    try {
      await createPaymentMode({
        name: newPaymentModeName,
      });
      enqueueSnackbar("Payment mode added successfully!", { variant: "success" });
      // reset
      setNewPaymentModeName("");
      fetchPaymentModes();
    } catch {
      enqueueSnackbar("Failed to add payment mode", { variant: "error" });
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editingPaymentModeName) {
      enqueueSnackbar("Please fill name field", { variant: "warning" });
      return;
    }
    try {
      await updatePaymentMode(id, {
        name: editingPaymentModeName,
      });
      enqueueSnackbar("Payment mode updated successfully!", { variant: "success" });
      setEditingId(null);
      setEditingPaymentModeName("");
      fetchPaymentModes();
    } catch {
      enqueueSnackbar("Failed to update payment mode", { variant: "error" });
    }
  }; 

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this Payment Mode?")) return;
    try {
      await deletePaymentMode(id);
      enqueueSnackbar("Payment mode deleted successfully!", { variant: "success" });
      fetchPaymentModes();
    } catch {
      enqueueSnackbar("Failed to delete Payment Mode", { variant: "error" });
    }
  };

  return (
    <>
      {/* Breadcrumb */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component="button" onClick={() => navigate("/settings")}>
          Settings
        </Link>
        <Typography>Payment Modes</Typography>
      </Breadcrumbs>

      <Typography variant="h6" gutterBottom>
        Payment Modes
      </Typography>
      
      <Box sx={{ maxWidth: 500, mb: 3 }}>
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
            label="Payment Mode Name"
            value={newPaymentModeName}
            onChange={(e) => setNewPaymentModeName(e.target.value)}
            size="small"
            sx={{ backgroundColor: "white" }}
          />
          <Button variant="contained" onClick={handleAdd}>
            Add Payment Mode
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ maxWidth: 500, boxShadow: 3, borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ textAlign: "center" }}>SL. No.</TableCell>
              <TableCell sx={{ textAlign: "center" }}>Payment Mode Name</TableCell>
              <TableCell sx={{ textAlign: "center" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paymentModes.map((paymentMode, index) => (
              <TableRow key={paymentMode.id}>
                <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>

                {/* Name */}
                <TableCell>
                  {editingId === paymentMode.id ? (
                    <TextField
                      value={editingPaymentModeName}
                      onChange={(e) => setEditingPaymentModeName(e.target.value)}
                      size="small"
                      sx={{ backgroundColor: "white", minWidth: 200 }}
                    />
                  ) : (
                    paymentMode.name
                  )}
                </TableCell>

                {/* Actions */}
                <TableCell sx={{ textAlign: "center" }}>
                  {editingId === paymentMode.id ? (
                    <>
                      <Button size="small" onClick={() => handleUpdate(paymentMode.id)}>
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
                          setEditingId(paymentMode.id);
                          setEditingPaymentModeName(paymentMode.name);
                        }}
                      >
                        Edit
                      </Button>
                      <Button size="small" color="error" onClick={() => handleDelete(paymentMode.id)}>
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