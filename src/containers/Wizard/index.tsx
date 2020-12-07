import React from "react";
import { Paper } from "@material-ui/core";
import Upload, { Step as UploadStep } from "../Upload";
// import Transform, { Step as TransformStep } from "../Transform";
import Configure, { Step as ConfigureStep } from "../Configure";
import { Route, Switch, Redirect } from "react-router-dom";
import Publish, { Step as ExportStep } from "../Publish";
import Steps from "./Steps";
import ErrorBoundary from "../../components/ErrorBoundary";
import { Skeleton } from "@material-ui/lab";
interface Props {}

const Wizard: React.FC<Props> = () => {
  return (
    <Paper elevation={2} square>
      <Steps />
      <ErrorBoundary>
        <Switch>
          <Route exact path={`/${UploadStep}`}>
            <Upload />
          </Route>
          <Route exact path={`/${ConfigureStep}`}>
            <React.Suspense fallback={<Skeleton width="100%" height="500px" />}>
              <Configure />
            </React.Suspense>
          </Route>
          <Route exact path={`/${ExportStep}`}>
            <Publish />
          </Route>
          <Redirect to={`/${UploadStep}`} />
        </Switch>
      </ErrorBoundary>
    </Paper>
  );
};
export default Wizard;
