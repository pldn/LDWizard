import React from "react";
import { Paper } from "@material-ui/core";
import Upload, { Step as UploadStep } from "../Upload";
// import Transform, { Step as TransformStep } from "../Transform";
import Configure, { Step as ConfigureStep } from "../Configure";
import { Route, Switch, Redirect } from "react-router-dom";
import Export, { Step as ExportStep } from "containers/Publish";
import Steps from "./Steps";
import ErrorBoundary from "components/ErrorBoundary";
import * as styles from "./style.scss";
interface Props {}

const Wizard: React.FC<Props> = () => {
  return (
    <Paper elevation={2} square className={styles.topIndent}>
      <Steps />
      <ErrorBoundary>
        <Switch>
          <Route exact path={`/${UploadStep}`}>
            <Upload />
          </Route>
          <Route exact path={`/${ConfigureStep}`}>
            <Configure />
          </Route>
          <Route exact path={`/${ExportStep}`}>
            <Export />
          </Route>
          <Redirect to={`/${UploadStep}`} />
        </Switch>
      </ErrorBoundary>
    </Paper>
  );
};
export default Wizard;
