import React from "react";
import { Container, Step, StepButton, StepLabel, Stepper } from "@mui/material";
import { Step as UploadStep } from "../Upload/index.tsx";
import { Step as ConfigureStep } from "../Configure/index.tsx";
import { Step as PublishStep } from "../Publish/index.tsx";
import { useNavigate, useLocation } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { matrixState } from "../../state/index.ts";
import styles from "./style.scss";

const Steps: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentStep = location.pathname[1] !== undefined ? +location.pathname[1] : 1;
  const parsedCsv = useRecoilValue(matrixState);
  return (
    <Container sx={{ py: 2 }}>
      <Stepper nonLinear activeStep={currentStep - 1}>
        <Step key={UploadStep} completed={!!parsedCsv}>
          <StepButton onClick={() => navigate(`/${UploadStep}`)}>Upload</StepButton>
        </Step>
        <Step key={ConfigureStep} disabled={!parsedCsv} completed={!!parsedCsv && currentStep > 2}>
          <StepButton onClick={() => navigate(`/${ConfigureStep}`)}>Configure</StepButton>
        </Step>
        <Step
          className={styles.stepButton}
          key={PublishStep}
          disabled={!parsedCsv}
          onClick={() => navigate(`/${PublishStep}`)}
        >
          <StepLabel>Publish</StepLabel>
        </Step>
      </Stepper>
    </Container>
  );
};

export default Steps;
