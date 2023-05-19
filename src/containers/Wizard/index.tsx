import React from "react";
import { Paper, Skeleton } from "@mui/material";
import Upload, { Step as UploadStep } from "../Upload";
// import Transform, { Step as TransformStep } from "../Transform";
import Configure, { Step as ConfigureStep } from "../Configure";
import { Route, Routes, Navigate } from "react-router-dom";
import Publish, { Step as ExportStep } from "../Publish";
import Steps from "./Steps";
import ErrorBoundary from "../../components/ErrorBoundary";
interface Props {}

const Wizard: React.FC<Props> = () => {
  return (
    <Paper elevation={2} square>
      <ErrorBoundary>
        <Steps type='steps' />
        <Routes>
          <Route path={`${UploadStep}`} element={<Upload />} />
          <Route
            path={`${ConfigureStep}`}
            element={
              <React.Suspense fallback={<Skeleton width="100%" height="500px" />}>
                <Configure />
              </React.Suspense>
            }
          />
          <Route path={`${ExportStep}`} element={<Publish />} />
          <Route path="*" element={<Navigate to={`${UploadStep}`} />} />
        </Routes>
        <Steps type='buttons' />
      </ErrorBoundary>
    </Paper>
  );
};
export default Wizard;
