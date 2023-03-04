import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';
// Create a theme instance.
const theme = createTheme({
  palette:{
    type: 'dark',
    primary: {
        main: '#17171A',
        text: "#FFFFFF"
    },
    secondary: {
        main: '#323546',
        text: "#FFFFFF"
    },
    background: {
      default: "#17171A",
      gradient: "#212430",
      main: '#17171A',
      contrastText: '#fff',
    },
    text:{
      primary: "#FFFFFF",
      secondary: "#8a9394"
    }
  },
});
export default theme;