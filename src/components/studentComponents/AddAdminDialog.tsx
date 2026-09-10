import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  IconButton,
  InputAdornment,
  MenuItem,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Chip, Box } from '@mui/material';
import { getSchoolLocations, type SchoolLocationOption } from '../../api/service/adminService';
import { listSenderIds } from '../../api/service/senderIdService';
import { getSchoolSmsConfig } from '../../api/service/schoolSmsConfigService';

type SchoolAdminFormData = {
  username: string;
  fullname: string;
  password: string;
  location_id: string;
  assignedSenderIds?: string[];
};

type AddSchoolAdminDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  handleSubmitAdmin: (data: SchoolAdminFormData) => Promise<void>;
  selectedAdmin: any;
  setSelectedAdmin: (admin: any) => void;
};

const initialFormData: SchoolAdminFormData = {
  username: '',
  fullname: '',
  password: '',
  location_id: '',
};

export default function AddSchoolAdminDialog({
  open,
  setOpen,
  handleSubmitAdmin,
  selectedAdmin,
  setSelectedAdmin,
}: AddSchoolAdminDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<SchoolAdminFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locations, setLocations] = useState<SchoolLocationOption[]>([]);
  const [senderOptions, setSenderOptions] = useState<string[]>([]);
  const [assignedSenderIds, setAssignedSenderIds] = useState<string[]>([]);
  // Only write the school's Sender ID config if the Super Admin actually edited
  // this field — an untouched field must never clobber the school's setting.
  const [sendersTouched, setSendersTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    getSchoolLocations()
      .then(setLocations)
      .catch((error) => console.error('Failed to fetch school locations:', error));
    listSenderIds({ status: 'ACTIVE', limit: 100 })
      .then((res) => setSenderOptions(res.data.map((s) => s.header)))
      .catch((error) => console.error('Failed to fetch sender IDs:', error));
  }, [open]);

  useEffect(() => {
    if (selectedAdmin) {
      setFormData({
        username: selectedAdmin.username || '',
        fullname: selectedAdmin.fullname || '',
        password: '', // don't prefill password
        location_id: selectedAdmin.location_id?._id || selectedAdmin.location_id || '',
      });
    } else {
      setFormData(initialFormData);
    }
    setShowPassword(false);
    setSendersTouched(false);
    setAssignedSenderIds([]);
  }, [selectedAdmin, open]);

  // Prefill the current Sender ID assignment for the chosen school.
  useEffect(() => {
    if (!open || !formData.location_id) {
      setAssignedSenderIds([]);
      return;
    }
    let cancelled = false;
    getSchoolSmsConfig(formData.location_id)
      .then((res) => {
        if (!cancelled) setAssignedSenderIds(res.data.configured ? res.data.assignedSenderIds : []);
      })
      .catch(() => {
        if (!cancelled) setAssignedSenderIds([]);
      });
    return () => {
      cancelled = true;
    };
  }, [open, formData.location_id]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.fullname.trim()) {
      newErrors.fullname = 'Full name is required';
    }

    // Only require password when creating
    if (!selectedAdmin && !formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    // Only require location when creating; editing an existing admin's location is optional
    if (!selectedAdmin && !formData.location_id) {
      newErrors.location_id = 'School is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData(initialFormData);
    setErrors({});
    setSelectedAdmin(null);
    setSendersTouched(false);
    setAssignedSenderIds([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await handleSubmitAdmin({
        ...formData,
        ...(sendersTouched ? { assignedSenderIds } : {}),
      });
      handleClose();
    } catch (error) {
      console.error('Error submitting admin:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {selectedAdmin ? 'Edit Admin' : 'Add New Admin'}
        </DialogTitle>

        <DialogContent dividers>
          <div className="grid grid-cols-1 gap-2">
            <TextField
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              fullWidth
              error={!!errors.username}
              helperText={errors.username}
            />

            <TextField
              label="Full Name"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              fullWidth
              error={!!errors.fullname}
              helperText={errors.fullname}
            />

            <TextField
              select
              label="School"
              name="location_id"
              value={formData.location_id}
              onChange={handleChange}
              fullWidth
              error={!!errors.location_id}
              helperText={errors.location_id}
            >
              {locations.map((loc) => (
                <MenuItem key={loc._id} value={loc._id}>
                  {loc.schoolName} — {loc.locationName}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="SMS Sender IDs"
              value={assignedSenderIds}
              onChange={(e) => {
                const v = e.target.value;
                setAssignedSenderIds(typeof v === 'string' ? v.split(',') : (v as unknown as string[]));
                setSendersTouched(true);
              }}
              fullWidth
              disabled={!formData.location_id}
              helperText={
                !formData.location_id
                  ? 'Pick a school first'
                  : sendersTouched
                    ? 'Applies to the whole school/location. Templates follow automatically from the DLT Sender ID.'
                    : 'Leave unchanged to keep the current setting. Applies to the whole school/location.'
              }
              SelectProps={{
                multiple: true,
                renderValue: (selected) =>
                  (selected as string[]).length === 0 ? (
                    <span style={{ color: '#9ca3af' }}>none</span>
                  ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((h) => (
                        <Chip key={h} label={h} size="small" />
                      ))}
                    </Box>
                  ),
              }}
            >
              {senderOptions.map((h) => (
                <MenuItem key={h} value={h}>
                  {h}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              fullWidth
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword(prev => !prev)}
                      size="large"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} variant='outlined' color="error">
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {selectedAdmin ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
