import React from "react";
import * as styles from "./style.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Container, Paper } from "@material-ui/core";
import { Link } from "react-router-dom";
import * as mdStyles from "./markdownStyle.scss";

interface Props {
  content: string;
}

const WelcomePage: React.FC<Props> = ({ content }) => {
  return (
    <Container component="main" maxWidth="md" className={styles.homepage}>
      <Paper square>
        <Container>
          <div className={mdStyles.markdownContent} dangerouslySetInnerHTML={{ __html: content }} />
        </Container>
        <Container>
          <Link to="/1">
            <Button
              color="primary"
              variant="contained"
              size="large"
              startIcon={<FontAwesomeIcon icon="play" />}
              className={styles.actionButton}
            >
              Transform your CSV into Linked Data
            </Button>
          </Link>
        </Container>
      </Paper>
    </Container>
  );
};

export default WelcomePage;
