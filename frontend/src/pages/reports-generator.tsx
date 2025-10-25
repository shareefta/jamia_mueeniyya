import dayjs from "dayjs";
import { useEffect, useState } from "react";

import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
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
  Checkbox,
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
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

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
                <Grid size={{ xs: 3 }}>
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
                <Grid size={{ xs: 3 }}>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[{ id: 0, name: "All" }, ...categoryOptions]}
                    getOptionLabel={(option) => option.name}
                    value={
                      categories.length === categoryOptions.length
                        ? [{ id: 0, name: "All" }, ...categoryOptions]
                        : categories
                    }
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    onChange={(event, newValue) => {
                      const isAllSelected = newValue.some((item) => item.id === 0);
                      if (isAllSelected) {
                        // If "All" selected → select all
                        setCategories(categoryOptions);
                      } else {
                        // Otherwise set selected normally
                        setCategories(newValue.filter((item) => item.id !== 0));
                      }
                    }}
                    renderOption={(props, option, { selected }) => {
                      const isAll = option.id === 0;
                      const allSelected = categories.length === categoryOptions.length;

                      return (
                        <li {...props}>
                          <Checkbox
                            icon={icon}
                            checkedIcon={checkedIcon}
                            checked={isAll ? allSelected : selected}
                          />
                          {option.name}
                        </li>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Category" placeholder="Select categories..." />
                    )}
                  />
                </Grid>

                {/* Payment Mode */}
                <Grid size={{ xs: 3 }}>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[{ id: 0, name: "All" }, ...modeOptions]}
                    getOptionLabel={(option) => option.name}
                    value={
                      modes.length === modeOptions.length
                        ? [{ id: 0, name: "All" }, ...modeOptions]
                        : modes
                    }
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    onChange={(event, newValue) => {
                      const isAllSelected = newValue.some((item) => item.id === 0);
                      if (isAllSelected) {
                        // If "All" selected → select all
                        setModes(modeOptions);
                      } else {
                        // Otherwise set selected normally
                        setModes(newValue.filter((item) => item.id !== 0));
                      }
                    }}
                    renderOption={(props, option, { selected }) => {
                      const isAll = option.id === 0;
                      const allSelected = modes.length === modeOptions.length;

                      return (
                        <li {...props}>
                          <Checkbox
                            icon={icon}
                            checkedIcon={checkedIcon}
                            checked={isAll ? allSelected : selected}
                          />
                          {option.name}
                        </li>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Payment Mode" placeholder="Select payment modes..." />
                    )}
                  />
                </Grid>

                {/* User */}
                <Grid size={{ xs: 3 }}>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[{ id: 0, name: "All" }, ...userOptions]}
                    getOptionLabel={(option) => option.name}
                    value={
                      users.length === userOptions.length
                        ? [{ id: 0, name: "All" }, ...userOptions]
                        : users
                    }
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    onChange={(event, newValue) => {
                      const isAllSelected = newValue.some((item) => item.id === 0);
                      if (isAllSelected) {
                        // If "All" selected → select all
                        setUsers(userOptions);
                      } else {
                        // Otherwise set selected normally
                        setUsers(newValue.filter((item) => item.id !== 0));
                      }
                    }}
                    renderOption={(props, option, { selected }) => {
                      const isAll = option.id === 0;
                      const allSelected = users.length === userOptions.length;

                      return (
                        <li {...props}>
                          <Checkbox
                            icon={icon}
                            checkedIcon={checkedIcon}
                            checked={isAll ? allSelected : selected}
                          />
                          {option.name}
                        </li>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="User" placeholder="Select users..." />
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