import React from "react";
import Wizard from "../Wizard";
import { AppBar, Toolbar, Typography, Container, Paper } from "@mui/material";
import LDWizardImg from "./LDWizard.svg?react";
import styles from "./style.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { wizardAppConfig } from "../../config";
import { Link, Route, Routes } from "react-router-dom";
import WelcomePage from "./WelcomePage";
await import("../../theme/global.scss");

interface Props {}
const App: React.FC<Props> = () => {
  return (
    <div className={styles.app}>
      <AppBar position="static" color="default">
        <Toolbar>
          <Link to={"/"}>
            <img src={wizardAppConfig.brandLogo.toString()} className={styles.image} />
          </Link>
          <Typography>{wizardAppConfig.appName}</Typography>
        </Toolbar>
      </AppBar>
      <Routes>
        {wizardAppConfig.homepageMarkdown && (
          <Route path="/" element={<WelcomePage content={wizardAppConfig.homepageMarkdown} />} />
        )}
        <Route
          path="*"
          element={
            <Container component="main" className={styles.main}>
              <Wizard />
            </Container>
          }
        />
      </Routes>

      <Paper component="footer" className={styles.footer}>
        {/* Is reversed in CSS */}
        <nav className={styles.footerNav}>
          <a target="_blank" href={wizardAppConfig.documentationLink}>
            <FontAwesomeIcon icon="book" /> Documentation
          </a>
          <a target="_blank" href={wizardAppConfig.dataplatformLink}>
            <FontAwesomeIcon icon="database" /> Dataplatform
          </a>
          <a target="_blank" href={wizardAppConfig.repositoryLink}>
            <FontAwesomeIcon icon={["fab", "github"]} /> Github
          </a>
        </nav>
        <LDWizardImg aria-label="" className={styles.LDWizardImg} />
      </Paper>
    </div>
  );
};
export default App;
