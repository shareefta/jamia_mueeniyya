import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import minMax from "dayjs/plugin/minMax";
import { useEffect, useState } from "react";
import isBetween from "dayjs/plugin/isBetween";
import { useParams, useNavigate } from 'react-router-dom';
import customParseFormat from "dayjs/plugin/customParseFormat";

import { Add, Edit, Delete } from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTheme, useMediaQuery, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import {
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, Button, Card, CardContent,
  Typography, Grid, FormControl, InputLabel, Select, MenuItem, Table, TableHead, TableBody,
  TableCell, TableRow, TableContainer, Paper, IconButton, FormControlLabel, RadioGroup, Radio
} from "@mui/material";

dayjs.extend(isBetween);
dayjs.extend(minMax);
dayjs.extend(customParseFormat);

import { getUsers } from "src/api/users";
import { getCashBooks } from "src/api/cash-book";
import { useAuthStore } from 'src/store/use-auth-store';
import { getPaymentModes } from "src/api/payment-modes";
import { getOpeningBalances } from "src/api/opening-balances"
import { getCategories, createCategory } from "src/api/categories";

import ExportReports from "./export-reports";
import { createTransaction, getTransactions, updateTransaction, deleteTransaction, TransactionProps } from "../api/transactions";

const TransactionList = () => {
  const navigate = useNavigate();
  const { cashBookId } = useParams<{ cashBookId: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    dateRange: "All",
    type: "All",
    category: "All",
    paymentMode: "All",
    cash_book: cashBookId || 'All',
    user: "All",
    includeOB: true,
    customStartDate: "",
    customEndDate: "",
    customLabel: "",
    customDateType: "",
  });

  const getStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  };

  const user = useAuthStore((state) => state.user) || getStoredUser();

  const [open, setOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"IN" | "OUT">("IN");

  const [categories, setCategories] = useState<any[]>([]);
  const [paymentModes, setPaymentModes] = useState<any[]>([]);
  const [cashBooks, setCashBooks] = useState<any[]>([]);
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

  // Add Category from dialog
  const [addCatOpen, setAddCatOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Responsive Filters
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Dynamically get selected cash book details
  const selectedCashBook =
    filters.cash_book !== "All"
      ? cashBooks.find(cb => cb.id === parseInt(filters.cash_book))
      : null;

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    amount: "",
    remarks: "",
    category: "",
    payment_mode: "",
    cash_book: "",
    party_name: "",
    party_mobile_number: "",
  });

  // Fetch data
  useEffect(() => {
    (async () => {
      try {
        const [txns, cats, modes, books, usrs, obs] = await Promise.all([
          getTransactions(),
          getCategories(),
          getPaymentModes(),
          getCashBooks(),
          getUsers(),
          getOpeningBalances(),
        ]);
        setTransactions(txns);
        setFiltered(txns);
        setCategories(cats);
        setPaymentModes(modes);
        setCashBooks(books);
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
    if (filters.cash_book !== "All") temp = temp.filter(t => t.cash_book === parseInt(filters.cash_book));
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

    // --- Cash Book Handling ---
    if (activeFilters.cash_book === "All") {
      // Sum all cash book’s OBs
      balance = obList.reduce((acc, ob) => acc + Number(ob.amount || 0), 0);

      // Add all previous transactions (before range start)
      balance += prevTxns.reduce((acc, txn) => {
        if (txn.transaction_type === "IN") return acc + Number(txn.amount);
        if (txn.transaction_type === "OUT") return acc - Number(txn.amount);
        return acc;
      }, 0);
    } else {
      // Cash Book-specific OB
      const ob = obList.find(o => Number(o.cash_book) === Number(activeFilters.cash_book));
      balance = ob ? Number(ob.amount) : 0;

      // Filter previous txns for this cash book only
      const cashBookTxns = prevTxns.filter(
        txn => Number(txn.cash_book) === Number(activeFilters.cash_book)
      );
      balance += cashBookTxns.reduce((acc, txn) => {
        if (txn.transaction_type === "IN") return acc + Number(txn.amount);
        if (txn.transaction_type === "OUT") return acc - Number(txn.amount);
        return acc;
      }, 0);
    }

    return balance;
  };

  // --- Refactored computeBalance to include opening balance ---
  const computeBalanceOptimized = (
    txnList: any[],
    activeFilters: any,
    obList: any[],
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

  // Helper functions to get current date and time
  const getCurrentDate = () => new Date().toISOString().split("T")[0]; // yyyy-mm-dd
  const getCurrentTime = () => new Date().toTimeString().slice(0, 5);   // hh:mm

  // --- Handlers for Dialog ---
  const handleClickOpen = (type: "IN" | "OUT") => {
    setTransactionType(type);
    setFormData({
      date: getCurrentDate(),
      time: getCurrentTime(),
      amount: "",
      remarks: "",
      category: "",
      payment_mode: "",
      cash_book: cashBookId || "",
      party_name: "",
      party_mobile_number: "",
    }); // Auto-fill date & time
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
        cash_book: cashBookId ? Number(cashBookId) : Number(formData.cash_book),
        transaction_type: transactionType,
      });

      enqueueSnackbar("Transaction added successfully!", { variant: "success" });
      setTransactions((prev) => [...prev, newTxn]);

      if (!addMore) {
        handleClose();
      } else {
        setFormData({
          date: getCurrentDate(),
          time: getCurrentTime(),
          amount: "",
          remarks: "",
          category: "",
          payment_mode: "",
          cash_book: cashBookId || "",
          party_name: "",
          party_mobile_number: "",
        }); // Reset form but keep date & time current
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
      <Box display="flex" flexDirection="column" gap={2} mb={3} width="100%">
        {/* ===== First Row: Campus + Cash Book + Download Buttons ===== */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={1}
          width="100%"
        >
          {/* Left: Campus + Cash Book */}
          <Box display="flex" flexWrap="wrap" gap={0.5} alignItems="center">
            {selectedCashBook ? (
              <>
                <Chip
                  label={selectedCashBook.campus_name}
                  color="info"
                  size="small"
                  clickable
                  onClick={() =>
                    navigate(`/cash-books-lists?campus=${selectedCashBook.campus_id}`)
                  }
                  sx={{ fontWeight: 600, cursor: "pointer", "&:hover": { opacity: 0.8 } }}
                />
                <Chip
                  label={selectedCashBook.name}
                  color="success"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </>
            ) : (
              filters.cash_book === "All" && (
                <Chip
                  label="All Cash Books"
                  color="default"
                  size="small"
                  sx={{
                    fontWeight: 600,
                    bgcolor: "grey.100",
                    color: "text.primary",
                  }}
                />
              )
            )}
          </Box>

          {/* Right: Download Buttons (icons only) */}
          <Box display="flex" gap={1}>
            <ExportReports
              transactions={computedTxns}
              filters={filters}
              openingBalances={openingBalances}
              cashBooks={cashBooks}
              displayedOB={displayedOB}
              campusName={selectedCashBook?.campus_name || "Jamia Mueeniyya"}
            />
          </Box>
        </Box>

        {/* ===== Second Row ===== */}
        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent={{ xs: "center", sm: "space-between" }}
          alignItems={{ xs: "center", sm: "center" }}
          gap={2}
          width="100%"
        >
          {/* Left side (Transactions + Date Range) */}
          <Box
            display="flex"
            flexDirection="row"
            gap={1}
            alignItems="center"
            justifyContent={{ xs: "center", sm: "flex-start" }}
            flexWrap="wrap"
          >
            <Typography variant="h4" fontWeight="bold">
              Transactions
            </Typography>

            {selectedDateLabel && (
              <Box
                onClick={() => setOpenCustomDate(true)}
                sx={{
                  px: 2,
                  py: 0.5,
                  borderRadius: "16px",
                  backgroundColor: "primary.light",
                  color: "primary.contrastText",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "primary.main", color: "white" },
                  whiteSpace: "nowrap",
                }}
              >
                {selectedDateLabel()}
              </Box>
            )}
          </Box>

          {/* Right side (Cash In / Out) - shown only on desktop */}
          <Box display={{ xs: "none", sm: "flex" }} gap={1}>
            <Button
              variant="contained"
              color="success"
              onClick={() => handleClickOpen("IN")}
              startIcon={<Add />}
              sx={{ fontSize: "1rem" }}
            >
              Cash In
            </Button>

            <Button
              variant="contained"
              color="error"
              onClick={() => handleClickOpen("OUT")}
              startIcon={<Add />}
              sx={{ fontSize: "1rem" }}
            >
              Cash Out
            </Button>
          </Box>
        </Box>

        {/* ===== Third Row (mobile only): Cash In / Out ===== */}
        <Box display={{ xs: "flex", sm: "none" }} gap={1} justifyContent="center" width="100%">
          <Button
            variant="contained"
            color="success"
            onClick={() => handleClickOpen("IN")}
            startIcon={<Add />}
            sx={{
              flex: 1,
              fontSize: "0.9rem",
            }}
          >
            Cash In
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={() => handleClickOpen("OUT")}
            startIcon={<Add />}
            sx={{
              flex: 1,
              fontSize: "0.9rem",
            }}
          >
            Cash Out
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      {isMobile ? (
        // --- Mobile View: Filters inside Accordion ---
        <Accordion sx={{ mb: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="filter-content"
            id="filter-header"
            sx={{
              backgroundColor: "primary.main",
              color: "white",
              borderRadius: "8px",
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              Filters
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Card elevation={0}>
              <CardContent>
                <Grid container spacing={2}>
                  {/* First Row: Date, Type, Category */}
                  <Grid size={{ xs: 4, sm: 6, md: 1.5 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Date</InputLabel>
                      <Select
                        value={filters.dateRange}
                        label="Date"
                        onChange={(e) => {
                          if (e.target.value === "Custom") {
                            setOpenCustomDate(true);
                            return; // just stop execution, not return a value
                          }
                          handleFilterChange("dateRange", e.target.value);
                        }}
                      >
                        <MenuItem value="All">All</MenuItem>
                        {["Today", "Yesterday", "This Month", "Last Month", "Custom"].map(opt => (
                          <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 4, sm: 6, md: 1.5 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={filters.type}
                        label="Type"
                        onChange={(e) => handleFilterChange("type", e.target.value)}
                      >
                        <MenuItem value="All">All</MenuItem>
                        <MenuItem value="IN">IN</MenuItem>
                        <MenuItem value="OUT">OUT</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 4, sm: 6, md: 1.5 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={filters.category}
                        label="Category"
                        onChange={(e) => handleFilterChange("category", e.target.value)}
                      >
                        <MenuItem value="All">All</MenuItem>
                        {categories.map(c => (
                          <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Second Row: Payment Mode, Cash Book, User */}
                  <Grid size={{ xs: 4, sm: 6, md: 1.5 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Payment Mode</InputLabel>
                      <Select
                        value={filters.paymentMode}
                        label="Payment Mode"
                        onChange={(e) => handleFilterChange("paymentMode", e.target.value)}
                      >
                        <MenuItem value="All">All</MenuItem>
                        {paymentModes.map(p => (
                          <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 4, sm: 6, md: 1.5 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Cash Book</InputLabel>
                      <Select
                        value={filters.cash_book}
                        label="Cash Book"
                        onChange={(e) => handleFilterChange("cash_book", e.target.value)}
                      >
                        <MenuItem value="All">All</MenuItem>
                        {cashBooks.map(c => (
                          <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 4, sm: 6, md: 1.5 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>User</InputLabel>
                      <Select
                        value={filters.user}
                        label="User"
                        onChange={(e) => handleFilterChange("user", e.target.value)}
                      >
                        <MenuItem value="All">All</MenuItem>
                        {users.map(u => (
                          <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Third Row: Clear & Include OB */}
                  <Grid size={{ xs: 4, sm: 3, md: 1 }}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      fullWidth
                      onClick={() => setFilters(prev => ({
                        ...prev,
                        dateRange: "All",
                        type: "All",
                        category: "All",
                        paymentMode: "All",
                        cash_book: "All",
                        user: "All",
                        customStartDate: "",
                        customEndDate: "",
                      }))}
                    >
                      Clear
                    </Button>
                  </Grid>

                  <Grid size={{ xs: 8, sm: 3, md: 2 }}>
                    <Box display="flex" alignItems="center" gap={2}>
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
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </AccordionDetails>
        </Accordion>
      ) : (
        // --- Desktop View: Normal Card layout ---
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2}>
              {/* First Row: Date, Type, Category */}
              <Grid size={{ xs: 4, sm: 6, md: 1.5 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Date</InputLabel>
                  <Select
                    value={filters.dateRange}
                    label="Date"
                    onChange={(e) => {
                      if (e.target.value === "Custom") {
                        setOpenCustomDate(true);
                        return; // just stop execution, not return a value
                      }
                      handleFilterChange("dateRange", e.target.value);
                    }}
                  >
                    <MenuItem value="All">All</MenuItem>
                    {["Today", "Yesterday", "This Month", "Last Month", "Custom"].map(opt => (
                      <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 4, sm: 6, md: 1.5 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={filters.type}
                    label="Type"
                    onChange={(e) => handleFilterChange("type", e.target.value)}
                  >
                    <MenuItem value="All">All</MenuItem>
                    <MenuItem value="IN">IN</MenuItem>
                    <MenuItem value="OUT">OUT</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 4, sm: 6, md: 1.5 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.category}
                    label="Category"
                    onChange={(e) => handleFilterChange("category", e.target.value)}
                  >
                    <MenuItem value="All">All</MenuItem>
                    {categories.map(c => (
                      <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Second Row: Payment Mode, Cash Book, User */}
              <Grid size={{ xs: 4, sm: 6, md: 1.5 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Payment Mode</InputLabel>
                  <Select
                    value={filters.paymentMode}
                    label="Payment Mode"
                    onChange={(e) => handleFilterChange("paymentMode", e.target.value)}
                  >
                    <MenuItem value="All">All</MenuItem>
                    {paymentModes.map(p => (
                      <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 4, sm: 6, md: 1.5 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Cash Book</InputLabel>
                  <Select
                    value={filters.cash_book}
                    label="Cash Book"
                    onChange={(e) => handleFilterChange("cash_book", e.target.value)}
                  >
                    <MenuItem value="All">All</MenuItem>
                    {cashBooks.map(c => (
                      <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 4, sm: 6, md: 1.5 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>User</InputLabel>
                  <Select
                    value={filters.user}
                    label="User"
                    onChange={(e) => handleFilterChange("user", e.target.value)}
                  >
                    <MenuItem value="All">All</MenuItem>
                    {users.map(u => (
                      <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Third Row: Clear & Include OB */}
              <Grid size={{ xs: 4, sm: 3, md: 1 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    dateRange: "All",
                    type: "All",
                    category: "All",
                    paymentMode: "All",
                    cash_book: "All",
                    user: "All",
                    customStartDate: "",
                    customEndDate: "",
                  }))}
                >
                  Clear
                </Button>
              </Grid>

              <Grid size={{ xs: 8, sm: 3, md: 2 }}>
                <Box display="flex" alignItems="center" gap={2}>
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
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      {isMobile ? (
        // --- MOBILE VIEW: Compact single card layout ---
        <Card sx={{ mb: 3, p: 1, boxShadow: 3 }}>
          <CardContent>
            <Box display="flex" flexDirection="column" gap={1}>
              {/* Include OB Section if enabled */}
              {filters.includeOB && (
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="textSecondary">
                    Opening Balance
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="bold" color="warning.main">
                    ₹ {displayedOB.toLocaleString()}
                  </Typography>
                </Box>
              )}

              {/* Total In */}
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="textSecondary">
                  Total In
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold" color="success.main">
                  ₹ {totalIn.toLocaleString()}
                </Typography>
              </Box>

              {/* Total Out */}
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="textSecondary">
                  Total Out
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold" color="error.main">
                  ₹ {totalOut.toLocaleString()}
                </Typography>
              </Box>

              {/* Net Balance */}
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="textSecondary">
                  Net Balance
                </Typography>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color={netBalance >= 0 ? "success.main" : "error.main"}
                >
                  ₹ {netBalance.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ) : (
        // --- DESKTOP VIEW: Grid of 4 summary cards ---
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {filters.includeOB && (
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: "#e8f5e9", boxShadow: 3, borderLeft: "6px solid #2e7d32" }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">Total In</Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  ₹ {totalIn.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: "#ffebee", boxShadow: 3, borderLeft: "6px solid #c62828" }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">Total Out</Typography>
                <Typography variant="h6" fontWeight="bold" color="error.main">
                  ₹ {totalOut.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
      )}

      {/* Total Transactions */}
      <Box sx={{ mb: 2 }}>        
        <Typography variant="subtitle1" fontWeight={600}>
          Total Transactions: {computedTxns.length}
        </Typography>
      </Box>
      
      {/* Transaction List */}
      {/* Mobile view - Cards */}
      {isMobile ? (        
        <Box display="flex" flexDirection="column" gap={2}>
          {computedTxns.length > 0 ? (
            computedTxns.map((txn) => (
              <Card
                key={txn.id}
                sx={{
                  mb: 1.5,
                  p: 1.5,
                  borderLeft: `5px solid ${
                    txn.transaction_type === "IN" ? "#2e7d32" : "#c62828"
                  }`,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                  borderRadius: 2,
                }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  gap={2}
                >
                  {/* LEFT SIDE — Details */}
                  <Box flex={1}>
                    {/* Remarks */}
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      sx={{ wordBreak: "break-word" }}
                    >
                      {txn.remarks || "-"}
                    </Typography>

                    {/* Category - Mode */}
                    <Typography variant="body2" color="text.secondary">
                      {txn.category_name || "—"}{" "}
                      {txn.payment_mode_name ? `- ${txn.payment_mode_name}` : ""}
                    </Typography>

                    {/* Party Name */}
                    {txn.party_name && (
                      <Typography variant="body2" color="text.secondary">
                        {txn.party_name}
                      </Typography>
                    )}

                    {/* Party Mobile Number */}
                    {txn.party_mobile_number && (
                      <Typography variant="body2" color="text.secondary">
                        {txn.party_mobile_number}
                      </Typography>
                    )}
                  </Box>

                  {/* RIGHT SIDE — Amount / Balance / Created by / Date */}
                  <Box textAlign="right">
                    {/* Amount */}
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      color={txn.transaction_type === "IN" ? "success.main" : "error.main"}
                    >
                      ₹{parseFloat(txn.amount).toLocaleString("en-IN")}
                    </Typography>

                    {/* Balance */}
                    {txn.running_balance !== undefined && (
                      <Typography variant="body2" color="text.secondary">
                        Bal: ₹{parseFloat(txn.running_balance).toLocaleString("en-IN")}
                      </Typography>
                    )}

                    {/* Created by */}
                    <Typography variant="caption" color="text.secondary">
                      User:{txn.user_name || "-"}
                    </Typography>

                    {/* Date & Time */}
                    <Typography variant="caption" color="text.secondary" display="block">
                      {dayjs(txn.date).format("DD MMM YYYY")},{" "}
                      {dayjs(txn.time, "HH:mm:ss").format("hh:mm A")}
                    </Typography>
                  </Box>
                </Box>                
              </Card>
            ))
          ) : (
            <Typography align="center" sx={{ py: 4, color: "text.secondary" }}>
              No transactions found.
            </Typography>
          )}
        </Box>
      ) : (
        // Desktop view: Table (existing)
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
                  { label: "Details", width: "15%" },
                  { label: "Party Details", width: "15%" },
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
                      backgroundColor: "#ffffff",
                      transition: "0.2s",
                      "&:hover": { backgroundColor: "#e3f2fd" },
                    }}
                  >
                    <TableCell align="center">{idx + 1}</TableCell>
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
                    <TableCell align="left">{txn.remarks || "-"}</TableCell>
                    <TableCell align="center">
                      {txn.party_name ? (
                        <Box lineHeight={1.2}>
                          <Typography variant="body2" fontWeight={600}>
                            {txn.party_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {txn.party_mobile_number || "-"}
                          </Typography>
                        </Box>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell align="center">{txn.category_name}</TableCell>
                    <TableCell align="center">{txn.payment_mode_name}</TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: txn.transaction_type === "IN" ? "green" : "red",
                        fontWeight: "bold",
                      }}
                    >
                      ₹ {Number(txn.amount).toLocaleString()}
                    </TableCell>
                    <TableCell align="right">₹ {txn.running_balance.toFixed(2)}</TableCell>
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
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

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
            inputProps={{
              min: user?.role?.toLowerCase() === "staff" ? dayjs().format("YYYY-MM-DD") : undefined,
            }}
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
            required
          />
          <TextField
            label="Remarks"
            name="remarks"
            multiline
            rows={2}
            value={formData.remarks}
            onChange={handleChange}
            required
          />
          <TextField
            label="Party Name"
            name="party_name"
            value={formData.party_name}
            onChange={handleChange}
          />
          <TextField
            label="Mobile Number"
            name="party_mobile_number"
            value={formData.party_mobile_number}
            onChange={handleChange}
          />
          
          <TextField
            select
            label="Category"
            name="category"
            required
            value={formData.category}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "__new__") {
                setAddCatOpen(true);
                return;
              }
              setFormData((prev) => ({ ...prev, category: value }));
            }}
          >
            {categories
              .filter(cat => {
                // Case 1: No cash books linked → show in all cash books
                if (!cat.cash_books || cat.cash_books.length === 0) return true;

                // Case 2: Linked → show only if current cash book is linked
                if (selectedCashBook) {
                  return cat.cash_books.includes(selectedCashBook.id);
                }

                // Case 3: No cash book selected (e.g. "All" view)
                return true;
              })
              .map(cat => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}

            <MenuItem
              value="__new__"
              sx={{ fontStyle: "italic", color: "primary.main" }}
            >
              + New Category
            </MenuItem>
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

          {!cashBookId && (
            <TextField
              select
              label="Cash Book"
              name="cash_book"
              value={formData.cash_book}
              onChange={handleChange}
            >
              {cashBooks.map((book) => (
                <MenuItem key={book.id} value={book.id}>{book.name}</MenuItem>
              ))}
            </TextField>
          )}
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

          {/* Cash Book */}
          {!cashBookId && (
            <FormControl fullWidth margin="dense">
              <InputLabel>Cash Book</InputLabel>
              <Select
                name="cash_book"
                value={editData?.cash_book || ""}
                onChange={(e) =>
                  setEditData(prev => prev ? { ...prev, cash_book: Number(e.target.value) } : prev)
                }
              >
                {cashBooks.map(c => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button color="primary" variant="contained" onClick={handleEditSubmit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addCatOpen} onClose={() => setAddCatOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <TextField
            label="Category Name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            fullWidth
            autoFocus
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddCatOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (!newCategoryName.trim()) return;

              try {
                // API call to create category
                const newCat = await createCategory({ name: newCategoryName.trim() });

                // Update categories list and select new one
                setCategories((prev) => [...prev, newCat]);
                setFormData((prev) => ({ ...prev, category: newCat.id }));

                // Reset and close
                setNewCategoryName("");
                setAddCatOpen(false);
              } catch (err) {
                enqueueSnackbar("Failed to create category", { variant: "error" });
              }
            }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransactionList;