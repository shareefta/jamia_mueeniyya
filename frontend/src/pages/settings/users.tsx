import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import CancelIcon from "@mui/icons-material/Cancel";
import {
  Breadcrumbs, Link, Typography, Box, Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, TextField, MenuItem, Select, InputLabel, FormControl, 
  FormControlLabel, Checkbox, ListItemText, OutlinedInput, useMediaQuery, useTheme,
  Card, CardContent, Grid,
} from "@mui/material";

import { getRoles } from "src/api/roles";
import { getOffCampuses } from "src/api/offCampus";
import { UserProps, getUsers, createUser, updateUser, deleteUser} from "src/api/users";

export default function UsersPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [users, setUsers] = useState<UserProps[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [offCampuses, setOffCampuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New User states
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserMobile, setNewUserMobile] = useState("");
  const [newUserRole, setNewUserRole] = useState<number | "">("");
  const [newUserOffCampuses, setNewUserOffCampuses] = useState<number[]>([]);
  const [newUserIsActive, setNewUserIsActive] = useState(true);
  const [newUserPassword, setNewUserPassword] = useState("");

  // Edit states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingUserName, setEditingUserName] = useState("");
  const [editingUserEmail, setEditingUserEmail] = useState("");
  const [editingUserMobile, setEditingUserMobile] = useState("");
  const [editingUserRole, setEditingUserRole] = useState<number | "">("");
  const [editingUserOffCampuses, setEditingUserOffCampuses] = useState<number[]>([]);
  const [editingUserIsActive, setEditingUserIsActive] = useState(true);
  const [editingUserPassword, setEditingUserPassword] = useState("");

  // Fetch users, roles, offcampuses
  const fetchAll = async () => {
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
  };

  useEffect(() => {
    fetchAll();
    window.addEventListener("user-update", fetchAll);
    return () => window.removeEventListener("user-update", fetchAll);
  }, []);

  // Add User
  const handleAdd = async () => {
    if (!newUserName || !newUserMobile || !newUserRole || !newUserPassword) {
      enqueueSnackbar("Please fill all required fields", { variant: "warning" });
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
    } catch {
      enqueueSnackbar("Failed to add user", { variant: "error" });
    }
  };

  // Update user
  const handleUpdate = async (id: number) => {
    try {
      await updateUser(id, {
        name: editingUserName,
        email: editingUserEmail,
        mobile: editingUserMobile,
        role_id: editingUserRole,
        off_campus_ids: editingUserOffCampuses,
        is_active: editingUserIsActive,
        password: editingUserPassword || undefined,
      });
      enqueueSnackbar("User updated successfully!", { variant: "success" });
      setEditingId(null);
    } catch {
      enqueueSnackbar("Failed to update user", { variant: "error" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(id);
      enqueueSnackbar("User deleted successfully!", { variant: "success" });
    } catch {
      enqueueSnackbar("Failed to delete user", { variant: "error" });
    }
  };

  return (
    <Box p={isMobile ? 2 : 4}>
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
            <Grid size={{ xs: 6, sm: 6, md:3 }}>
              <TextField
                label="Name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 6, md:3 }}>
              <TextField
                label="Mobile"
                value={newUserMobile}
                onChange={(e) => setNewUserMobile(e.target.value)}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 6, md:3 }}>
              <TextField
                label="Email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 6, md:3 }}>
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

            <Grid size={{ xs: 6, sm: 6, md:4 }}>
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

            <Grid size={{ xs: 6, sm: 6, md:3 }}>
              <TextField
                type="password"
                label="Password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                size="small"
                fullWidth
              />
            </Grid>

            <Grid size={{ xs: 6, sm: 6, md:2 }}>
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

            <Grid size={{ xs: 6, sm: 6, md:2 }}>
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

      {/* User Table */}
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
                "Password",
                "Active",
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
              <TableRow
                key={user.id}
                sx={{
                  "&:nth-of-type(odd)": {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <TableCell>{index + 1}</TableCell>

                {/* Name */}
                <TableCell>
                  {editingId === user.id ? (
                    <TextField
                      value={editingUserName}
                      onChange={(e) => setEditingUserName(e.target.value)}
                      size="small"
                    />
                  ) : (
                    user.name
                  )}
                </TableCell>

                {/* Mobile */}
                <TableCell>
                  {editingId === user.id ? (
                    <TextField
                      value={editingUserMobile}
                      onChange={(e) => setEditingUserMobile(e.target.value)}
                      size="small"
                    />
                  ) : (
                    user.mobile
                  )}
                </TableCell>

                {/* Email */}
                <TableCell>
                  {editingId === user.id ? (
                    <TextField
                      value={editingUserEmail}
                      onChange={(e) => setEditingUserEmail(e.target.value)}
                      size="small"
                    />
                  ) : (
                    user.email || "—"
                  )}
                </TableCell>

                {/* Role */}
                <TableCell>
                  {editingId === user.id ? (
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <Select
                        value={editingUserRole}
                        onChange={(e) =>
                          setEditingUserRole(e.target.value as number)
                        }
                      >
                        {roles.map((r) => (
                          <MenuItem key={r.id} value={r.id}>
                            {r.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    user.role || "—"
                  )}
                </TableCell>

                {/* Off Campuses */}
                <TableCell>
                  {editingId === user.id ? (
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                      <Select
                        multiple
                        value={editingUserOffCampuses}
                        onChange={(e) => {
                          const value = e.target.value as number[];

                          if (value.includes(-1)) {
                            // If "All" is selected → select all or clear all if already selected
                            if (editingUserOffCampuses.length === offCampuses.length) {
                              setEditingUserOffCampuses([]);
                            } else {
                              setEditingUserOffCampuses(offCampuses.map((oc) => oc.id));
                            }
                          } else {
                            setEditingUserOffCampuses(value);
                          }
                        }}
                        input={<OutlinedInput label="Sections" />}
                        renderValue={(selected) => {
                          if (selected.length === offCampuses.length) return "All Sections";
                          return offCampuses
                            .filter((oc) => selected.includes(oc.id))
                            .map((oc) => oc.name)
                            .join(", ");
                        }}
                        MenuProps={{
                          PaperProps: {
                            style: { maxHeight: 250, width: 250 },
                          },
                        }}
                        sx={{
                          width: 220, // ✅ Fixed width
                        }}
                      >
                        {/* Select All Option */}
                        <MenuItem value={-1}>
                          <Checkbox
                            checked={
                              editingUserOffCampuses.length === offCampuses.length &&
                              offCampuses.length > 0
                            }
                            indeterminate={
                              editingUserOffCampuses.length > 0 &&
                              editingUserOffCampuses.length < offCampuses.length
                            }
                          />
                          <ListItemText primary="All Sections" />
                        </MenuItem>

                        {/* Regular Off-Campuses */}
                        {offCampuses.map((oc) => (
                          <MenuItem key={oc.id} value={oc.id}>
                            <Checkbox checked={editingUserOffCampuses.includes(oc.id)} />
                            <ListItemText primary={oc.name} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    user.off_campuses.map((oc) => oc.name).join(", ") || "—"
                  )}
                </TableCell>

                {/* Password */}
                <TableCell>
                  {editingId === user.id ? (
                    <TextField
                      type="password"
                      value={editingUserPassword}
                      onChange={(e) => setEditingUserPassword(e.target.value)}
                      size="small"
                    />
                  ) : (
                    "••••••"
                  )}
                </TableCell>

                {/* Active */}
                <TableCell align="center">
                  {editingId === user.id ? (
                    <Checkbox
                      checked={editingUserIsActive}
                      onChange={(e) =>
                        setEditingUserIsActive(e.target.checked)
                      }
                    />
                  ) : user.is_active ? (
                    "✅"
                  ) : (
                    "❌"
                  )}
                </TableCell>

                {/* Actions */}
                <TableCell>
                  {editingId === user.id ? (
                    <>
                      <Button
                        color="success"
                        size="small"
                        onClick={() => handleUpdate(user.id)}
                      >
                        <SaveIcon fontSize="small" />
                      </Button>
                      <Button
                        color="inherit"
                        size="small"
                        onClick={() => setEditingId(null)}
                      >
                        <CancelIcon fontSize="small" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        color="primary"
                        size="small"
                        onClick={() => {
                          setEditingId(user.id);
                          setEditingUserName(user.name);
                          setEditingUserEmail(user.email || "");
                          setEditingUserMobile(user.mobile);
                          const matchedRole = roles.find(
                            (r) => r.name === user.role
                          );
                          setEditingUserRole(matchedRole ? matchedRole.id : "");
                          setEditingUserOffCampuses(
                            user.off_campuses.map((oc) => oc.id)
                          );
                          setEditingUserIsActive(user.is_active);
                          setEditingUserPassword("");
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </Button>
                      <Button
                        color="error"
                        size="small"
                        onClick={() => handleDelete(user.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}