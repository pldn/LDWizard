import React from "react";
import styles from "./style.scss";
import { Box, Container, Typography, Skeleton, Alert, LinearProgress, LinearProgressProps, CircularProgress } from "@mui/material";
import { Navigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { matrixState, sourceState, transformationConfigState } from "../../state/index.ts";
import TriplyDBUpload from "./TriplyDBPublishForm.tsx";
import ErrorBoundary from "../../components/ErrorBoundary/index.tsx";
import { currentTokenState } from "../../state/clientJs.ts";
import DownloadResults from "./DownloadResults.tsx";
import { wizardAppConfig, PublishElement } from "../../config/index.ts";
import { Matrix } from "../../Definitions.ts";
interface Props { }
export const Step = 3;
const Publish: React.FC<Props> = ({ }) => {
  const parsedCsv = useRecoilValue(matrixState);
  const [refinedCsv, setRefinedCsv] = React.useState<Matrix>();
  const source = useRecoilValue(sourceState);
  const transformationConfig = useRecoilValue(transformationConfigState);
  const setCurrentToken = useSetRecoilState(currentTokenState);
  const [transformationResult, setTransformationResult] = React.useState<string>();
  const [transformationError, setTransformationError] = React.useState<string>();
  const [progress, setProgress] = React.useState(0);

function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '2em' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box>
    </Box>
  );
}
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
        for (const [index, column] of transformationConfig.columnConfiguration.entries()) {
          try {
            if (column.columnRefinement === undefined || column.columnRefinement.type === "to-iri") continue;
            const columnIdx: number = tempRefinedCsv[0].indexOf(column.columnName);
            const refinement = wizardAppConfig.refinementOptions.find(
              (config) => config.label === column.columnRefinement?.label
            );
            if ((column.columnRefinement && "bulkTransformation" in refinement && typeof refinement.bulkTransformation === 'function') && (column.columnRefinement && 'transformation' in refinement && typeof refinement.transformation === 'function')) throw new Error(`Cannot use both 'transformation' and 'bulkTransformation' in the same '${refinement.label}' refinement, please only specify one.`)
            // Bulk processing
            if (column.columnRefinement && "bulkTransformation" in refinement && typeof refinement.bulkTransformation === 'function') {
              if (refinement.batchSize === 0) console.error('Cannot use batchSize of size 0, please increase value to be greater than 0 if you want to process in batches.\nCurrently transforming the entire column instead (as if batchSize were undefined).')
              if (refinement?.type === "single" && column.columnRefinement.type === "single") {
                // Extracting values of the specified column
                const rowValues = tempRefinedCsv.slice(1).map(row => row[columnIdx]);

                // Check if batchSize is defined
                if (refinement.batchSize) {
                  let transformedRowValues: string[] = [];

                  // Process the column values in batches
                  for (let i = 0; i < rowValues.length; i += refinement.batchSize) {
                    const batch = rowValues.slice(i, i + refinement.batchSize);
                    const transformedBatch = await refinement.bulkTransformation(batch);

                    if (!Array.isArray(transformedBatch)) {
                      throw new Error(`bulkTransformation function ${refinement.label} does not return an array of strings`);
                    }

                    transformedRowValues.push(...transformedBatch);
                  }

                  // Update the tempRefinedCsv with the transformed values in batches
                  tempRefinedCsv = tempRefinedCsv.map((row, index) => {
                    if (index === 0) {
                      return [...row.slice(0, columnIdx + 1), `${column.columnName}-refined` || "", ...row.slice(columnIdx + 1)];
                    } else {
                      return [...row.slice(0, columnIdx + 1), transformedRowValues[index - 1], ...row.slice(columnIdx + 1)];
                    }
                  });
                } else {
                  // Process the entire column
                  const transformedRowValues = await refinement.bulkTransformation(rowValues);

                  if (!Array.isArray(transformedRowValues)) {
                    throw new Error(`bulkTransformation function ${refinement.label} does not return an array of strings`);
                  }

                  // Insert the transformed data back into the csv for the entire column
                  tempRefinedCsv = tempRefinedCsv.map((row, index) => {
                    if (index === 0) {
                      return [...row.slice(0, columnIdx + 1), `${column.columnName}-refined` || "", ...row.slice(columnIdx + 1)];
                    } else {
                      return [...row.slice(0, columnIdx + 1), transformedRowValues[index - 1], ...row.slice(columnIdx + 1)];
                    }
                  });
                }

              } else if (refinement?.type === "double-column" && column.columnRefinement.type === "double-column") {
                // Extracting values of the specified columns
                const rowValues = tempRefinedCsv.slice(1).map(row => row[columnIdx]);
                const secondColumnIdx = column.columnRefinement.data.secondColumnIdx
                const secondRowValues = tempRefinedCsv.slice(1).map(row => row[secondColumnIdx]);

                // Check if batchSize is defined
                if (refinement.batchSize) {
                  let transformedRowValues: string[] = [];

                  // Process the column values in batches
                  for (let i = 0; i < rowValues.length; i += refinement.batchSize) {
                    const firstBatch = rowValues.slice(i, i + refinement.batchSize);
                    const secondBatch = secondRowValues.slice(i, i + refinement.batchSize);
                    const transformedBatch = await refinement.bulkTransformation(firstBatch, secondBatch);

                    if (!Array.isArray(transformedBatch)) {
                      throw new Error(`bulkTransformation function ${refinement.label} does not return an array of strings`);
                    }

                    transformedRowValues.push(...transformedBatch);
                  }

                  // Update the tempRefinedCsv with the transformed values in batches
                  tempRefinedCsv = tempRefinedCsv.map((row, index) => {
                    if (index === 0) {
                      return [...row.slice(0, columnIdx + 1), `${column.columnName}-refined` || "", ...row.slice(columnIdx + 1)];
                    } else {
                      return [...row.slice(0, columnIdx + 1), transformedRowValues[index - 1], ...row.slice(columnIdx + 1)];
                    }
                  });
                } else {
                  // Process the entire column
                  const transformedRowValues = await refinement.bulkTransformation(rowValues, secondRowValues);

                  if (!Array.isArray(transformedRowValues)) {
                    throw new Error(`bulkTransformation function ${refinement.label} does not return an array of strings`);
                  }

                  // Insert the transformed data back into the csv for the entire column
                  tempRefinedCsv = tempRefinedCsv.map((row, index) => {
                    if (index === 0) {
                      return [...row.slice(0, columnIdx + 1), `${column.columnName}-refined` || "", ...row.slice(columnIdx + 1)];
                    } else {
                      return [...row.slice(0, columnIdx + 1), transformedRowValues[index - 1], ...row.slice(columnIdx + 1)];
                    }
                  });
                }
              } else if (refinement?.type === "single-param" && column.columnRefinement.type === "single-param") {
                // Extracting values of the specified column
                const rowValues = tempRefinedCsv.slice(1).map(row => row[columnIdx]);

                // Check if batchSize is defined
                if (refinement.batchSize) {
                  let transformedRowValues: string[] = [];

                  // Process the column values in batches
                  for (let i = 0; i < rowValues.length; i += refinement.batchSize) {
                    const batch = rowValues.slice(i, i + refinement.batchSize);
                    const transformedBatch = await refinement.bulkTransformation(batch, column.columnRefinement.data.iriPrefix);

                    if (!Array.isArray(transformedBatch)) {
                      throw new Error(`bulkTransformation function ${refinement.label} does not return an array of strings`);
                    }

                    transformedRowValues.push(...transformedBatch);
                  }

                  // Update the tempRefinedCsv with the transformed values in batches
                  tempRefinedCsv = tempRefinedCsv.map((row, index) => {
                    if (index === 0) {
                      return [...row.slice(0, columnIdx + 1), `${column.columnName}-refined` || "", ...row.slice(columnIdx + 1)];
                    } else {
                      return [...row.slice(0, columnIdx + 1), transformedRowValues[index - 1], ...row.slice(columnIdx + 1)];
                    }
                  });
                } else {
                  // Process the entire column
                  const transformedRowValues = await refinement.bulkTransformation(rowValues, column.columnRefinement.data.iriPrefix);

                  if (!Array.isArray(transformedRowValues)) {
                    throw new Error(`bulkTransformation function ${refinement.label} does not return an array of strings`);
                  }

                  // Insert the transformed data back into the csv for the entire column
                  tempRefinedCsv = tempRefinedCsv.map((row, index) => {
                    if (index === 0) {
                      return [...row.slice(0, columnIdx + 1), `${column.columnName}-refined` || "", ...row.slice(columnIdx + 1)];
                    } else {
                      return [...row.slice(0, columnIdx + 1), transformedRowValues[index - 1], ...row.slice(columnIdx + 1)];
                    }
                  });
                }
              }
            } else if (column.columnRefinement && 'transformation' in refinement && typeof refinement.transformation === 'function') {
              // Singular processing
              tempRefinedCsv = await Promise.all(
                tempRefinedCsv.map(async (row, rowIdx) => {
                  let toInject = undefined;
                  // for column row (first one)
                  if (rowIdx === 0) {
                    toInject = column.columnName + "-refined";
                  } else {
                    const refinement = wizardAppConfig.refinementOptions.find(
                      (config) => config.label === column.columnRefinement?.label
                    );
                    if (!refinement) throw new Error(`Unknown transformation: ${column.columnRefinement.label}`);
                    if (refinement?.type === "single" && column.columnRefinement.type === "single" && 'transformation' in refinement && typeof refinement.transformation === 'function') {
                      toInject = refinement.transformation(row[columnIdx]);
                    } else if (refinement?.type === "double-column" && column.columnRefinement.type === "double-column" && 'transformation' in refinement && typeof refinement.transformation === 'function') {
                      toInject = refinement.transformation(
                        row[columnIdx],
                        // Rows might have been added, refer back to the original CSV
                        parsedCsv[rowIdx][column.columnRefinement.data.secondColumnIdx]
                      );
                    } else if (refinement?.type === "single-param" && column.columnRefinement.type === "single-param" && 'transformation' in refinement && typeof refinement.transformation === 'function') {
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
          }
          catch (e) { throw e }
          finally {
            const currentProgress = ((index + 1) / transformationConfig.columnConfiguration.length) * 100
            setProgress(currentProgress);
          }
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
          wizardAppConfig: wizardAppConfig,
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
        <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '2em' }}>
          <CircularProgress />
        </Box >
        <LinearProgressWithLabel value={progress} />
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