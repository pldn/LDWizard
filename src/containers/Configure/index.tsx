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
  TableFooter,
  TablePagination,
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
  const [isValidUrlRC, setIsValidUrlRC] = React.useState<boolean>(true)
  const [isValidUrlBI, setIsValidUrlBI] = React.useState<boolean>(true)
  const [currentPage, setCurrentPage] = React.useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const changePage = (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => {
    // Go to the next results page
    setCurrentPage(page);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  const confirmConfiguration = () => {
    navigate(`/${Step + 1}`);
  };

  if (!parsedCsv) {
    return <Navigate to="/1" />;
  }
  // const csvHeader = parsedCsv.slice(0,1)
  const csvRows = parsedCsv.slice(1,)
  return (
    <>
      <Container className={styles.globalSettingsForm}>
        <Box className={styles.normalSettings}>
          <ColumnSelector />
          <React.Suspense fallback={<Skeleton width="500px" height="3rem" />}>
            <ResourceClassField isValidUrl={isValidUrlRC} setIsValidUrl={setIsValidUrlRC} />
          </React.Suspense>
        </Box>
        <Accordion variant="outlined" square className={styles.accordion}>
          <AccordionSummary expandIcon={<FontAwesomeIcon icon={["fas", "caret-down"]} />}>
            <Typography>Advanced</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <BaseIriField isValidUrl={isValidUrlBI} setIsValidUrl={setIsValidUrlBI} />
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
              {csvRows
              .slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage)
              .map((row, rowIndex) => {
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
          <TableFooter>
            <TablePagination
              count={csvRows.length}
              onPageChange={changePage}
              page={currentPage}
              rowsPerPage={rowsPerPage}
              component="div"
              onRowsPerPageChange={handleChangeRowsPerPage}
            ></TablePagination>
          </TableFooter>
        </TableContainer>
      </Paper>
      <Box id="#navigationButtons" ref={navigationButtonsRef}>
        <Button className={styles.actionButtons} onClick={() => navigate(`/${Step - 1}`)}>
          Back
        </Button>
        <Button disabled={(isValidUrlRC && isValidUrlBI) ? false : true} className={styles.actionButtons} variant="contained" color="primary" onClick={confirmConfiguration}>
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
