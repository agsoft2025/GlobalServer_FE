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

type LocationFormData = {
  name: string;
  location: string;
  baseUrl: string;
  amount: string;
  status: 'active' | 'inactive';
  externalId: string;
};

type AddLocationDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  handleLocationSubmit: (data: any) => Promise<void>;
  selectedLocation: any;
  setSelectedLocation: (location: any) => void;
};

const initialFormData: LocationFormData = {
  name: '',
  location: '',
  baseUrl: '',
  amount: '',
  status: 'active',
  externalId: '',
};

export default function AddLocationDialog({
  open,
  setOpen,
  handleLocationSubmit,
  selectedLocation,
  setSelectedLocation,
}: AddLocationDialogProps) {
  const [formData, setFormData] = useState<LocationFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false); 

  useEffect(() => {
    if (selectedLocation) {
      setFormData({
        name: selectedLocation.name || '',
        location: selectedLocation.location || '',
        baseUrl: selectedLocation.baseUrl || '',
        amount: selectedLocation.amount || '',
        status: selectedLocation.status || 'active',
        externalId: selectedLocation?.externalId || ""
      });
    } else {
      setFormData(initialFormData);
    }
  }, [selectedLocation, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Location name is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as string]) {
      setErrors(prev => ({
        ...prev,
        [name as string]: '',
      }));
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData(initialFormData);
    setErrors({});
    setSelectedLocation(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await handleLocationSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Error submitting location:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {selectedLocation ? 'Edit Location' : 'Add New Location'}
        </DialogTitle>
        <DialogContent dividers>
          <div className='grid grid-cols-1 gap-2'>
            <TextField
              label="Campus Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Base URL"
              name="baseUrl"
              value={formData.baseUrl}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              fullWidth
              onWheel={(e) => e.currentTarget.blur()}
            />
            {/* <FormControl fullWidth margin="normal">
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                id="status"
                name="status"
                value={formData.status}
                label="Status"
                onChange={handleChange}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl> */}
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            startIcon={
              isSubmitting ? <CircularProgress size={20} /> : null
            }
          >
            {selectedLocation ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
