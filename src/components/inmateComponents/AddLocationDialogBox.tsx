import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { IPayload } from "../../types/inmateTypes";
import { useEffect } from "react";

const formSchema = z.object({
    location: z.string().nonempty("Location name is required"),
    name: z.string().nonempty("Name is required"),
    baseUrl: z.string().url("Must be a valid URL"),
    subscription_amount: z
        .number()
        .positive("Amount must be greater than 0")
        .refine((val) => !isNaN(val), { message: "Subscription must be a number" }),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    handleLocationSubmit: (data: IPayload) => Promise<void> | void;
    seletedLocation: IPayload;
    setSelectedLocation: any
};

export default function GlobalLocationDialog({ open, setOpen, handleLocationSubmit, seletedLocation,setSelectedLocation }: Props) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            location: "",
            name: "",
            baseUrl: "",
            subscription_amount: 0,
        },
    });

    useEffect(() => {
        if (seletedLocation?._id) {
            reset({
                location: seletedLocation?.location,
                name: seletedLocation?.name,
                baseUrl: seletedLocation?.baseUrl,
                subscription_amount: Number(seletedLocation?.subscription_amount) || 0,
            })
        }
    }, [seletedLocation?._id])

    const handleClose = () => {
        reset({
            location: "",
            name: "",
            baseUrl: "",
            subscription_amount: 0,
        });
        setSelectedLocation(null);
        setOpen(!open);
    }

    const onSubmit = (data: FormValues) => {
        console.log("Submitted Payload:", data);
        handleLocationSubmit(data);
        handleClose(); // close after submit (optional)
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>{seletedLocation?._id ? "Update" :"Add"} Global Location</DialogTitle>

            <DialogContent dividers>
                <Box
                    component="form"
                    id="global-location-form"
                    onSubmit={handleSubmit(onSubmit)}
                    sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
                >
                    <TextField
                        label="Location Name"
                        {...register("location")}
                        error={!!errors.location}
                        helperText={errors.location?.message}
                    />

                    <TextField
                        label="Name"
                        {...register("name")}
                        error={!!errors.name}
                        helperText={errors.name?.message}
                    />

                    <TextField
                        label="Base URL"
                        {...register("baseUrl")}
                        error={!!errors.baseUrl}
                        helperText={errors.baseUrl?.message}
                    />

                    <TextField
                        type="number"
                        label="Subscription Amount"
                        {...register("subscription_amount", { valueAsNumber: true })}
                        error={!!errors.subscription_amount}
                        helperText={errors.subscription_amount?.message}
                        onWheel={(e: any) => e.target.blur()}
                    />
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} color="inherit" variant="outlined">
                    Cancel
                </Button>
                <Button type="submit" form="global-location-form" variant="contained">
                    {seletedLocation?._id ? "Update" : "Submit"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
