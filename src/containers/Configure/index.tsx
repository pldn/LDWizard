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
} from "@mui/material";
import { Navigate, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { matrixState } from "../../state";
import styles from "./style.scss";
import BaseIriField from "./BaseIriField";
import FontAwesomeIcon from "../../components/FontAwesomeIcon";
import TableHeaders from "./InteractiveTableHeaders";
import ResourceClassField from "./ClassField";
import { Skeleton } from "@mui/material";
import ColumnSelector from "./ColumnSelector";
import ShaclShapeField from "./ShaclShapeField";
import ShaclShapeInformation from "./ShaclShapeInformation";
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
  const navigate = useNavigate();
  const canScroll = useCanScroll();
  const tableRef = React.useRef<HTMLDivElement>(null);
  const navigationButtonsRef = React.useRef<HTMLDivElement>(null);
  const confirmConfiguration = () => {
    navigate(`/${Step + 1}`);
  };

  if (!parsedCsv) {
    return <Navigate to="/1" />;
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
        <Box className={styles.normalSettings}>
          <ShaclShapeField />
        </Box>
        <ShaclShapeInformation />
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
          <a href="#navigationButtons" onClick={() => navigationButtonsRef.current?.scrollIntoView()}>
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
      <Box id="#navigationButtons" ref={navigationButtonsRef}>
        <Button className={styles.actionButtons} onClick={() => navigate(`/${Step - 1}`)}>
          Back
        </Button>
        <Button className={styles.actionButtons} variant="contained" color="primary" onClick={confirmConfiguration}>
          Next
        </Button>
        <Button
          className={styles.actionButtons}
          onClick={() => {
            if (confirm("All progress will be lost, are you sure?")) {
              window.location.replace("");
            }
          }}
        >
          Restart
        </Button>
      </Box>
    </>
  );
};
export default Configure;
