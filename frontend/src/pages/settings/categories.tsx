import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";

import SearchIcon from "@mui/icons-material/Search";
import {
  Breadcrumbs, Link, Typography, Box,
  Button, Table, TableBody, TableCell, InputAdornment,
  TableContainer, TableHead, TableRow, Paper, TextField, ListSubheader,
  MenuItem, Select, InputLabel, FormControl, Checkbox, ListItemText
} from "@mui/material";

import { getCashBooks } from "src/api/cash-book";
import {
  CategoryProps,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "src/api/categories";

export default function CategoriesPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [cashBooks, setCashBooks] = useState<{ id: number; name: string }[]>([]);

  // New Category states
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedCashBooks, setSelectedCashBooks] = useState<number[]>([]);

  // Edit states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [editingCashBooks, setEditingCashBooks] = useState<number[]>([]);

  const [searchTerm, setSearchTerm] = useState("");

  // Filter cash books by search term
  const filteredCashBooks = useMemo(
    () => cashBooks.filter((cb) =>
      cb.name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [cashBooks, searchTerm]
  );


  // Fetch categories
  const fetchCategories = async () => {
    try {
      const categoryData = await getCategories();
      setCategories(categoryData);
    } catch {
      enqueueSnackbar("Failed to fetch categories", { variant: "error" });
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchCategories();
    getCashBooks().then(setCashBooks);

    const handleUpdateEvent = () => fetchCategories();
    window.addEventListener("category-update", handleUpdateEvent);
    return () => window.removeEventListener("category-update", handleUpdateEvent);
  }, []);

  // Add Category
  const handleAdd = async () => {
    if (!newCategoryName) {
      enqueueSnackbar("Please fill name field", { variant: "warning" });
      return;
    }
    try {
      await createCategory({
        name: newCategoryName,
        cash_books: selectedCashBooks,
      });
      enqueueSnackbar("Category added successfully!", { variant: "success" });
      setNewCategoryName("");
      setSelectedCashBooks([]);
      fetchCategories();
    } catch {
      enqueueSnackbar("Failed to add category", { variant: "error" });
    }
  };

  // Update Category
  const handleUpdate = async (id: number) => {
    if (!editingCategoryName) {
      enqueueSnackbar("Please fill name field", { variant: "warning" });
      return;
    }
    try {
      await updateCategory(id, {
        name: editingCategoryName,
        cash_books: editingCashBooks,
      });
      enqueueSnackbar("Category updated successfully!", { variant: "success" });
      setEditingId(null);
      setEditingCategoryName("");
      setEditingCashBooks([]);
      fetchCategories();
    } catch {
      enqueueSnackbar("Failed to update category", { variant: "error" });
    }
  };

  // Delete Category
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this Category?")) return;
    try {
      await deleteCategory(id);
      enqueueSnackbar("Category deleted successfully!", { variant: "success" });
      fetchCategories();
    } catch {
      enqueueSnackbar("Failed to delete Category", { variant: "error" });
    }
  };

  return (
    <>
      {/* Breadcrumb */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component="button" onClick={() => navigate("/settings")}>
          Settings
        </Link>
        <Typography>Categories</Typography>
      </Breadcrumbs>

      <Typography variant="h6" gutterBottom>
        Categories
      </Typography>

      {/* Add Category Box */}
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
            label="Category Name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            size="small"
            sx={{ backgroundColor: "white" }}
          />

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Cash Books</InputLabel>
            <Select
              multiple
              value={selectedCashBooks}
              onChange={(e) => {
                const value = e.target.value as number[];
                if (value.includes(0)) {
                  if (selectedCashBooks.length === cashBooks.length) {
                    setSelectedCashBooks([]); // unselect all
                  } else {
                    setSelectedCashBooks(cashBooks.map((cb) => cb.id)); // select all
                  }
                } else {
                  setSelectedCashBooks(value);
                }
              }}
              size="small"
              renderValue={(selected) => {
                if (selected.length === 0) return "Select Cash Books";
                if (selected.length === cashBooks.length) return "All Cash Books";
                return cashBooks
                  .filter((cb) => selected.includes(cb.id))
                  .map((cb) => cb.name)
                  .join(", ");
              }}
              MenuProps={{
                PaperProps: { style: { maxHeight: 300, width: 250 } },
              }}
            >
              <ListSubheader>
                <TextField
                  size="small"
                  placeholder="Search..."
                  fullWidth
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ backgroundColor: "white", mt: 1, mb: 1 }}
                />
              </ListSubheader>

              {/* "All" Option */}
              <MenuItem value={0}>
                <Checkbox
                  checked={selectedCashBooks.length === cashBooks.length && cashBooks.length > 0}
                  indeterminate={
                    selectedCashBooks.length > 0 &&
                    selectedCashBooks.length < cashBooks.length
                  }
                />
                <ListItemText primary="All" />
              </MenuItem>

              {/* Filtered Cash Books */}
              {filteredCashBooks.length > 0 ? (
                filteredCashBooks.map((cb) => (
                  <MenuItem key={cb.id} value={cb.id}>
                    <Checkbox checked={selectedCashBooks.includes(cb.id)} />
                    <ListItemText primary={cb.name} />
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No results found</MenuItem>
              )}
            </Select>
          </FormControl>

          <Button variant="contained" onClick={handleAdd}>
            Add Category
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ maxWidth: 500, boxShadow: 3, borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ textAlign: "center" }}>SL. No.</TableCell>
              <TableCell sx={{ textAlign: "center" }}>Category Name</TableCell>
              <TableCell sx={{ textAlign: "center" }}>Cash Books</TableCell>
              <TableCell sx={{ textAlign: "center" }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {categories.map((category, index) => (
              <TableRow key={category.id}>
                <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>

                <TableCell>
                  {editingId === category.id ? (
                    <>
                      <TextField
                        label="Name"
                        value={editingCategoryName}
                        onChange={(e) => setEditingCategoryName(e.target.value)}
                        size="small"
                        sx={{ mb: 1, backgroundColor: "white", minWidth: 200 }}
                      />

                      <Select
                        multiple
                        value={editingCashBooks}
                        onChange={(e) => {
                          const value = e.target.value as number[];
                          if (value.includes(0)) {
                            if (editingCashBooks.length === cashBooks.length) {
                              setEditingCashBooks([]);
                            } else {
                              setEditingCashBooks(cashBooks.map((cb) => cb.id));
                            }
                          } else {
                            setEditingCashBooks(value);
                          }
                        }}
                        size="small"
                        sx={{ minWidth: 200, backgroundColor: "white" }}
                        renderValue={(selected) => {
                          if (selected.length === 0) return "Select Cash Books";
                          if (selected.length === cashBooks.length) return "All Cash Books";
                          return cashBooks
                            .filter((cb) => selected.includes(cb.id))
                            .map((cb) => cb.name)
                            .join(", ");
                        }}
                        MenuProps={{
                          PaperProps: { style: { maxHeight: 300, width: 250 } },
                        }}
                      >
                        <ListSubheader>
                          <TextField
                            size="small"
                            placeholder="Search..."
                            fullWidth
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <SearchIcon fontSize="small" />
                                </InputAdornment>
                              ),
                            }}
                            sx={{ backgroundColor: "white", mt: 1, mb: 1 }}
                          />
                        </ListSubheader>

                        <MenuItem value={0}>
                          <Checkbox
                            checked={editingCashBooks.length === cashBooks.length && cashBooks.length > 0}
                            indeterminate={
                              editingCashBooks.length > 0 &&
                              editingCashBooks.length < cashBooks.length
                            }
                          />
                          <ListItemText primary="All" />
                        </MenuItem>

                        {filteredCashBooks.length > 0 ? (
                          filteredCashBooks.map((cb) => (
                            <MenuItem key={cb.id} value={cb.id}>
                              <Checkbox checked={editingCashBooks.includes(cb.id)} />
                              <ListItemText primary={cb.name} />
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled>No results found</MenuItem>
                        )}
                      </Select>
                    </>
                  ) : (
                    category.name
                  )}
                </TableCell>

                <TableCell sx={{ textAlign: "center" }}>
                  {editingId === category.id
                    ? "Editing..."
                    : (category.cash_books_details ?? [])
                        .map((cb) => cb.name)
                        .join(", ")}
                </TableCell>

                <TableCell sx={{ textAlign: "center" }}>
                  {editingId === category.id ? (
                    <>
                      <Button size="small" onClick={() => handleUpdate(category.id)}>
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
                          setEditingId(category.id);
                          setEditingCategoryName(category.name);
                          setEditingCashBooks(category.cash_books ?? []);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDelete(category.id)}
                      >
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