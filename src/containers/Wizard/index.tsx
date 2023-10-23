import React from "react";
import { Paper, Skeleton } from "@mui/material";
import Upload, { Step as UploadStep } from "../Upload/index.tsx";
// import Transform, { Step as TransformStep } from "../Transform";
import Configure, { Step as ConfigureStep } from "../Configure/index.tsx";
import { Route, Routes, Navigate } from "react-router-dom";
import Publish, { Step as ExportStep } from "../Publish/index.tsx";
import Steps from "./Steps.tsx";
import ErrorBoundary from "../../components/ErrorBoundary/index.tsx";
interface Props {}

const Wizard: React.FC<Props> = () => {
  return (
    <Paper elevation={2} square>
      <Steps type='steps' />
      <ErrorBoundary>
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
