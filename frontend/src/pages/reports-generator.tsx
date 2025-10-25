import dayjs from "dayjs";
import { useEffect, useState } from "react";

import { useMediaQuery } from "@mui/material";
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
  Checkbox,
  ListItemText,
} from "@mui/material";

import { getUsers } from "../api/users";
import { getCashBooks } from "../api/cash-book";
import { getOffCampuses } from "../api/offCampus";
import { getCategories } from "../api/categories";
import { getPaymentModes } from "../api/payment-modes";

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

  // Dropdown filters
  const [categories, setCategories] = useState<number[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
  const [modes, setModes] = useState<number[]>([]);
  const [modeOptions, setModeOptions] = useState<any[]>([]);
  const [users, setUsers] = useState<number[]>([]);
  const [userOptions, setUserOptions] = useState<any[]>([]);

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
        setCategoryOptions(cats);
        setModeOptions(mods);
        setUserOptions(usrs);
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

  const handleGenerate = () => {
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
  };

  // --- Reusable function for multi-select dropdown with "All" ---
  const MultiSelectWithAll = ({
    label,
    options,
    selectedValues,
    setSelectedValues,
  }: {
    label: string;
    options: any[];
    selectedValues: number[];
    setSelectedValues: (values: number[]) => void;
  }) => {
    const [open, setOpen] = useState(false);
    const allSelected = selectedValues.length === options.length;

    const handleChange = (event: any) => {
      const value = event.target.value;

      if (value.includes("All")) {
        if (allSelected) {
          setSelectedValues([]);
        } else {
          setSelectedValues(options.map((o) => o.id));
        }
      } else {
        setSelectedValues(value);
      }
    };

    return (
      <FormControl fullWidth size="small">
        <InputLabel>{label}</InputLabel>
        <Select
          multiple
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)} // ✅ Simplified and type-safe
          label={label}
          value={selectedValues}
          onChange={handleChange}
          renderValue={(selected) => {
            if (selected.length === 0) return "Select...";
            if (allSelected) return `All ${label}s`;
            const names = options
              .filter((o) => selected.includes(o.id))
              .map((o) => o.name);
            return names.join(", ");
          }}
          MenuProps={{
            PaperProps: { style: { maxHeight: 250 } },
          }}
        >
          {/* "All" option */}
          <MenuItem value="All" onClick={(e) => e.stopPropagation()}>
            <Checkbox checked={allSelected} />
            <ListItemText primary="All" />
          </MenuItem>

          {/* Individual options */}
          {options.map((option) => (
            <MenuItem
              key={option.id}
              value={option.id}
              onClick={(e) => e.stopPropagation()} // Prevent menu from closing
            >
              <Checkbox checked={selectedValues.includes(option.id)} />
              <ListItemText primary={option.name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
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
                <Grid size={{ xs: 12, md: 3 }}>
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
                <Grid size={{ xs: 12, md: 3 }}>
                  <MultiSelectWithAll
                    label="Category"
                    options={categoryOptions}
                    selectedValues={categories}
                    setSelectedValues={setCategories}
                  />
                </Grid>

                {/* Payment Mode */}
                <Grid size={{ xs: 12, md: 3 }}>
                  <MultiSelectWithAll
                    label="Payment Mode"
                    options={modeOptions}
                    selectedValues={modes}
                    setSelectedValues={setModes}
                  />
                </Grid>

                {/* User */}
                <Grid size={{ xs: 12, md: 3 }}>
                  <MultiSelectWithAll
                    label="User"
                    options={userOptions}
                    selectedValues={users}
                    setSelectedValues={setUsers}
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
