/**
 * Want to avoid a large component tree with all theme/state/routing providers we might add to the app
 * So, just add them here, and include it in our index file
 */
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
const theme = createMuiTheme({
  palette: {
    primary: { main: "#6d1e70" },
    secondary: { main: "#a90362" },
  },
});
const ContextProviders: React.FC = ({ children }) => {
  return (
    <BrowserRouter>
      <RecoilRoot>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </RecoilRoot>
    </BrowserRouter>
  );
};
export default ContextProviders;
