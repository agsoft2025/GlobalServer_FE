import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  InputAdornment,
  IconButton,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

type SchoolAdminFormData = {
  username: string;
  fullname: string;
  password?: string;
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  location_id?: string;
};

type AddSchoolAdminDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  handleSubmitAdmin: (data: any) => Promise<void>;
  selectedAdmin: any;
  setSelectedAdmin: (admin: any) => void;
};

const initialFormData: SchoolAdminFormData = {
  username: '',
  fullname: '',
  password: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
  location_id: '',
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
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (selectedAdmin) {
        setFormData({
          username: selectedAdmin.username || '',
          fullname: selectedAdmin.fullname || '',
          password: '',
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
          location_id: selectedAdmin.location_id || (typeof selectedAdmin.location === 'object' ? selectedAdmin.location?._id : ''),
        });
      } else {
        setFormData(initialFormData);
      }
      // Reset password visibility
      setShowOldPassword(false);
      setShowNewPassword(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
      setSubmitError(null);
    }
  }, [selectedAdmin, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username?.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.fullname?.trim()) {
      newErrors.fullname = 'Full name is required';
    }

    // Only require password when creating
    if (!selectedAdmin && !formData.password?.trim()) {
      newErrors.password = 'Password is required';
    }

    if (!selectedAdmin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // When editing password, both old and new are needed
    if (selectedAdmin && (formData.oldPassword || formData.newPassword)) {
      if (!formData.oldPassword) {
        newErrors.oldPassword = 'Old password is required to set a new password';
      }
      if (!formData.newPassword) {
        newErrors.newPassword = 'New password is required';
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: any) => {
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
    setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      
      const payload: any = {
        username: formData.username,
        fullname: formData.fullname,
      };

      if (selectedAdmin) {
        // Update case
        if (formData.newPassword && formData.oldPassword) {
            payload.newPassword = formData.newPassword;
            payload.oldPassword = formData.oldPassword;
        }
      } else {
        // Create case
        payload.password = formData.password;
      }

      await handleSubmitAdmin(payload);
      handleClose();
    } catch (error: any) {
      console.error('Error submitting admin:', error);
      const message = error.response?.data?.message || error.message || 'An error occurred while saving';
      setSubmitError(message);
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
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}
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

            {selectedAdmin ? (
              <>
                <TextField
                  label="Old Password"
                  name="oldPassword"
                  type={showOldPassword ? "text" : "password"}
                  value={formData.oldPassword}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.oldPassword}
                  helperText={errors.oldPassword || "Required to change password"}
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle old password visibility"
                          onClick={() => setShowOldPassword(!showOldPassword)}
                          edge="end"
                        >
                          {showOldPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="New Password"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.newPassword}
                  helperText={errors.newPassword}
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle new password visibility"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Confirm New Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </>
            ) : (
              <>
              <TextField
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                fullWidth
                error={!!errors.password}
                helperText={errors.password}
                size="small"
                InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
              />
              <TextField
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                fullWidth
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                size="small"
                InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
              />
              </>
            )}
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