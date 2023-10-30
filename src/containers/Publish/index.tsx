import React from "react";
import styles from "./style.scss";
import { Box, Container, Button, Typography, Skeleton, Alert, LinearProgress } from "@mui/material";
import { useNavigate, Navigate } from "react-router-dom";
import { useGetRecoilValueInfo_UNSTABLE, useRecoilValue, useSetRecoilState } from "recoil";
import { matrixState, sourceState, transformationConfigState } from "../../state/index.ts";
import TriplyDBUpload from "./TriplyDBPublishForm.tsx";
import ErrorBoundary from "../../components/ErrorBoundary/index.tsx";
import { currentTokenState } from "../../state/clientJs.ts";
import DownloadResults from "./DownloadResults.tsx";
import { wizardAppConfig, PublishElement } from "../../config/index.ts";
import { Matrix, SingularSingleColumnRefinement, SingularDoubleColumnRefinement, SingularColumnParamRefinement, BulkSingleColumnRefinement, BulkDoubleColumnRefinement } from "../../Definitions.ts";
interface Props { }
export const Step = 3;
const Publish: React.FC<Props> = ({ }) => {
  const parsedCsv = useRecoilValue(matrixState);
  const [refinedCsv, setRefinedCsv] = React.useState<Matrix>();
  const source = useRecoilValue(sourceState);
  const transformationConfig = useRecoilValue(transformationConfigState);
  const setCurrentToken = useSetRecoilState(currentTokenState);
  const navigate = useNavigate();
  const [transformationResult, setTransformationResult] = React.useState<string>();
  const [transformationError, setTransformationError] = React.useState<string>();
  React.useEffect(() => {
    const transformFunction = async () => {
      setTransformationResult(undefined);
      setTransformationError(undefined);
      await new Promise<void>((resolve) => {
        // Make sure that the first render is done before we start the transformation
        setTimeout(() => {
          resolve();
        });
      });
      // Refinement
      let tempRefinedCsv: Matrix | undefined = undefined;
      if (parsedCsv && transformationConfig.columnConfiguration.some((config) => !!config.columnRefinement)) {
        tempRefinedCsv = parsedCsv;
        for (const column of transformationConfig.columnConfiguration) {
          if (column.columnRefinement === undefined || column.columnRefinement.type === "to-iri") continue;
          const columnIdx: number = tempRefinedCsv[0].indexOf(column.columnName);
          // Bulk processing
          if (column.columnRefinement) {
            const refinement = wizardAppConfig.refinementOptions.find(
              (config) => config.label === column.columnRefinement?.label
            );
            if (refinement?.type === "single" && column.columnRefinement.type === "single" && "bulkTransformation" in refinement) {
              const rowValues = tempRefinedCsv.slice(1).map(row => row[columnIdx]);
              const transformedRowValues = await refinement.bulkTransformation(rowValues)
              if (!Array.isArray(transformedRowValues)) {
                throw new Error(`bulkTransformation function ${refinement.label} does not return an array of strings`)
              }
              // insert the transformed data back into the csv
              tempRefinedCsv = tempRefinedCsv.map((row, index) => {
                if (index === 0) {
                  return [...row.slice(0, columnIdx + 1), `${column.columnName}-refined` || "", ...row.slice(columnIdx + 1)];
                } else {
                  return [...row.slice(0, columnIdx + 1), transformedRowValues[index - 1], ...row.slice(columnIdx + 1)];
                }
              });
            } else if (refinement?.type === "double-column" && column.columnRefinement.type === "double-column" && "bulkTransformation" in refinement) {
              const rowValues = tempRefinedCsv.slice(1).map(row => row[columnIdx]);
              const secondColumnIdx = column.columnRefinement.data.secondColumnIdx
              const secondRowValues = tempRefinedCsv.slice(1).map(row => row[secondColumnIdx]);
              const transformedRowValues = await refinement.bulkTransformation(rowValues, secondRowValues)
              if (!Array.isArray(transformedRowValues)) {
                throw new Error(`bulkTransformation function ${refinement.label} does not return an array of strings`)
              }
              // insert the transformed data back into the csv
              tempRefinedCsv = tempRefinedCsv.map((row, index) => {
                if (index === 0) {
                  return [...row.slice(0, columnIdx + 1), `${column.columnName}-refined` || "", ...row.slice(columnIdx + 1)];
                } else {
                  return [...row.slice(0, columnIdx + 1), transformedRowValues[index - 1], ...row.slice(columnIdx + 1)];
                }
              });
            } else if (refinement?.type === "single-param" && column.columnRefinement.type === "single-param" && "bulkTransformation" in refinement) {
              const rowValues = tempRefinedCsv.slice(1).map(row => row[columnIdx]);
              const transformedRowValues = await refinement.bulkTransformation(rowValues, column.columnRefinement.data.iriPrefix)
              if (!Array.isArray(transformedRowValues)) {
                throw new Error(`bulkTransformation function ${refinement.label} does not return an array of strings`)
              }
              // insert the transformed data back into the csv
              tempRefinedCsv = tempRefinedCsv.map((row, index) => {
                if (index === 0) {
                  return [...row.slice(0, columnIdx + 1), `${column.columnName}-refined` || "", ...row.slice(columnIdx + 1)];
                } else {
                  return [...row.slice(0, columnIdx + 1), transformedRowValues[index - 1], ...row.slice(columnIdx + 1)];
                }
              });
            }
          }

          // Singular processing
          tempRefinedCsv = await Promise.all(
            tempRefinedCsv.map(async (row, rowIdx) => {
              let toInject = undefined;
              // for column row (first one)
              if (rowIdx === 0) {
                toInject = column.columnName + "-refined";
              } else if (column.columnRefinement) {
                const refinement = wizardAppConfig.refinementOptions.find(
                  (config) => config.label === column.columnRefinement?.label
                );
                if (!refinement) throw new Error(`Unknown transformation: ${column.columnRefinement.label}`);
                if (refinement?.type === "single" && column.columnRefinement.type === "single" && "transformation" in refinement) {
                  toInject = refinement.transformation(row[columnIdx]);
                } else if (refinement?.type === "double-column" && column.columnRefinement.type === "double-column" && "transformation" in refinement) {
                  toInject = refinement.transformation(
                    row[columnIdx],
                    // Rows might have been added, refer back to the original CSV
                    parsedCsv[rowIdx][column.columnRefinement.data.secondColumnIdx]
                  );
                } else if (refinement?.type === "single-param" && column.columnRefinement.type === "single-param" && "transformation" in refinement) {
                  toInject = refinement.transformation(
                    row[columnIdx],
                    // Rows might have been added, refer back to the original CSV
                    column.columnRefinement.data.iriPrefix
                  );
                }
                // || column.columnRefinement.type === "single-param"
              }
              return new Array(...row.slice(0, columnIdx + 1), (await toInject) || "", ...row.slice(columnIdx + 1));
            })
          );
        }
        setRefinedCsv(tempRefinedCsv);
      }
      // Transformation
      if (parsedCsv) {
        // Transformation done here for double-column single-param etc
        const transformationResult = await wizardAppConfig.applyTransformation({
          config: transformationConfig,
          source: tempRefinedCsv || parsedCsv,
          type: "rml",
        });
        setTransformationResult(transformationResult);
      }
    };
    transformFunction().catch((e) => {
      console.error(e)
      setTransformationError(e.message);
    });
  }, [transformationConfig, parsedCsv]);

  if (!source || !parsedCsv) {
    return <Navigate to="/1" />;
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
      </>
    );
  }

  if (!transformationResult) {
    return (
      <Container>
        <Box>
          <Typography variant="h4" align="center" style={{ marginBottom: 50, marginTop: 50 }}>
            Transforming data...
          </Typography>
        </Box>
        <LinearProgress />
      </Container>
    );
  }
  const publishOptions: { [P in PublishElement]: React.ReactElement } = {
    download: (
      <DownloadResults refinedCsv={refinedCsv} transformationResult={transformationResult} key="Download-to-browser" />
    ),
    triplyDB: (
      <ErrorBoundary
        key="Publish-triplyDB"
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
        <React.Suspense fallback={<Skeleton variant="rectangular" height={200} />}>
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
    </>
  );
};
export default Publish;