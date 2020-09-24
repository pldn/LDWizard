import React from "react";
import Wizard from "containers/Wizard";
import { AppBar, Toolbar, Typography, Container, Box, Paper } from "@material-ui/core";
import LdWizardImg from "./LDWizard.png";
import LDWizardImg from "!raw-loader!./LDWizard.svg";

import * as styles from "./style.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
require("../../theme/global.scss");
interface Props {}
const App: React.FC<Props> = () => {
  return (
    <div className={styles.app}>
      <AppBar position="static">
        <Toolbar>
          <Box>
            <img className={styles.image} src={LdWizardImg} />
          </Box>
          <Typography>LD-Wizard demo</Typography>
        </Toolbar>
      </AppBar>
      <Container component="main" className={styles.main}>
        <Wizard />
      </Container>
      <Paper component="footer" className={styles.footer}>
        {/* Is reversed in CSS */}
        <nav className={styles.footerNav}>
          <a href="https://github.com/netwerk-digitaal-erfgoed/LDWizard">
            <FontAwesomeIcon icon="book" /> Documentation
          </a>
          <a href="https://triplydb.com/">
            <FontAwesomeIcon icon="database" /> Dataplatform
          </a>
          <a href="https://github.com/netwerk-digitaal-erfgoed/LDWizard-HelloWorld">
            <FontAwesomeIcon icon={["fab", "github"]} /> Github
          </a>
        </nav>
        <div className={styles.LDWizardImg} dangerouslySetInnerHTML={{ __html: LDWizardImg }} />
      </Paper>
    </div>
  );
};
export default App;
