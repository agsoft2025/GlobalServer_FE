import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    TextField,
    IconButton,
    InputAdornment,
    Button,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import logo from "../assets/AGS_logo.png";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../api/service/authService";
import { useAuth } from "../context/AuthContext";

// Zod Schema
const loginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormType = z.infer<typeof loginSchema>;

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { setToken } = useAuth();

    const { register, handleSubmit, formState: { errors, isSubmitting } } =
        useForm<LoginFormType>({
            resolver: zodResolver(loginSchema),
        });

    const onSubmit = async (data: LoginFormType) => {
        const response = await loginApi(data);
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        setToken(response.token); // update React state
        navigate("/inmate-dashboard");
    };

    return (
        <div className="h-screen w-full flex justify-center items-center"
            style={{
                background: "linear-gradient(135deg, #3E6AB3, #EF5675)",
            }}
        >
            <form
                onSubmit={handleSubmit(onSubmit)}
                style={{ display: "flex", flexDirection: "column", gap: 16, background: "#fff", borderRadius: "5px", width: 500, boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px", padding: "20px" }}
            >
                <img src={logo} alt="logo" className="p-4" />
                <TextField
                    label="Username"
                    type="text"
                    {...register("username")}
                    error={!!errors.username}
                    size="small"
                    helperText={errors.username?.message}
                    fullWidth
                />

                <TextField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    size="small"
                    fullWidth
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                <Button type="submit" variant="contained" sx={{ marginBottom: "20px" }} disabled={isSubmitting}>
                    {isSubmitting ? "Loading..." : "Login"}
                </Button>
            </form>
        </div>
    );
}
