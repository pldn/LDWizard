import React from "react";
import styles from "./style.scss";
import { Box, Container, Button, Typography } from "@material-ui/core";
import { useHistory, Redirect } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { matrixState, sourceState, transformationConfigState } from "../../state";
import TriplyDBUpload from "./TriplyDBPublishForm";
import { Skeleton, Alert } from "@material-ui/lab";
import ErrorBoundary from "../../components/ErrorBoundary";
import { currentTokenState } from "../../state/clientJs";
import DownloadResults from "./DownloadResults";
import { wizardAppConfig, PublishElement } from "../../config";
import { Matrix } from "../../Definitions";
interface Props {}
export const Step = 3;
const Publish: React.FC<Props> = ({}) => {
  const parsedCsv = useRecoilValue(matrixState);
  const [refinedCsv, setRefinedCsv] = React.useState<Matrix>();
  const source = useRecoilValue(sourceState);
  const transformationConfig = useRecoilValue(transformationConfigState);
  const setCurrentToken = useSetRecoilState(currentTokenState);
  const history = useHistory();
  const [transformationResult, setTransformationResult] = React.useState<string>();
  const [transformationError, setTransformationError] = React.useState<string>();
  React.useEffect(() => {
    const transformFunction = async () => {
      setTransformationResult(undefined);
      setTransformationError(undefined);
      // Refinement
      let tempRefinedCsv: Matrix | undefined = undefined;
      if (parsedCsv && transformationConfig.columnConfiguration.some((config) => !!config.columnRefinement)) {
        tempRefinedCsv = parsedCsv;
        for (const column of transformationConfig.columnConfiguration) {
          if (column.columnRefinement === undefined || column.iriPrefix !== undefined) continue;
          const columnIdx: number = tempRefinedCsv[0].indexOf(column.columnName);
          tempRefinedCsv = await Promise.all(
            tempRefinedCsv.map(async (row, rowIdx) => {
              let toInject = undefined;
              if (rowIdx === 0) {
                toInject = column.columnName + "-refined";
              } else {
                toInject =
                  column.columnRefinement &&
                  wizardAppConfig.refinementOptions
                    .find((config) => config.label === column.columnRefinement)
                    ?.transformation(row[columnIdx]);
              }
              return new Array(...row.slice(0, columnIdx + 1), (await toInject) || "", ...row.slice(columnIdx + 1));
            })
          );
        }
        setRefinedCsv(tempRefinedCsv);
      }
      // Transformation
      if (parsedCsv) {
        const transformationResult = await wizardAppConfig.applyTransformation({
          config: transformationConfig,
          source: tempRefinedCsv || parsedCsv,
          type: "ratt",
        });
        setTransformationResult(transformationResult);
      }
    };
    transformFunction().catch((e) => {
      setTransformationError(e.message);
    });
  }, [transformationConfig, parsedCsv]);

  if (!source || !parsedCsv) {
    return <Redirect to="/1" />;
  }
  if (transformationError) {
    return (
      <>
        <Container>
          <Alert severity="error">
            <Typography variant="h5" gutterBottom>
              An error occurred while performing the transformation
            </Typography>
            <Typography variant="body2">{transformationError}</Typography>
          </Alert>
        </Container>
        <Box>
          <Button className={styles.actionButtons} onClick={() => history.push(`/${Step - 1}`)}>
            Back
          </Button>
          <Button className={styles.actionButtons} variant="contained" color="primary" disabled>
            Next
          </Button>
        </Box>
      </>
    );
  }

  if (!transformationResult) {
    return (
      <Container>
        <Skeleton animation="wave" width="100%" height="70vh" />
      </Container>
    );
  }
  const publishOptions: { [P in PublishElement]: React.ReactElement } = {
    download: <DownloadResults refinedCsv={refinedCsv} transformationResult={transformationResult} />,
    triplyDB: (
      <ErrorBoundary
        resetAction={(errorText: string) => {
          // Token is valid, but CORS fails, expect api not to be up
          if (
            errorText ===
              "Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc." ||
            // Token is deleted
            errorText === "Token does not exist." ||
            errorText.indexOf("401: Token does not exist.") >= 0
          ) {
            localStorage.removeItem("token");
            setCurrentToken("");
          }
        }}
      >
        <React.Suspense fallback={<Skeleton variant="rect" height={200} />}>
          <TriplyDBUpload transformationResult={transformationResult} refinedCsv={refinedCsv} />
        </React.Suspense>
      </ErrorBoundary>
    ),
  };
  return (
    <>
      <Container className={styles.publishOptions}>
        {wizardAppConfig.publishOrder.map((publishOption) => publishOptions[publishOption])}
        {Object.entries(publishOptions).map(([key, value]) => {
          if (wizardAppConfig.publishOrder.indexOf(key as PublishElement) >= 0) return null;
          return value;
        })}
      </Container>
      <Box>
        <Button className={styles.actionButtons} onClick={() => history.push(`/${Step - 1}`)}>
          Back
        </Button>
        <Button className={styles.actionButtons} variant="contained" color="primary" disabled>
          Next
        </Button>
      </Box>
    </>
  );
};
export default Publish;
