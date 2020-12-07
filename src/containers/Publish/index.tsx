import React from "react";
import styles from "./style.scss";
import { Box, Container, Button } from "@material-ui/core";
import { useHistory, Redirect } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { matrixState, sourceState, transformationConfigState } from "../../state";
import TriplyDBUpload from "./TriplyDBPublishForm";
import { Skeleton, Alert } from "@material-ui/lab";
import ErrorBoundary from "../../components/ErrorBoundary";
import { currentTokenState } from "../../state/clientJs";
import DownloadResults from "./DownloadResults";
import { wizardAppConfig, PublishElement } from "../../config";
interface Props {}
export const Step = 3;
const Publish: React.FC<Props> = ({}) => {
  const parsedCsv = useRecoilValue(matrixState);
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
      if (parsedCsv) {
        const transformationResult = await wizardAppConfig.applyTransformation({
          config: transformationConfig,
          source: parsedCsv,
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
          <Alert severity="error">{transformationError}</Alert>
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
    download: <DownloadResults transformationResult={transformationResult} />,
    triplyDB: (
      <ErrorBoundary
        resetAction={(errorText: string) => {
          // Token is valid, but CORS fails, expect api not to be up
          if (
            errorText ===
              "Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc." ||
            // Token is deleted
            errorText === "Token does not exist."
          ) {
            localStorage.removeItem("token");
            setCurrentToken("");
          }
        }}
      >
        <React.Suspense fallback={<Skeleton variant="rect" height={200} />}>
          <TriplyDBUpload transformationResult={transformationResult} />
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
