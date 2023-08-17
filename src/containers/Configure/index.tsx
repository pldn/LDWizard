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
  SxProps,
  TableHeadClasses,
  Theme,
} from "@mui/material";
import { Navigate, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { matrixState } from "../../state/index.ts";
import styles from "./style.scss";
import BaseIriField from "./BaseIriField.tsx";
import FontAwesomeIcon from "../../components/FontAwesomeIcon/index.tsx";
import TableHeaders from "./InteractiveTableHeaders.tsx";
import ResourceClassField from "./ClassField.tsx";
import { Skeleton } from "@mui/material";
import ColumnSelector from "./ColumnSelector.tsx";
import ScrollCopier from "../../components/ScrollCopier/index.tsx";
import { CommonProps } from "@mui/material/OverridableComponent";
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
  const [currentTablePage, setCurrentTablePage] = React.useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(10);

  const handlePageChange = (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => {
    setCurrentTablePage(page);
  };

  const handleRowPerChangePage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentTablePage(0);
  };

  const confirmConfiguration = () => {
    navigate(`/${Step + 1}`);
  };

  if (!parsedCsv) {
    return <Navigate to="/1" />;
  }
  const [_csvHeader, ...csvRows] = parsedCsv
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
                  component={(props: JSX.IntrinsicAttributes & { component: React.ElementType<any>; } & { children?: React.ReactNode; classes?: Partial<TableHeadClasses> | undefined; sx?: SxProps<Theme> | undefined; } & CommonProps & Omit<any, keyof CommonProps | "children" | "sx">) => <TableHead {...props} />}
                />
              }
            >
              <TableHeaders />
            </React.Suspense>
            <TableBody>
              {csvRows
              .slice(currentTablePage * rowsPerPage, currentTablePage * rowsPerPage + rowsPerPage)
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
              onPageChange={handlePageChange}
              page={currentTablePage}
              rowsPerPage={rowsPerPage}
              component="div"
              onRowsPerPageChange={handleRowPerChangePage}
            ></TablePagination>
          </TableFooter>
        </TableContainer>
      </Paper>
      <Box id="#navigationButtons" ref={navigationButtonsRef}>
        <Button className={styles.actionButtons} onClick={() => navigate(`/${Step - 1}`)}>
          Back
        </Button>
        {/* @here fires confirmConfiguration --> the transformation column must be kept */}
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
