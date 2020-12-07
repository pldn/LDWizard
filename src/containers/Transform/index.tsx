import React from "react";
import { Button, Typography, Container, CircularProgress } from "@material-ui/core";

import styles from "./style.scss";
import { useHistory } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { matrixState } from "../../state";

interface Props {}
export const Step = 3;
const Transform: React.FC<Props> = ({}) => {
  const history = useHistory();
  const parsedCsv = useRecoilValue(matrixState);
  return (
    <>
      {!parsedCsv && (
        <Container>
          <Typography>No CSV is currently please proceed to the previous step</Typography>
          <Button onClick={() => history.push(`/${Step - 1}`)}>Back</Button>
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
