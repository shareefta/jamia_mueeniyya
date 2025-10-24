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
import { getCategories } from "../api/categories";
import { getOffCampuses } from "../api/offCampus";
import { getPaymentModes } from "../api/payment-modes";

export default function ReportGenerator() {
  const isMobile = useMediaQuery("(max-width:600px)");

  // Filters
  const [dateFilter, setDateFilter] = useState("today");
  const [typeFilter, setTypeFilter] = useState("all");
  const [customDateRange, setCustomDateRange] = useState({
    from: dayjs().format("YYYY-MM-DD"),
    to: dayjs().format("YYYY-MM-DD"),
  });

  // Dynamic data
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [modes, setModes] = useState<string[]>([]);
  const [modeOptions, setModeOptions] = useState<string[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [userOptions, setUserOptions] = useState<string[]>([]);
  const [campuses, setCampuses] = useState<string[]>([]);
  const [campusOptions, setCampusOptions] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);

  // Fetch filter options
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
        setCampusOptions(camps.map((c: any) => c.name));
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleGenerate = () => {
    const filters = {
      dateFilter,
      typeFilter,
      categories,
      modes,
      users,
      campuses,
      customDateRange,
    };
    console.log("Generate report with filters:", filters);
    // TODO: API call to backend for generating or downloading report
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

      <Card
        sx={{
          borderRadius: 3,
          boxShadow: 4,
          p: isMobile ? 1 : 2,
        }}
      >
        <CardContent>
          <Grid container spacing={isMobile ? 2 : 3}>
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

            {/* Type */}
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
                options={categoryOptions}
                value={categories}
                onChange={(e, newVal) => setCategories(newVal)}
                renderInput={(params) => (
                  <TextField {...params} label="Category" placeholder="Select..." />
                )}
              />
            </Grid>

            {/* Payment Mode */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Autocomplete
                multiple
                options={modeOptions}
                value={modes}
                onChange={(e, newVal) => setModes(newVal)}
                renderInput={(params) => (
                  <TextField {...params} label="Payment Mode" placeholder="Select..." />
                )}
              />
            </Grid>

            {/* User */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Autocomplete
                multiple
                options={userOptions}
                value={users}
                onChange={(e, newVal) => setUsers(newVal)}
                renderInput={(params) => (
                  <TextField {...params} label="User" placeholder="Select..." />
                )}
              />
            </Grid>

            {/* Campus */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Autocomplete
                multiple
                options={campusOptions}
                value={campuses}
                onChange={(e, newVal) => setCampuses(newVal)}
                renderInput={(params) => (
                  <TextField {...params} label="Campus" placeholder="Select..." />
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
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
