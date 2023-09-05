import React from "react";
import { Button, Typography, Container, CircularProgress } from "@mui/material";

import styles from "./style.scss";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { matrixState } from "../../state/index.ts";

interface Props {}
export const Step = 3;
const Transform: React.FC<Props> = ({}) => {
  const navigate = useNavigate();
  const parsedCsv = useRecoilValue(matrixState);
  return (
    <>
      {!parsedCsv && (
        <Container>
          <Typography>No CSV is currently please proceed to the previous step</Typography>
          <Button style={{textTransform: 'none'}} onClick={() => navigate(`/${Step - 1}`)}>Back</Button>
        </Container>
      )}
      {parsedCsv && (
        <div className={styles.transformBox}>
          <Typography>Transforming data</Typography>
          <CircularProgress />
        </div>
      )}
    </>
  );
};

export default Transform;
