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

  // New Category states
  const [newCategoryName, setNewCategoryName] = useState("");

  // Edit states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");

  // Fetchers
  const fetchCategories = async () => {
    try {
      const categoryData = await getCategories();
      setCategories(categoryData);
    } catch {
      enqueueSnackbar("Failed to fetch categories", { variant: "error" });
    }
  };

  useEffect(() => {
    fetchCategories();

    // ✅ Listen for category updates
    const handleUpdateEvent = () => fetchCategories();
    window.addEventListener('category-update', handleUpdateEvent);

    return () => {
      window.removeEventListener('category-update', handleUpdateEvent);
    };
  }, []);

  // Handlers
  const handleAdd = async () => {
    if (!newCategoryName) {
      enqueueSnackbar("Please fill name field", { variant: "warning" });
      return;
    }
    try {
      await createCategory({
        name: newCategoryName,
      });
      enqueueSnackbar("Category added successfully!", { variant: "success" });
      // reset
      setNewCategoryName("");
      fetchCategories();
    } catch {
      enqueueSnackbar("Failed to add category", { variant: "error" });
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editingCategoryName) {
      enqueueSnackbar("Please fill name field", { variant: "warning" });
      return;
    }
    try {
      await updateCategory(id, {
        name: editingCategoryName,
      });
      enqueueSnackbar("Category updated successfully!", { variant: "success" });
      setEditingId(null);
      setEditingCategoryName("");
      fetchCategories();
    } catch {
      enqueueSnackbar("Failed to update category", { variant: "error" });
    }
  }; 

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
              <TableCell sx={{ textAlign: "center" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category, index) => (
              <TableRow key={category.id}>
                <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>

                {/* Name */}
                <TableCell>
                  {editingId === category.id ? (
                    <TextField
                      value={editingCategoryName}
                      onChange={(e) => setEditingCategoryName(e.target.value)}
                      size="small"
                      sx={{ backgroundColor: "white", minWidth: 200 }}
                    />
                  ) : (
                    category.name
                  )}
                </TableCell>

                {/* Actions */}
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
                        }}
                      >
                        Edit
                      </Button>
                      <Button size="small" color="error" onClick={() => handleDelete(category.id)}>
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