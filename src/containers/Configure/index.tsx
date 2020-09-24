import React from "react";
import {
  Paper,
  Button,
  Box,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Container,
} from "@material-ui/core";
import { Redirect, useHistory } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { matrixState, transformationConfigState } from "state";
import * as styles from "./style.scss";
import { useSetRecoilState } from "recoil";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
interface Props {}
export const Step = 2;

const Configure: React.FC<Props> = ({}) => {
  const parsedCsv = useRecoilValue(matrixState);
  const setTransformationConfig = useSetRecoilState(transformationConfigState);
  const history = useHistory();

  const confirmConfiguration = () => {
    setTransformationConfig((state) => {
      if (!parsedCsv) return state;
      return {
        ...state,
        columnConfiguration: parsedCsv[0].map((header) => {
          return {
            columnName: header,
          };
        }),
      };
    });
    history.push(`/${Step + 1}`);
  };
  if (!parsedCsv) {
    return <Redirect to="/1" />;
  }
  return (
    <>
      <Paper variant="outlined" square className={styles.tableWrapper}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {parsedCsv[0].map((header, idx) => (
                  <TableCell key={`${header}${idx}`}>{header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
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
          </Table>{" "}
        </TableContainer>
      </Paper>
      <Box>
        <Button onClick={() => history.push(`/${Step - 1}`)} className={styles.actionButtons}>
          Back
        </Button>
        <Button variant="contained" color="primary" onClick={confirmConfiguration} className={styles.actionButtons}>
          Next
        </Button>
      </Box>
    </>
  );
};
export default Configure;
