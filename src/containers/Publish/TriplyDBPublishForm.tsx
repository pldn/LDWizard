import * as React from "react";
import { Card, CardHeader, CardContent, Box, CardActions, Avatar, Typography } from "@mui/material";
import TokenForm from "./TokenForm";
import DatasetSelector from "./DatasetSelector";
import { useRecoilState, useRecoilValue } from "recoil";
import ErrorBoundary from "../../components/ErrorBoundary";
import AccountSelector from "./AccountSelector";
import { Skeleton } from "@mui/material";
import { currentTokenState, apiInfoState } from "../../state/clientJs";
import AddDataset from "./AddDatasetForm";
import styles from "./style.scss";
import TriplyDBPublishProcess from "./TriplyDBPublishProcess";
import { Matrix } from "../../Definitions";
// ClientJS Recoil state

// Component

export interface Props {
  transformationResult: string;
  refinedCsv: Matrix | undefined;
}

// clientJs global reference

const TriplyDBUpload: React.FC<Props> = ({ transformationResult, refinedCsv }) => {
  const [token, setToken] = useRecoilState(currentTokenState);
  const apiInfo = useRecoilValue(apiInfoState);
  const resetToken = (errorText: string) => {
    // Either the token is invalid or it uses an old token
    if (errorText === "Invalid token" || errorText === "info is null") {
      setToken("");
    }
  };

  return (
    <ErrorBoundary resetAction={resetToken}>
      <Card variant="outlined">
        <CardHeader
          title={<Typography variant="h5">{`Publish results to ${apiInfo?.branding.name || "TriplyDB"}`}</Typography>}
          avatar={apiInfo && <Avatar src={apiInfo.branding.logo} variant="square" />}
        />
        <CardContent>
          <ErrorBoundary>
            <TokenForm />
          </ErrorBoundary>
          {token.length > 0 && (
            <ErrorBoundary key={token}>
              <React.Suspense fallback={<Skeleton variant="rectangular" height={50} width={200} />}>
                <AccountSelector />
              </React.Suspense>
              <React.Suspense fallback={<Skeleton variant="rectangular" height={50} width={200} />}>
                <Box className={styles.datasetSelector}>
                  <DatasetSelector />
                  <AddDataset />
                </Box>
              </React.Suspense>
            </ErrorBoundary>
          )}
        </CardContent>
        <CardActions>
          <React.Suspense fallback={<Skeleton variant="rectangular" />}>
            <TriplyDBPublishProcess transformationResult={transformationResult} refinedCsv={refinedCsv} />
          </React.Suspense>
        </CardActions>
      </Card>
    </ErrorBoundary>
  );
};
export default TriplyDBUpload;
