/**
 * Want to avoid a large component tree with all theme/state/routing providers we might add to the app
 * So, just add them here, and include it in our index file
 */
import React, { useEffect } from "react";
import { MemoryRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";
import { createTheme, ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import wizardConfig from "./config";

const theme = createTheme({
  palette: {
    primary: { main: wizardConfig.primaryColor },
    secondary: { main: wizardConfig.secondaryColor },
  },
  components: {
    MuiTextField: {
      defaultProps: { variant: "standard" },
    },
    MuiFormControl: {
      defaultProps: { variant: "standard" },
    },
  },
});
const ContextProviders: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  useEffect(() => {
    document.documentElement.style.setProperty("--primary", wizardConfig.primaryColor);
    document.documentElement.style.setProperty("--secondary", wizardConfig.secondaryColor);
    const favIcon = document.createElement("link");
    favIcon.rel = "icon";
    favIcon.href = wizardConfig.favIcon;
    document.head.appendChild(favIcon);
  }, []);
  return (
    <MemoryRouter>
      <RecoilRoot>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </StyledEngineProvider>
      </RecoilRoot>
    </MemoryRouter>
  );
};
export default ContextProviders;
