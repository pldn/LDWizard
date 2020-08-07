import React from "react";
import Wizard from "containers/Wizard";
import { AppBar, Toolbar, Typography, Container, Box } from "@material-ui/core";
import LdWizardImg from "./LDWizard.png";
import * as styles from "./style.scss";
require("../../theme/global.scss");
interface Props {}
const App: React.FC<Props> = () => {
  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Box>
            <img className={styles.image} src={LdWizardImg} />
          </Box>
          <Typography>LD-Wizard demo</Typography>
        </Toolbar>
      </AppBar>
      <Container>
        <Wizard />
      </Container>
    </div>
  );
};
export default App;
