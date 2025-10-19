import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import isBetween from "dayjs/plugin/isBetween";

import { Add, Edit, Delete } from "@mui/icons-material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box, 
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
  IconButton,
} from "@mui/material";

dayjs.extend(isBetween); // ⚡ must extend the plugin

import { getUsers } from "src/api/users";
import { getCategories } from "src/api/categories";
import { getOffCampuses } from "src/api/offCampus";
import { getPaymentModes } from "src/api/payment-modes";

import { createTransaction, getTransactions } from "../api/transactions";

const TransactionList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    dateRange: "All",
    type: "All",
    category: "All",
    paymentMode: "All",
    campus: "All",
    user: "All",
    includeOB: true,
  });

  const [open, setOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"IN" | "OUT">("IN");

  const [categories, setCategories] = useState<any[]>([]);
  const [paymentModes, setPaymentModes] = useState<any[]>([]);
  const [campuses, setCampuses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    amount: "",
    remarks: "",
    category: "",
    payment_mode: "",
    campus: "",
  });

  // Fetch data
  useEffect(() => {
    (async () => {
      const [txns, cats, modes, camps, usrs] = await Promise.all([
        getTransactions(),
        getCategories(),
        getPaymentModes(),
        getOffCampuses(),
        getUsers(),
      ]);
      setTransactions(txns);
      setFiltered(txns);
      setCategories(cats);
      setPaymentModes(modes);
      setCampuses(camps);
      setUsers(usrs);
    })();
  }, []);

  // Filters
  useEffect(() => {
    let temp = [...transactions];
    const today = dayjs().format("YYYY-MM-DD");
    const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");
    const firstOfMonth = dayjs().startOf("month");
    const lastMonthStart = dayjs().subtract(1, "month").startOf("month");
    const lastMonthEnd = dayjs().subtract(1, "month").endOf("month");

    if (filters.dateRange === "Today") temp = temp.filter(t => t.date === today);
    else if (filters.dateRange === "Yesterday") temp = temp.filter(t => t.date === yesterday);
    else if (filters.dateRange === "This Month") temp = temp.filter(t => dayjs(t.date).isAfter(firstOfMonth));
    else if (filters.dateRange === "Last Month")
      temp = temp.filter(t => dayjs(t.date).isBetween(lastMonthStart, lastMonthEnd));

    if (filters.type !== "All") temp = temp.filter(t => t.transaction_type === filters.type);
    if (filters.category !== "All") temp = temp.filter(t => t.category === parseInt(filters.category));
    if (filters.paymentMode !== "All") temp = temp.filter(t => t.payment_mode === parseInt(filters.paymentMode));
    if (filters.campus !== "All") temp = temp.filter(t => t.campus === parseInt(filters.campus));
    if (filters.user !== "All") temp = temp.filter(t => t.created_by === parseInt(filters.user));

    setFiltered(temp);
  }, [filters, transactions]);

  const computeBalance = (list: any[]) => {
    let balance = 0;
    return list.map(txn => {
      if (txn.transaction_type === "IN") balance += Number(txn.amount);
      else balance -= Number(txn.amount);
      return { ...txn, running_balance: balance };
    });
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  const computedTxns = computeBalance(filtered);

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
        const newTxn = await createTransaction({
          ...formData,
          amount: Number(formData.amount),
          category: Number(formData.category),
          payment_mode: Number(formData.payment_mode),
          campus: Number(formData.campus),
          transaction_type: transactionType,
        });
  
        enqueueSnackbar("Transaction added successfully!", { variant: "success" });

        setTransactions((prev) => [...prev, newTxn]);
  
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
    <Box p={4}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">Transactions</Typography>
        <Box>
          <Button variant="contained" color="success" onClick={() => handleClickOpen("IN")} startIcon={<Add />} sx={{ mr: 1 }}>
            Cash In
          </Button>
          <Button variant="contained" color="error" onClick={() => handleClickOpen("OUT")} startIcon={<Add />}>
            Cash Out
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            {[
              { label: "Date", key: "dateRange", options: ["All", "Today", "Yesterday", "This Month", "Last Month"] },
              { label: "Type", key: "type", options: ["All", "IN", "OUT"] },
              { label: "Category", key: "category", options: categories.map(c => ({ id: c.id, name: c.name })) },
              { label: "Payment Mode", key: "paymentMode", options: paymentModes.map(p => ({ id: p.id, name: p.name })) },
              { label: "Campus", key: "campus", options: campuses.map(c => ({ id: c.id, name: c.name })) },
              { label: "User", key: "user", options: users.map(u => ({ id: u.id, name: u.username })) },
            ].map(filter => (
              <Grid size={{ xs: 12, sm: 6, md: 2 }} key={filter.key}>
                <FormControl fullWidth size="small">
                  <InputLabel>{filter.label}</InputLabel>
                  <Select
                    value={filters[filter.key as keyof typeof filters]}
                    label={filter.label}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  >
                    <MenuItem value="All">All</MenuItem>
                    {filter.options.map((opt: any) =>
                      typeof opt === "string" ? (
                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                      ) : (
                        <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f3f3f3" }}>
              {["Sl. No.", "Date & Time", "Remark", "Payment Mode", "Created By", "Campus", "Amount", "Balance", "Action"].map((h) => (
                <TableCell key={h} align={["Amount", "Balance"].includes(h) ? "right" : "center"}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {computedTxns.length > 0 ? (
              computedTxns.map((txn, idx) => (
                <TableRow key={txn.id} hover>
                  <TableCell align="center">{idx + 1}</TableCell>
                  <TableCell align="center">{dayjs(txn.date).format("DD-MM-YYYY")} {txn.time}</TableCell>
                  <TableCell align="center">{txn.remarks}</TableCell>
                  <TableCell align="center">{txn.payment_mode_name}</TableCell>
                  <TableCell align="center">{txn.created_by_name}</TableCell>
                  <TableCell align="center">{txn.campus_name}</TableCell>
                  <TableCell align="right" sx={{ color: txn.transaction_type === "IN" ? "green" : "red", fontWeight: "bold" }}>
                    {txn.amount}
                  </TableCell>
                  <TableCell align="right">{txn.running_balance.toFixed(2)}</TableCell>
                  <TableCell align="center">
                    <IconButton color="primary"><Edit fontSize="small" /></IconButton>
                    <IconButton color="error"><Delete fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>No transactions found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Transaction Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{transactionType === "IN" ? "Add Cash In" : "Add Cash Out"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Time"
            name="time"
            type="time"
            value={formData.time}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
          />
          <TextField
            label="Remarks"
            name="remarks"
            multiline
            rows={2}
            value={formData.remarks}
            onChange={handleChange}
          />

          <TextField
            select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Payment Mode"
            name="payment_mode"
            value={formData.payment_mode}
            onChange={handleChange}
          >
            {paymentModes.map((mode) => (
              <MenuItem key={mode.id} value={mode.id}>{mode.name}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Campus"
            name="campus"
            value={formData.campus}
            onChange={handleChange}
          >
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
};

export default TransactionList;