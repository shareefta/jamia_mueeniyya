import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import minMax from "dayjs/plugin/minMax";
import { useEffect, useState } from "react";
import isBetween from "dayjs/plugin/isBetween";
import customParseFormat from "dayjs/plugin/customParseFormat";

import { Add, Edit, Delete } from "@mui/icons-material";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, Button, Card, CardContent,
  Typography, Grid, FormControl, InputLabel, Select, MenuItem, Table, TableHead, TableBody,
  TableCell, TableRow, TableContainer, Paper, IconButton, FormControlLabel, RadioGroup, Radio
} from "@mui/material";

dayjs.extend(isBetween);
dayjs.extend(minMax);
dayjs.extend(customParseFormat);

import { getUsers } from "src/api/users";
import { getCategories } from "src/api/categories";
import { getOffCampuses } from "src/api/offCampus";
import { getPaymentModes } from "src/api/payment-modes";
import { getOpeningBalances } from "src/api/opening-balances";

import { createTransaction, getTransactions, updateTransaction, deleteTransaction, TransactionProps } from "../api/transactions";

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
    customStartDate: "",
    customEndDate: "",
    customLabel: "",
    customDateType: "",
  });

  const [open, setOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"IN" | "OUT">("IN");

  const [categories, setCategories] = useState<any[]>([]);
  const [paymentModes, setPaymentModes] = useState<any[]>([]);
  const [campuses, setCampuses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [openingBalances, setOpeningBalances] = useState<any[]>([]);

  // Custom date modal states
  const [openCustomDate, setOpenCustomDate] = useState(false);
  const [customDateType, setCustomDateType] = useState("range");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState<TransactionProps | null>(null);

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
      try {
        const [txns, cats, modes, camps, usrs, obs] = await Promise.all([
          getTransactions(),
          getCategories(),
          getPaymentModes(),
          getOffCampuses(),
          getUsers(),
          getOpeningBalances(),
        ]);
        setTransactions(txns);
        setFiltered(txns);
        setCategories(cats);
        setPaymentModes(modes);
        setCampuses(camps);
        setUsers(usrs);
        setOpeningBalances(obs);
      } catch (err) {
        enqueueSnackbar("Failed to fetch data", { variant: "error" });
      }
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

    // --- Date filtering ---
    if (filters.dateRange === "Today") temp = temp.filter(t => t.date === today);
    else if (filters.dateRange === "Yesterday") temp = temp.filter(t => t.date === yesterday);
    else if (filters.dateRange === "This Month") temp = temp.filter(t => dayjs(t.date).isAfter(firstOfMonth));
    else if (filters.dateRange === "Last Month") temp = temp.filter(t => dayjs(t.date).isBetween(lastMonthStart, lastMonthEnd));
    else if (filters.dateRange === "Custom") {
      if (filters.customStartDate && filters.customEndDate) {
        const start = dayjs(filters.customStartDate).startOf("day");
        const end = dayjs(filters.customEndDate).endOf("day");
        temp = temp.filter(t => dayjs(`${t.date} ${t.time}`).isBetween(start, end, null, "[]"));
      } else if (filters.customStartDate) {
        // Single date
        const single = dayjs(filters.customStartDate).format("YYYY-MM-DD");
        temp = temp.filter(t => t.date === single);
      }
    }

    // --- Other filters ---
    if (filters.type !== "All") temp = temp.filter(t => t.transaction_type === filters.type);
    if (filters.category !== "All") temp = temp.filter(t => t.category === parseInt(filters.category));
    if (filters.paymentMode !== "All") temp = temp.filter(t => t.payment_mode === parseInt(filters.paymentMode));
    if (filters.campus !== "All") temp = temp.filter(t => t.campus === parseInt(filters.campus));
    if (filters.user !== "All") temp = temp.filter(t => t.user_id === parseInt(filters.user));    

    setFiltered(temp);
  }, [filters, transactions]);

  // --- Utility to calculate opening balance dynamically ---
  const getOpeningBalance = (
    allTxns: any[],
    obList: any[],
    activeFilters: any,
    filteredList: any[]
  ) => {
    if (!activeFilters.includeOB) return 0;
    if (!allTxns?.length) return 0;

    let startDate;

    // --- Determine startDate based on filter selection ---
    const today = dayjs().startOf("day");
    const yesterday = dayjs().subtract(1, "day").startOf("day");
    const firstOfMonth = dayjs().startOf("month");
    const lastMonthStart = dayjs().subtract(1, "month").startOf("month");

    // 1️⃣ Predefined Date Ranges
    switch (activeFilters.dateRange) {
      case "Today":
        startDate = today;
        break;
      case "Yesterday":
        startDate = yesterday;
        break;
      case "This Month":
        startDate = firstOfMonth;
        break;
      case "Last Month":
        startDate = lastMonthStart;
        break;
      default:
        startDate = null;
    }

    // 2️⃣ Custom Range (if customStartDate exists)
    if (activeFilters.customStartDate) {
      startDate = dayjs(activeFilters.customStartDate).startOf("day");
    }

    // 3️⃣ If no specific range, use earliest date in current filtered list
    if (!startDate) {
      const filteredTxns = filteredList.length ? filteredList : allTxns;
      if (!filteredTxns.length) return 0;
      startDate = dayjs(filteredTxns[filteredTxns.length - 1].date);
    }

    // --- All transactions before startDate are previous ---
    const prevTxns = allTxns.filter(txn =>
      dayjs(`${txn.date} ${txn.time}`).isBefore(startDate)
    );

    let balance = 0;

    // --- Campus Handling ---
    if (activeFilters.campus === "All") {
      // Sum all campuses’ OBs
      balance = obList.reduce((acc, ob) => acc + Number(ob.amount || 0), 0);

      // Add all previous transactions (before range start)
      balance += prevTxns.reduce((acc, txn) => {
        if (txn.transaction_type === "IN") return acc + Number(txn.amount);
        if (txn.transaction_type === "OUT") return acc - Number(txn.amount);
        return acc;
      }, 0);
    } else {
      // Campus-specific OB
      const ob = obList.find(o => Number(o.campus) === Number(activeFilters.campus));
      balance = ob ? Number(ob.amount) : 0;

      // Filter previous txns for this campus only
      const campusTxns = prevTxns.filter(
        txn => Number(txn.campus) === Number(activeFilters.campus)
      );
      balance += campusTxns.reduce((acc, txn) => {
        if (txn.transaction_type === "IN") return acc + Number(txn.amount);
        if (txn.transaction_type === "OUT") return acc - Number(txn.amount);
        return acc;
      }, 0);
    }

    return balance;
  };

  // --- Refactored computeBalance to include opening balance ---
  const computeBalanceOptimized = (
    txnList: any[],         // renamed from list
    activeFilters: any,     // renamed from filters
    obList: any[],          // renamed from openingBalances
    allTxns: any[]
  ) => {
    if (!txnList?.length) return [];

    // Sort transactions ascending
    const sorted = [...txnList].sort((a, b) => {
      const aTime = dayjs(`${a.date} ${a.time}`);
      const bTime = dayjs(`${b.date} ${b.time}`);
      return aTime.isAfter(bTime) ? 1 : -1;
    });

    // Get starting balance dynamically
    let balance = getOpeningBalance(allTxns, obList, activeFilters, txnList);

    // Compute running balance
    const withBalance = sorted.map(txn => {
      if (txn.transaction_type === "IN") balance += Number(txn.amount);
      else if (txn.transaction_type === "OUT") balance -= Number(txn.amount);
      return { ...txn, running_balance: balance };
    });

    // Return latest first for display
    return withBalance.reverse();
  };

  // --- Filter handler ---
  const handleFilterChange = (key: string, value: any) => {
    if (key === "dateRange" && value === "Custom") {
      setOpenCustomDate(true);
    } else {
      setFilters({ ...filters, [key]: value });
    }
  };

  // --- Usage ---
  const computedTxns = computeBalanceOptimized(filtered, filters, openingBalances, transactions);

  // Opening Balance card value
  const displayedOB = getOpeningBalance(transactions, openingBalances, filters, filtered);

  // Totals
  const totalIn = computedTxns
    .filter(txn => txn.transaction_type === "IN")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalOut = computedTxns
    .filter(txn => txn.transaction_type === "OUT")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const netBalance = displayedOB + totalIn - totalOut;

  // --- Handlers for Dialog ---
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

    // Update handlers
    const handleEditClick = (txn: TransactionProps) => {
      setEditData(txn);
      setEditOpen(true);
    };

    const handleEditSubmit = async () => {
      if (!editData || !editData.id) return;

      try {
        await updateTransaction(editData.id, editData);
        enqueueSnackbar("Transaction updated successfully", { variant: "success" });

        // Update local state without refetching
        setTransactions(prev =>
          prev.map(t => (t.id === editData.id ? editData : t))
        );
        setFiltered(prev =>
          prev.map(t => (t.id === editData.id ? editData : t))
        );

        setEditOpen(false);
      } catch (err) {
        enqueueSnackbar("Failed to update transaction", { variant: "error" });
      }
    };

    const handleDeleteClick = async (id: number) => {
      if (!window.confirm("Are you sure you want to delete this transaction?")) return;

      try {
        await deleteTransaction(id);

        // Update local state to remove deleted transaction
        setTransactions(prev => prev.filter(t => t.id !== id));
        setFiltered(prev => prev.filter(t => t.id !== id));

        enqueueSnackbar("Transaction deleted successfully", { variant: "success" });
      } catch (err) {
        console.error("Delete failed:", err);
        enqueueSnackbar("Failed to delete transaction", { variant: "error" });
      }
    };

    // Determine what to show for date display
    const formatDate = (dateStr: string) => dayjs(dateStr).format("DD-MM-YYYY");
    const selectedDateLabel = () => {
      if (filters.dateRange === "Custom") {
        if (filters.customDateType === "single") {
          return dayjs(filters.customStartDate).format("DD-MM-YYYY");
        } else if (filters.customDateType === "range") {
          const start = dayjs(filters.customStartDate).format("DD-MM-YYYY");
          const end = dayjs(filters.customEndDate).format("DD-MM-YYYY");
          return `${start} to ${end}`;
        }
      } else {
        return filters.dateRange;
      }
      return "";
    };

  return (
    <Box p={4}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <Typography variant="h4" fontWeight="bold">
            Transactions
          </Typography>
          {selectedDateLabel && (
            <Box
              onClick={() => setOpenCustomDate(true)}
              sx={{
                ml: 2,
                px: 2,
                py: 0.5,
                borderRadius: "16px",
                backgroundColor: "primary.light",
                color: "primary.contrastText",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "primary.main",
                  color: "white",
                },
              }}
            >
              {selectedDateLabel()}
            </Box>
          )}
        </Box>

        <Box>
          <Button
            variant="contained"
            color="success"
            onClick={() => handleClickOpen("IN")}
            startIcon={<Add />}
            sx={{ mr: 1 }}
          >
            Cash In
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleClickOpen("OUT")}
            startIcon={<Add />}
          >
            Cash Out
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            {[
              { label: "Date", key: "dateRange", options: ["Today", "Yesterday", "This Month", "Last Month", "Custom"] },
              { label: "Type", key: "type", options: ["IN", "OUT"] },
              { label: "Category", key: "category", options: categories.map(c => ({ id: c.id, name: c.name })) },
              { label: "Payment Mode", key: "paymentMode", options: paymentModes.map(p => ({ id: p.id, name: p.name })) },
              { label: "Campus", key: "campus", options: campuses.map(c => ({ id: c.id, name: c.name })) },
              { label: "User", key: "user", options: users.map(u => ({ id: u.id, name: u.name })) },
            ].map(filter => (
              <Grid size={{ xs: 12, sm: 6, md: 1.5 }} key={filter.key}>
                <FormControl fullWidth size="small">
                  <InputLabel>{filter.label}</InputLabel>
                  <Select
                    value={filters[filter.key as keyof typeof filters]}
                    label={filter.label}
                    onChange={(e) => {
                      // Only update filters for non-Custom values
                      if (filter.key === "dateRange" && e.target.value === "Custom") return;
                      handleFilterChange(filter.key, e.target.value);
                    }}
                  >
                    <MenuItem value="All">All</MenuItem>
                    {filter.options.map((opt: any) => 
                      typeof opt === "string" ? (
                        <MenuItem
                          key={opt}
                          value={opt}
                          {...(filter.key === "dateRange" && opt === "Custom" ? {
                            onClick: () => setOpenCustomDate(true)
                          } : {})}
                        >
                          {opt}
                        </MenuItem>
                      ) : (
                        <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Grid>
            ))}
            {/* Clear Button */}
            <Grid size={{ xs: 12, sm: 3, md: 1 }}>
              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                sx={{ mt: 1 }}
                onClick={() => setFilters(prev => ({
                  ...prev, // keep other fields like includeOB
                  dateRange: "All",
                  type: "All",
                  category: "All",
                  paymentMode: "All",
                  campus: "All",
                  user: "All",
                  customStartDate: "",
                  customEndDate: "",
                }))}>
                Clear
              </Button>
            </Grid>
            {/* Include Opening Balance */}
            <Grid size={{ xs: 12, sm: 3, md: 2 }}>
              <FormControl fullWidth size="small">
                <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
                  <Typography variant="body2">Include OB</Typography>
                  <Button
                    variant={filters.includeOB ? "outlined" : "contained"}
                    color={filters.includeOB ? "inherit" : "success"}
                    size="small"
                    onClick={() => handleFilterChange("includeOB", !filters.includeOB)}
                  >
                    {filters.includeOB ? "No" : "Yes"}
                  </Button>
                </Box>
              </FormControl>
            </Grid>            
          </Grid>          
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {filters.includeOB && (
          <Grid size={{ xs: 12, sm: 3 }}>
            <Card sx={{ bgcolor: "#fff8e1", boxShadow: 3, borderLeft: "6px solid #fbc02d" }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">Opening Balance</Typography>
                <Typography variant="h6" fontWeight="bold" color="warning.main">
                  ₹ {displayedOB.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        <Grid size={{ xs: 12, sm: 3 }}>
          <Card sx={{ bgcolor: "#e8f5e9", boxShadow: 3, borderLeft: "6px solid #2e7d32" }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Total In</Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                ₹ {totalIn.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 3 }}>
          <Card sx={{ bgcolor: "#ffebee", boxShadow: 3, borderLeft: "6px solid #c62828" }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Total Out</Typography>
              <Typography variant="h6" fontWeight="bold" color="error.main">
                ₹ {totalOut.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 3 }}>
          <Card sx={{ bgcolor: "#e3f2fd", boxShadow: 3, borderLeft: "6px solid #1565c0" }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Net Balance</Typography>
              <Typography
                variant="h6"
                fontWeight="bold"
                color={netBalance >= 0 ? "success.main" : "error.main"}
              >
                ₹ {netBalance.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: 3,
          maxHeight: 600,
          border: "1px solid #ddd",
        }}
      >
        <Table stickyHeader sx={{ minWidth: 650, borderCollapse: "collapse" }}>
          {/* Table Head */}
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              {[
                { label: "#", width: "5%" },
                { label: "Date & Time", width: "15%" },
                { label: "Details", width: "30%" },
                { label: "Category", width: "10%" },
                { label: "Mode", width: "10%" },
                { label: "Amount", width: "10%" },
                { label: "Balance", width: "10%" },
                { label: "Action", width: "10%" },
              ].map((h) => (
                <TableCell
                  key={h.label}
                  align={["Amount", "Balance"].includes(h.label) ? "right" : "center"}
                  sx={{
                    fontWeight: "bold",
                    borderBottom: "2px solid #ccc",
                    width: h.width,
                  }}
                >
                  {h.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* Table Body */}
          <TableBody>
            {computedTxns.length > 0 ? (
              computedTxns.map((txn, idx) => (
                <TableRow
                  key={txn.id}
                  hover
                  sx={{
                    backgroundColor: "#ffffff", // all rows white
                    transition: "0.2s",
                    "&:hover": {
                      backgroundColor: "#e3f2fd", // light hover effect
                    },
                  }}
                >
                  <TableCell align="center">{idx + 1}</TableCell>

                  {/* Date & Time */}
                  <TableCell align="center">
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      {dayjs(txn.date).format("DD-MM-YYYY")}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: "bold", color: "text.secondary" }}
                    >
                      {txn.time ? dayjs(`1970-01-01T${txn.time}`).format("hh:mm A") : "-"}
                    </Typography>
                  </TableCell>

                  {/* Details */}
                  <TableCell align="left">{txn.remarks || "-"}</TableCell>

                  {/* Category */}
                  <TableCell align="center">{txn.category_name}</TableCell>

                  {/* Payment Mode */}
                  <TableCell align="center">{txn.payment_mode_name}</TableCell>

                  {/* Amount */}
                  <TableCell
                    align="right"
                    sx={{
                      color: txn.transaction_type === "IN" ? "green" : "red",
                      fontWeight: "bold",
                    }}
                  >
                    ₹ {Number(txn.amount).toLocaleString()}
                  </TableCell>

                  {/* Balance */}
                  <TableCell align="right">₹ {txn.running_balance.toFixed(2)}</TableCell>

                  {/* Actions */}
                  <TableCell align="center">
                    <IconButton onClick={() => handleEditClick(txn)} color="primary">
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(txn.id!)} color="error">
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  No transactions found.
                </TableCell>
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

      {/* Custom Date Dialog */}
      <Dialog open={openCustomDate} onClose={() => setOpenCustomDate(false)}>
        <DialogTitle>Select Custom Date</DialogTitle>
        <DialogContent dividers>
          <RadioGroup
            row
            value={customDateType}
            onChange={(e) => setCustomDateType(e.target.value)}
          >
            <FormControlLabel value="range" control={<Radio />} label="Date Range" />
            <FormControlLabel value="single" control={<Radio />} label="Single Date" />
          </RadioGroup>

          {customDateType === "range" ? (
            <Box display="flex" gap={2} mt={2}>
              <TextField
                label="Start Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                fullWidth
              />
              <TextField
                label="End Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                fullWidth
              />
            </Box>
          ) : (
            <Box mt={2}>
              <TextField
                label="Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                fullWidth
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              let label = "";
              if (customDateType === "range") {
                label = `${customStartDate} → ${customEndDate}`;
              } else {
                label = customStartDate; // single date
              }
              
              setFilters({
                ...filters,
                dateRange: "Custom",
                customDateType: customDateType,
                customStartDate,
                customEndDate: customDateType === "range" ? customEndDate : customStartDate,
                customLabel: label,
              });
              setOpenCustomDate(false);

              // Reset the temporary states so next open works
              setCustomStartDate("");
              setCustomEndDate("");
              setCustomDateType("range");
            }}
            color="primary"
            variant="contained"
          >
            Apply
          </Button>
          <Button
            onClick={() => {
              setCustomStartDate("");
              setCustomEndDate("");
              setCustomDateType("range");
              setOpenCustomDate(false);
            }}
            color="secondary"
            variant="outlined"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Transaction Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Transaction</DialogTitle>

        <DialogContent>

          {/* Transaction Type */}
          <FormControl fullWidth margin="dense">
            <InputLabel>Transaction Type</InputLabel>
            <Select
              name="transaction_type"
              value={editData?.transaction_type || ""}
              onChange={(e) =>
                setEditData(prev => prev ? { ...prev, transaction_type: e.target.value as "IN" | "OUT" } : prev)
              }
            >
              <MenuItem value="IN">IN</MenuItem>
              <MenuItem value="OUT">OUT</MenuItem>
            </Select>
          </FormControl>

          {/* Date */}
          <TextField
            label="Date"
            type="date"
            name="date"
            value={editData?.date || ""}
            onChange={(e) => setEditData(prev => prev ? { ...prev, date: e.target.value } : prev)}
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
          />

          {/* Time */}
          <TextField
            label="Time"
            type="time"
            name="time"
            value={editData?.time || ""}
            onChange={(e) => setEditData(prev => prev ? { ...prev, time: e.target.value } : prev)}
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
          />

          {/* Amount */}
          <TextField
            label="Amount"
            name="amount"
            type="number"
            value={editData?.amount || ""}
            onChange={(e) =>
              setEditData(prev => prev ? { ...prev, amount: Number(e.target.value) } : prev)
            }
            fullWidth
            margin="dense"
          />

          {/* Remarks */}
          <TextField
            label="Remarks"
            name="remarks"
            value={editData?.remarks || ""}
            onChange={(e) =>
              setEditData(prev => prev ? { ...prev, remarks: e.target.value } : prev)
            }
            fullWidth
            margin="dense"
          />

          {/* Category */}
          <FormControl fullWidth margin="dense">
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={editData?.category || ""}
              onChange={(e) =>
                setEditData(prev => prev ? { ...prev, category: Number(e.target.value) } : prev)
              }
            >
              {categories.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Payment Mode */}
          <FormControl fullWidth margin="dense">
            <InputLabel>Payment Mode</InputLabel>
            <Select
              name="payment_mode"
              value={editData?.payment_mode || ""}
              onChange={(e) =>
                setEditData(prev => prev ? { ...prev, payment_mode: Number(e.target.value) } : prev)
              }
            >
              {paymentModes.map(p => (
                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Campus */}
          <FormControl fullWidth margin="dense">
            <InputLabel>Campus</InputLabel>
            <Select
              name="campus"
              value={editData?.campus || ""}
              onChange={(e) =>
                setEditData(prev => prev ? { ...prev, campus: Number(e.target.value) } : prev)
              }
            >
              {campuses.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button color="primary" variant="contained" onClick={handleEditSubmit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransactionList;