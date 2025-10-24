import dayjs from "dayjs";
import { useEffect, useState } from "react";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  CircularProgress,
  Autocomplete,
  useMediaQuery,
} from "@mui/material";

import { getUsers } from "../api/users";
import { getCashBooks } from "../api/cash-book";
import { getOffCampuses } from "../api/offCampus";
import { getCategories, CategoryProps } from "../api/categories";
import { getPaymentModes, PaymentModeProps } from "../api/payment-modes";

interface SelectOption {
  id: number;
  name: string;
}

export default function ReportGenerator() {
  const isMobile = useMediaQuery("(max-width:600px)");

  // Step 1: campus & cash book
  const [campuses, setCampuses] = useState<any[]>([]);
  const [selectedCampus, setSelectedCampus] = useState<number | null>(null);

  const [cashBooks, setCashBooks] = useState<any[]>([]);
  const [selectedCashBook, setSelectedCashBook] = useState<number | null>(null);

  // Filters
  const [dateFilter, setDateFilter] = useState("today");
  const [typeFilter, setTypeFilter] = useState("all");
  const [customDateRange, setCustomDateRange] = useState({
    from: dayjs().format("YYYY-MM-DD"),
    to: dayjs().format("YYYY-MM-DD"),
  });

  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryProps[]>([]);
  const [modes, setModes] = useState<PaymentModeProps[]>([]);
  const [modeOptions, setModeOptions] = useState<PaymentModeProps[]>([]);
  const [users, setUsers] = useState<SelectOption[]>([]);
  const [userOptions, setUserOptions] = useState<SelectOption[]>([]);

  const [loading, setLoading] = useState(true);

  // Fetch base data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cats, mods, usrs, camps] = await Promise.all([
          getCategories(),
          getPaymentModes(),
          getUsers(),
          getOffCampuses(),
        ]);
        setCategoryOptions(cats.map((c: any) => c.name));
        setModeOptions(mods.map((m: any) => m.name));
        setUserOptions(usrs.map((u: any) => u.name));
        setCampuses(camps);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Load cash books when campus changes
  useEffect(() => {
    const loadCashBooks = async () => {
      if (selectedCampus) {
        const allBooks = await getCashBooks();
        const filtered = allBooks.filter((b: any) => b.campus === selectedCampus);
        setCashBooks(filtered);
      }
    };
    loadCashBooks();
  }, [selectedCampus]);

  const handleGenerate = async () => {
    const filters = {
      campus: selectedCampus,
      cash_book: selectedCashBook,
      dateFilter,
      typeFilter,
      categories,
      modes,
      users,
      customDateRange,
    };

    console.log("Generate report with filters:", filters);
    // ⬇️ Will implement PDF/Excel generation in Stage 2
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="70vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={isMobile ? 2 : 4}>
      <Typography
        variant={isMobile ? "h6" : "h5"}
        fontWeight="bold"
        mb={3}
        textAlign={isMobile ? "center" : "left"}
      >
        📊 Prepare & Download Reports
      </Typography>

      <Card sx={{ borderRadius: 3, boxShadow: 4, p: isMobile ? 1 : 2 }}>
        <CardContent>
          <Grid container spacing={isMobile ? 2 : 3}>
            {/* Step 1: Campus */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Select Campus</InputLabel>
                <Select
                  value={selectedCampus || ""}
                  onChange={(e) => {
                    setSelectedCampus(Number(e.target.value));
                    setSelectedCashBook(null);
                  }}
                  label="Select Campus"
                >
                  {campuses.map((campus) => (
                    <MenuItem key={campus.id} value={campus.id}>
                      {campus.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Step 2: Cash Book */}
            {selectedCampus && (
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Select Cash Book</InputLabel>
                  <Select
                    value={selectedCashBook || ""}
                    onChange={(e) => setSelectedCashBook(Number(e.target.value))}
                    label="Select Cash Book"
                  >
                    {cashBooks.map((cb) => (
                      <MenuItem key={cb.id} value={cb.id}>
                        {cb.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Step 3: Filters */}
            {selectedCashBook && (
              <>
                {/* Date Filters */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel>Date Range</InputLabel>
                    <Select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      label="Date Range"
                    >
                      <MenuItem value="today">Today</MenuItem>
                      <MenuItem value="yesterday">Yesterday</MenuItem>
                      <MenuItem value="this_month">This Month</MenuItem>
                      <MenuItem value="single">Single Date</MenuItem>
                      <MenuItem value="custom">Custom Dates</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {(dateFilter === "single" || dateFilter === "custom") && (
                  <>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        label={dateFilter === "single" ? "Select Date" : "From Date"}
                        type="date"
                        value={customDateRange.from}
                        onChange={(e) =>
                          setCustomDateRange({ ...customDateRange, from: e.target.value })
                        }
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    {dateFilter === "custom" && (
                      <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                          fullWidth
                          label="To Date"
                          type="date"
                          value={customDateRange.to}
                          onChange={(e) =>
                            setCustomDateRange({ ...customDateRange, to: e.target.value })
                          }
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                    )}
                  </>
                )}

                {/* Type Filter */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      label="Type"
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="IN">In</MenuItem>
                      <MenuItem value="OUT">Out</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Category */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Autocomplete
                    multiple
                    options={[{ id: 0, name: "All" }, ...categoryOptions]}
                    getOptionLabel={(option) => option.name}
                    value={
                      categories.length === categoryOptions.length
                        ? [{ id: 0, name: "All" }, ...categoryOptions]
                        : categories
                    }
                    onChange={(e, newVal) => {
                      if (newVal.some(opt => opt.id === 0)) {
                        // If "All" selected → select all actual categories
                        setCategories(categoryOptions);
                      } else {
                        setCategories(newVal as CategoryProps[]);
                      }
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Category" placeholder="Select..." />
                    )}
                  />
                </Grid>

                {/* Payment Mode */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Autocomplete
                    multiple
                    options={[{ id: 0, name: "All" }, ...modeOptions]}
                    getOptionLabel={(option) => option.name}
                    value={
                      modes.length === modeOptions.length
                        ? [{ id: 0, name: "All" }, ...modeOptions]
                        : modes
                    }
                    onChange={(e, newVal) => {
                      if (newVal.some(opt => opt.id === 0)) {
                        setModes(modeOptions);
                      } else {
                        setModes(newVal);
                      }
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Payment Mode" placeholder="Select..." />
                    )}
                  />
                </Grid>

                {/* User */}
                <Grid size={{ xs: 12 }}>
                  <Autocomplete
                    multiple
                    options={[{ id: 0, name: "All" }, ...userOptions]}
                    getOptionLabel={(option) => option.name}
                    value={
                      users.length === userOptions.length
                        ? [{ id: 0, name: "All" }, ...userOptions]
                        : users
                    }
                    onChange={(e, newVal) => {
                      if (newVal.some(opt => opt.id === 0)) {
                        setUsers(userOptions);
                      } else {
                        setUsers(newVal);
                      }
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="User" placeholder="Select..." />
                    )}
                  />
                </Grid>

                {/* Generate Button */}
                <Grid size={{ xs: 12 }}>
                  <Box textAlign="center" mt={isMobile ? 2 : 3}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      sx={{
                        px: 5,
                        py: 1.5,
                        borderRadius: 3,
                        fontWeight: "bold",
                        textTransform: "none",
                      }}
                      onClick={handleGenerate}
                    >
                      Generate Report
                    </Button>
                  </Box>
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}