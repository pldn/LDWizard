import React from "react";
import {
  Button,
  Box,
  Table,
  TableContainer,
  TableRow,
  TableCell,
  TableBody,
  Container,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TableHead,
} from "@material-ui/core";
import { Redirect, useHistory } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { matrixState } from "../../state";
import * as styles from "./style.scss";
import BaseIriField from "./BaseIriField";
import FontAwesomeIcon from "../../components/FontAwesomeIcon";
import TableHeaders from "./InteractiveTableHeaders";
import ResourceClassField from "./ClassField";
import { Skeleton } from "@material-ui/lab";
import ColumnSelector from "./ColumnSelector";
import ScrollCopier from "../../components/ScrollCopier";
interface Props {}

export const Step = 2;

const useCanScroll = () => {
  const [canScroll, setCanScroll] = React.useState(false);
  React.useEffect(() => {
    setCanScroll(document.body.scrollHeight !== document.body.offsetHeight);
  }, []);
  return canScroll;
};

const Configure: React.FC<Props> = ({}) => {
  const parsedCsv = useRecoilValue(matrixState);
  const history = useHistory();
  const canScroll = useCanScroll();
  const tableRef = React.useRef<HTMLDivElement>(null);
  const confirmConfiguration = () => {
    history.push(`/${Step + 1}`);
  };

  if (!parsedCsv) {
    return <Redirect to="/1" />;
  }
  return (
    <>
      <Container className={styles.globalSettingsForm}>
        <Box className={styles.normalSettings}>
          <ColumnSelector />
          <React.Suspense fallback={<Skeleton width="500px" height="3rem" />}>
            <ResourceClassField />
          </React.Suspense>
        </Box>
        <Accordion variant="outlined" square className={styles.accordion}>
          <AccordionSummary expandIcon={<FontAwesomeIcon icon={["fas", "caret-down"]} />}>
            <Typography>Advanced</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <BaseIriField />
          </AccordionDetails>
        </Accordion>
      </Container>
      {canScroll && (
        <Container>
          <a href={`#${Step}#navigationButtons`}>
            <FontAwesomeIcon icon={["fas", "long-arrow-alt-down"]} /> Scroll to bottom
          </a>
        </Container>
      )}
      <Paper variant="outlined" square className={styles.tableWrapper}>
        <ScrollCopier scrollRef={tableRef} />
        <TableContainer ref={tableRef}>
          <Table>
            <React.Suspense
              fallback={
                <Skeleton
                  width="100%"
                  height="5rem"
                  style={{ display: "table-caption" }}
                  component={(props) => <TableHead {...props} />}
                />
              }
            >
              <TableHeaders />
            </React.Suspense>
            <TableBody>
              {parsedCsv.slice(1, 10).map((row, rowIndex) => {
                return (
                  <TableRow key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={"r" + rowIndex + "c" + cellIndex}>{cell}</TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Box id={`${Step}#navigationButtons`}>
        <Button className={styles.actionButtons} onClick={() => history.push(`/${Step - 1}`)}>
          Back
        </Button>
        <Button className={styles.actionButtons} variant="contained" color="primary" onClick={confirmConfiguration}>
          Next
        </Button>
      </Box>
    </>
  );
};
export default Configure;
