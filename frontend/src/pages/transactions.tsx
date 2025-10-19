import { useSnackbar } from "notistack";
import { useState, useEffect } from "react";

import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Typography,
  Stack,
} from "@mui/material";

import { getCategories } from "src/api/categories";
import { getOffCampuses } from "src/api/offCampus";
import { getPaymentModes } from "src/api/payment-modes";
import { createTransaction } from "src/api/transactions";

export default function TransactionsPage() {
  const { enqueueSnackbar } = useSnackbar();

  const [open, setOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"IN" | "OUT">("IN");

  const [categories, setCategories] = useState<any[]>([]);
  const [paymentModes, setPaymentModes] = useState<any[]>([]);
  const [campuses, setCampuses] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    amount: "",
    remarks: "",
    category: "",
    payment_mode: "",
    campus: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setCategories(await getCategories());
        setPaymentModes(await getPaymentModes());
        setCampuses(await getOffCampuses());
      } catch {
        enqueueSnackbar("Failed to load dropdown data", { variant: "error" });
      }
    };
    fetchData();
  }, []);

  const handleClickOpen = (type: "IN" | "OUT") => {
    setTransactionType(type);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (addMore = false) => {
    try {
      await createTransaction({
        ...formData,
        amount: Number(formData.amount),
        category: Number(formData.category),
        payment_mode: Number(formData.payment_mode),
        campus: Number(formData.campus),
        transaction_type: transactionType,
      });

      enqueueSnackbar("Transaction added successfully!", { variant: "success" });

      if (!addMore) {
        handleClose();
      } else {
        setFormData({
          date: "",
          time: "",
          amount: "",
          remarks: "",
          category: "",
          payment_mode: "",
          campus: "",
        });
      }
    } catch {
      enqueueSnackbar("Failed to add transaction", { variant: "error" });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Transactions
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button
          variant="contained"
          color="success"
          onClick={() => handleClickOpen("IN")}
        >
          Cash In
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => handleClickOpen("OUT")}
        >
          Cash Out
        </Button>
      </Stack>

      {/* Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {transactionType === "IN" ? "Add Cash In" : "Add Cash Out"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField label="Date" name="date" type="date" value={formData.date} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          <TextField label="Time" name="time" type="time" value={formData.time} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          <TextField label="Amount" name="amount" type="number" value={formData.amount} onChange={handleChange} />
          <TextField label="Remarks" name="remarks" multiline rows={2} value={formData.remarks} onChange={handleChange} />
          
          <TextField select label="Category" name="category" value={formData.category} onChange={handleChange}>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
            ))}
          </TextField>

          <TextField select label="Payment Mode" name="payment_mode" value={formData.payment_mode} onChange={handleChange}>
            {paymentModes.map((mode) => (
              <MenuItem key={mode.id} value={mode.id}>{mode.name}</MenuItem>
            ))}
          </TextField>

          <TextField select label="Campus" name="campus" value={formData.campus} onChange={handleChange}>
            {campuses.map((camp) => (
              <MenuItem key={camp.id} value={camp.id}>{camp.name}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleSave(false)} variant="contained">Save</Button>
          <Button onClick={() => handleSave(true)} variant="outlined">Save & Add More</Button>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
