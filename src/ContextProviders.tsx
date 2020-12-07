/**
 * Want to avoid a large component tree with all theme/state/routing providers we might add to the app
 * So, just add them here, and include it in our index file
 */
import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import wizardConfig from "./config";
const theme = createMuiTheme({
  palette: {
    primary: { main: wizardConfig.primaryColor },
    secondary: { main: wizardConfig.secondaryColor },
  },
});
const ContextProviders: React.FC = ({ children }) => {
  useEffect(() => {
    document.documentElement.style.setProperty("--primary", wizardConfig.primaryColor);
    document.documentElement.style.setProperty("--secondary", wizardConfig.secondaryColor);
    const favIcon = document.createElement("link");
    favIcon.rel = "icon";
    favIcon.href = wizardConfig.favIcon;
    document.head.appendChild(favIcon);
  }, []);
  return (
    <BrowserRouter>
      <RecoilRoot>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </RecoilRoot>
    </BrowserRouter>
  );
};
export default ContextProviders;
