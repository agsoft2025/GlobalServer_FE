import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
} from '@mui/material';

type SchoolAdminFormData = {
  username: string;
  fullname: string;
  password: string;
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
};

export default function AddSchoolAdminDialog({
  open,
  setOpen,
  handleSubmitAdmin,
  selectedAdmin,
  setSelectedAdmin,
}: AddSchoolAdminDialogProps) {
  const [formData, setFormData] = useState<SchoolAdminFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedAdmin) {
      setFormData({
        username: selectedAdmin.username || '',
        fullname: selectedAdmin.fullname || '',
        password: '', // don't prefill password
      });
    } else {
      setFormData(initialFormData);
    }
  }, [selectedAdmin, open]);

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
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              error={!!errors.password}
              helperText={errors.password}
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