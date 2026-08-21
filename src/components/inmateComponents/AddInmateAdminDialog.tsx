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
import { getInmateLocations, type InmateLocationOption } from '../../api/service/inmateAdminService';

type InmateAdminFormData = {
  username: string;
  fullname: string;
  password: string;
  location_id: string;
};

type AddInmateAdminDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  handleSubmitAdmin: (data: InmateAdminFormData) => Promise<void>;
  selectedAdmin: any;
  setSelectedAdmin: (admin: any) => void;
};

const initialFormData: InmateAdminFormData = {
  username: '',
  fullname: '',
  password: '',
  location_id: '',
};

export default function AddInmateAdminDialog({
  open,
  setOpen,
  handleSubmitAdmin,
  selectedAdmin,
  setSelectedAdmin,
}: AddInmateAdminDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<InmateAdminFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locations, setLocations] = useState<InmateLocationOption[]>([]);

  useEffect(() => {
    if (!open) return;
    getInmateLocations()
      .then(setLocations)
      .catch((error) => console.error('Failed to fetch inmate locations:', error));
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
  }, [selectedAdmin, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.fullname.trim()) {
      newErrors.fullname = 'Full name is required';
    }

    if (!selectedAdmin && !formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    if (!selectedAdmin && !formData.location_id) {
      newErrors.location_id = 'Facility is required';
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await handleSubmitAdmin(formData);
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
              label="Facility"
              name="location_id"
              value={formData.location_id}
              onChange={handleChange}
              fullWidth
              error={!!errors.location_id}
              helperText={errors.location_id}
            >
              {locations.map((loc) => (
                <MenuItem key={loc._id} value={loc._id}>
                  {loc.name} — {loc.locationName}
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
