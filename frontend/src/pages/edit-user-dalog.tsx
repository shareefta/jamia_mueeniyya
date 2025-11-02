import { useState, useEffect } from "react";

import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, FormControl, InputLabel, Select,
  MenuItem, Checkbox, ListItemText, OutlinedInput,
  FormControlLabel
} from "@mui/material";

export default function EditUserDialog({
  open,
  onClose,
  user,
  roles,
  offCampuses,
  onSave
}: {
  open: boolean;
  onClose: () => void;
  user: any;
  roles: any[];
  offCampuses: any[];
  onSave: (updatedUser: any) => void;
}) {
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (user) setForm(user);
  }, [user]);

  const handleChange = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    onSave(form);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent dividers sx={{ pt: 2 }}>
        <TextField
          label="Name"
          fullWidth
          margin="dense"
          size="small"
          value={form.name || ""}
          onChange={(e) => handleChange("name", e.target.value)}
        />
        <TextField
          label="Email"
          fullWidth
          margin="dense"
          size="small"
          value={form.email || ""}
          onChange={(e) => handleChange("email", e.target.value)}
        />
        <TextField
          label="Mobile"
          fullWidth
          margin="dense"
          size="small"
          value={form.mobile || ""}
          onChange={(e) => handleChange("mobile", e.target.value)}
        />
        <FormControl fullWidth margin="dense" size="small">
          <InputLabel>Role</InputLabel>
          <Select
            value={form.role_id || ""}
            onChange={(e) => handleChange("role_id", e.target.value)}
          >
            {roles.map((r) => (
              <MenuItem key={r.id} value={r.id}>
                {r.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="dense" size="small">
          <InputLabel>Sections</InputLabel>
          <Select
            multiple
            value={form.off_campus_ids || []}
            onChange={(e) => handleChange("off_campus_ids", e.target.value)}
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
                <Checkbox checked={form.off_campus_ids?.includes(oc.id)} />
                <ListItemText primary={oc.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          type="password"
          label="Password"
          fullWidth
          margin="dense"
          size="small"
          value={form.password || ""}
          onChange={(e) => handleChange("password", e.target.value)}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={form.is_active ?? true}
              onChange={(e) => handleChange("is_active", e.target.checked)}
            />
          }
          label="Active"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}