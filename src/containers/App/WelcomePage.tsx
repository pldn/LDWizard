import React from "react";
import styles from "./style.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Container, Paper } from "@mui/material";
import { Link } from "react-router-dom";
import mdStyles from "./markdownStyle.scss";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
interface Props {
  content: string;
}

const WelcomePage: React.FC<Props> = ({ content }) => {
  return (
    <Container component="main" maxWidth="md" className={styles.homepage}>
      <Paper square>
        <Container>
          <Container>
            <Link to="/1">
              <Button
                color="primary"
                variant="contained"
                size="medium"
                startIcon={<FontAwesomeIcon icon="play" />}
                className={styles.actionButton}
                style={{ marginTop: 60, marginLeft: 30, zIndex: 1, textTransform: "none" }}
              >
                Get Started Right Away!
              </Button>
            </Link>
          </Container>
          <Markdown rehypePlugins={[rehypeRaw]} className={mdStyles.markdownContent}>
            {content}
          </Markdown>
          <Container>
            <Link to="/1">
              <Button
                color="primary"
                variant="contained"
                size="large"
                startIcon={<FontAwesomeIcon icon="play" />}
                className={styles.actionButton}
                style={{ marginTop: 40, marginLeft: 30, zIndex: 1, textTransform: "none" }}
              >
                Get Started!
              </Button>
            </Link>
          </Container>
        </Container>
      </Paper>
    </Container>
  );
};

export default WelcomePage;
