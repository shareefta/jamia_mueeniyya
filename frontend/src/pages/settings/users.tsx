import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";

import { Edit, Delete } from "@mui/icons-material";
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
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormControlLabel,
  Checkbox,
  ListItemText,
  OutlinedInput,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Grid,
  Stack,
  IconButton,
  Collapse,
} from "@mui/material";

import { getRoles } from "src/api/roles";
import { getOffCampuses } from "src/api/offCampus";
import EditUserDialog from "src/pages/edit-user-dalog";
import {
  UserProps,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "src/api/users";

export default function UsersPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [users, setUsers] = useState<UserProps[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [offCampuses, setOffCampuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add User states
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserMobile, setNewUserMobile] = useState("");
  const [newUserRole, setNewUserRole] = useState<number | "">("");
  const [newUserOffCampuses, setNewUserOffCampuses] = useState<number[]>([]);
  const [newUserIsActive, setNewUserIsActive] = useState(true);
  const [newUserPassword, setNewUserPassword] = useState("");

  // Edit dialog state
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const handleToggleCard = (userId: number) => {
    setExpandedCard((prev) => (prev === userId ? null : userId));
  };

  // Fetch all data
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [userData, roleData, offCampusData] = await Promise.all([
        getUsers(),
        getRoles(),
        getOffCampuses(),
      ]);
      setUsers(userData);
      setRoles(roleData);
      setOffCampuses(offCampusData);
    } catch {
      enqueueSnackbar("Failed to fetch data", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Add User
  const handleAdd = async () => {
    if (!newUserName || !newUserMobile || !newUserRole || !newUserPassword) {
      enqueueSnackbar("Please fill all required fields", {
        variant: "warning",
      });
      return;
    }
    try {
      await createUser({
        name: newUserName,
        email: newUserEmail,
        mobile: newUserMobile,
        role_id: newUserRole,
        off_campus_ids: newUserOffCampuses,
        is_active: newUserIsActive,
        password: newUserPassword,
      });
      enqueueSnackbar("User added successfully!", { variant: "success" });
      setNewUserName("");
      setNewUserEmail("");
      setNewUserMobile("");
      setNewUserRole("");
      setNewUserOffCampuses([]);
      setNewUserPassword("");
      setNewUserIsActive(true);
      fetchAll();
    } catch {
      enqueueSnackbar("Failed to add user", { variant: "error" });
    }
  };

  // Delete User
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(id);
      enqueueSnackbar("User deleted successfully!", { variant: "success" });
      fetchAll();
    } catch {
      enqueueSnackbar("Failed to delete user", { variant: "error" });
    }
  };

  // Edit user - open dialog
  const handleOpenEditDialog = (user: UserProps) => {
    setSelectedUser({
      id: user.id,
      name: user.name,
      email: user.email || "",
      mobile: user.mobile,
      role_id: roles.find((r) => r.name === user.role)?.id || "",
      off_campus_ids: user.off_campuses?.map((oc) => oc.id) || [],
      is_active: user.is_active,
      password: "",
    });
    setEditDialogOpen(true);
  };

  // Close dialog
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedUser(null);
  };

  // Save user from dialog
  const handleSaveUser = async (updatedUser: any) => {
    try {
      await updateUser(updatedUser.id, {
        name: updatedUser.name,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        role_id: updatedUser.role_id,
        off_campus_ids: updatedUser.off_campus_ids,
        is_active: updatedUser.is_active,
        password: updatedUser.password || undefined,
      });
      enqueueSnackbar("User updated successfully!", { variant: "success" });
      fetchAll();
    } catch {
      enqueueSnackbar("Failed to update user", { variant: "error" });
    }
  };

  return (
    <Box p={isMobile ? 2 : 4}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component="button" onClick={() => navigate("/settings")}>
          Settings
        </Link>
        <Typography color="text.primary">Users</Typography>
      </Breadcrumbs>

      <Typography variant="h6" fontWeight={600} gutterBottom>
        Manage Users
      </Typography>

      {/* Add User Form */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 6, md: 3 }}>
              <TextField
                label="Name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 6, md: 3 }}>
              <TextField
                label="Mobile"
                value={newUserMobile}
                onChange={(e) => setNewUserMobile(e.target.value)}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 6, md: 3 }}>
              <TextField
                label="Email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Role</InputLabel>
                <Select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as number)}
                  label="Role"
                >
                  {roles.map((r) => (
                    <MenuItem key={r.id} value={r.id}>
                      {r.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, sm: 6, md: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Sections</InputLabel>
                <Select
                  multiple
                  value={newUserOffCampuses}
                  onChange={(e) =>
                    setNewUserOffCampuses(e.target.value as number[])
                  }
                  input={<OutlinedInput label="Sections" />}
                  renderValue={(selected) =>
                    offCampuses
                      .filter((oc) => selected.includes(oc.id))
                      .map((oc) => oc.name)
                      .join(", ")
                  }
                >
                  {offCampuses.map((oc) => (
                    <MenuItem key={oc.id} value={oc.id}>
                      <Checkbox checked={newUserOffCampuses.includes(oc.id)} />
                      <ListItemText primary={oc.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, sm: 6, md: 3 }}>
              <TextField
                type="password"
                label="Password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 6, md: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newUserIsActive}
                    onChange={(e) => setNewUserIsActive(e.target.checked)}
                  />
                }
                label="Active"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 6, md: 2 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleAdd}
                sx={{ height: "100%" }}
              >
                Add User
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* User List */}
      {loading ? (
        <Typography>Loading...</Typography>
      ) : isMobile ? (
        // ✅ Mobile View (Cards)
        <Stack spacing={2}>
          {users.map((user, index) => (
            <Card
              key={user.id}
              onClick={() => handleToggleCard(user.id)}
              sx={{
                borderRadius: 2,
                boxShadow: 3,
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": { boxShadow: 6, transform: "scale(1.01)" },
              }}
            >
              <CardContent>
                {/* Header info */}
                <Typography variant="subtitle2" color="text.secondary">
                  Sl. No: {index + 1}
                </Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  {user.name}
                </Typography>
                <Typography variant="body2">Mobile: {user.mobile}</Typography>
                <Typography variant="body2">
                  Sections: {user.off_campuses.map((oc) => oc.name).join(", ") || "—"}
                </Typography>

                {/* ✅ Expanded Content */}
                <Collapse in={expandedCard === user.id} timeout="auto" unmountOnExit>
                  <Box mt={1} pt={1} borderTop="1px solid #eee">
                    <Typography variant="body2">Email: {user.email || "—"}</Typography>
                    <Typography variant="body2">Role: {user.role}</Typography>
                    <Typography
                      variant="body2"
                      color={user.is_active ? "green" : "text.secondary"}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </Typography>

                    <Box mt={2} display="flex" gap={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card toggle
                          handleOpenEditDialog(user);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card toggle
                          handleDelete(user.id);
                        }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        // ✅ Desktop Table
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 3,
            boxShadow: 4,
            maxWidth: "100%",
            overflowX: "auto",
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {[
                  "#",
                  "Name",
                  "Mobile",
                  "Email",
                  "Role",
                  "Sections",
                  "Status",
                  "Actions",
                ].map((col) => (
                  <TableCell key={col} sx={{ fontWeight: 600 }}>
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.mobile}</TableCell>
                  <TableCell>{user.email || "—"}</TableCell>
                  <TableCell>{user.role || "—"}</TableCell>
                  <TableCell>
                    {user.off_campuses.map((oc) => oc.name).join(", ") || "—"}
                  </TableCell>
                  <TableCell>
                    {user.is_active ? "Active" : "Inactive"}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenEditDialog(user)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(user.id)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Edit User Dialog */}
      <EditUserDialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        user={selectedUser}
        roles={roles}
        offCampuses={offCampuses}
        onSave={handleSaveUser}
      />
    </Box>
  );
}