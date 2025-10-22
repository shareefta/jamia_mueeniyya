import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import CancelIcon from "@mui/icons-material/Cancel";
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
} from "@mui/material";

import { getRoles } from "src/api/roles";
import { getOffCampuses } from "src/api/offCampus";
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

  const [users, setUsers] = useState<UserProps[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [offCampuses, setOffCampuses] = useState<any[]>([]);

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
    <>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component="button" onClick={() => navigate("/settings")}>
          Settings
        </Link>
        <Typography>Users</Typography>
      </Breadcrumbs>

      <Typography variant="h6" gutterBottom>
        Users
      </Typography>

      {/* Add User Form */}
      <Box
        sx={{
          maxWidth: 1400,
          mb: 3,
          p: 2,
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
          background: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <TextField
          label="Name"
          value={newUserName}
          onChange={(e) => setNewUserName(e.target.value)}
          size="small"
          sx={{ backgroundColor: "white" }}
        />
        <TextField
          label="Mobile"
          value={newUserMobile}
          onChange={(e) => setNewUserMobile(e.target.value)}
          size="small"
          sx={{ backgroundColor: "white" }}
        />
        <TextField
          label="Email"
          value={newUserEmail}
          onChange={(e) => setNewUserEmail(e.target.value)}
          size="small"
          sx={{ backgroundColor: "white" }}
        />
        <FormControl sx={{ minWidth: 180, backgroundColor: "white" }} size="small">
          <InputLabel>Role</InputLabel>
          <Select
            value={newUserRole}
            onChange={(e) => setNewUserRole(e.target.value as number)}
            label="Role"
          >
            {roles.map((r) => (
              <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200, backgroundColor: "white" }} size="small">
          <InputLabel>Off Campuses</InputLabel>
          <Select
            multiple
            value={newUserOffCampuses}
            onChange={(e) => setNewUserOffCampuses(e.target.value as number[])}
            input={<OutlinedInput label="Off Campuses" />}
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
        <TextField
          type="password"
          label="Password"
          value={newUserPassword}
          onChange={(e) => setNewUserPassword(e.target.value)}
          size="small"
          sx={{ backgroundColor: "white" }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={newUserIsActive}
              onChange={(e) => setNewUserIsActive(e.target.checked)}
              color="primary"
            />
          }
          label="Active"
        />
        <Button variant="contained" onClick={handleAdd}>
          Add User
        </Button>
      </Box>

      {/* User Table */}
      <TableContainer
        component={Paper}
        sx={{ maxWidth: 1400, boxShadow: 3, borderRadius: 2 }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Mobile</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Off Campuses</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user, index) => (
              <TableRow key={user.id}>
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
                        onChange={(e) => setEditingUserRole(e.target.value as number)}
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
                        onChange={(e) => setEditingUserOffCampuses(e.target.value as number[])}
                        input={<OutlinedInput label="Off Campuses" />}
                        renderValue={(selected) =>
                          offCampuses
                            .filter((oc) => selected.includes(oc.id))
                            .map((oc) => oc.name)
                            .join(", ")
                        }
                      >
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
                <TableCell>
                  {editingId === user.id ? (
                    <Checkbox
                      checked={editingUserIsActive}
                      onChange={(e) => setEditingUserIsActive(e.target.checked)}
                      color="primary"
                    />
                  ) : (
                    user.is_active ? "✅" : "❌"
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
                        sx={{ minWidth: 36 }}
                      >
                        <SaveIcon />
                      </Button>
                      <Button
                        color="inherit"
                        size="small"
                        onClick={() => setEditingId(null)}
                        sx={{ minWidth: 36 }}
                      >
                        <CancelIcon />
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
                          const matchedRole = roles.find((r) => r.name === user.role);
                          setEditingUserRole(matchedRole ? matchedRole.id : "");
                          setEditingUserOffCampuses(user.off_campuses.map((oc) => oc.id));
                          setEditingUserIsActive(user.is_active);
                          setEditingUserPassword("");
                        }}
                        sx={{ minWidth: 36 }}
                      >
                        <EditIcon />
                      </Button>
                      <Button
                        color="error"
                        size="small"
                        onClick={() => handleDelete(user.id)}
                        sx={{ minWidth: 36 }}
                      >
                        <DeleteIcon />
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