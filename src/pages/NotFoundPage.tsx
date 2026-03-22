import { Button } from "@mui/material";
import notfound from "../assets/404.jpg"
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";

const NotFound = () => {

    const navigate = useNavigate();

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1 className="pb-5">404 - Page Not Found</h1>
            <div className="m-auto">
                <img src={notfound} alt="404" className="w-full h-150 object-contain" />
            </div>
            <p className="pb-5">The page you are looking for doesn't exist.</p>
            <Button onClick={() => navigate(-1)}
                style={{
                    background: "linear-gradient(135deg, #3E6AB3, #EF5675)",
                    color: "white",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 10,
                    margin: "auto",
                }}
            >
                <IoArrowBack />
                Back</Button>
        </div>
    );
};

export default NotFound;
