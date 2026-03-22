// theme.ts
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#3E6AB3", // blue from your gradient
      contrastText: "#fff", // text color on primary
    },
    secondary: {
      main: "#EF5675", // optional secondary for pink/red
    },
  },
});

export default theme;
