import React from "react";
import {
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
import { useRecoilValue } from "recoil";
import { matrixState, transformationConfigState } from "../../state";
import styles from "./style.scss";
import BaseIriField from "./BaseIriField";
import FontAwesomeIcon from "../../components/FontAwesomeIcon";
import TableHeaders from "./InteractiveTableHeaders";
import ResourceClassField from "./ClassField";
import { Skeleton } from "@mui/material";
import ColumnSelector from "./ColumnSelector";
import ShaclShapeField from "./ShaclShapeField";
import ScrollCopier from "../../components/ScrollCopier";
import { csvRowsToShaclRows } from '../../utils/csvRowsToShaclRows';

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
  const transformationConfig = useRecoilValue(transformationConfigState);
  const { shaclShape, requireShaclShape, columnConfiguration } = transformationConfig
  const parsedCsv = useRecoilValue(matrixState);
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

  if (!parsedCsv) throw new Error('Must have data')

  let [_csvHeader, ...csvRows] = parsedCsv

  if (shaclShape || requireShaclShape) {
    csvRows = csvRowsToShaclRows(csvRows, columnConfiguration)
  }

  return (
    <>
      <Container className={styles.globalSettingsForm}>
        <Box className={styles.normalSettings}>
          <ColumnSelector />
          <React.Suspense fallback={<Skeleton width="500px" height="3rem" />}>
            <ResourceClassField isValidUrl={isValidUrlRC} setIsValidUrl={setIsValidUrlRC} />
          </React.Suspense>
        </Box>
        <Box className={styles.normalSettings}>
          <ShaclShapeField />
        </Box>
        {/* <ShaclShapeInformation /> */}
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
            <TableFooter>
            <tr>
              {/* https://stackoverflow.com/questions/398734/colspan-all-columns */}
              <td colSpan={1000}>
              <TablePagination
                count={csvRows.length}
                onPageChange={handlePageChange}
                page={currentTablePage}
                rowsPerPage={rowsPerPage}
                component="div"
                onRowsPerPageChange={handleRowPerChangePage}
              ></TablePagination>
              </td>
            </tr>
          </TableFooter>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
};
export default Configure;
