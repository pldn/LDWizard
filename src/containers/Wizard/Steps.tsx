import React from "react";
import { Container, Step, StepButton, Stepper } from "@mui/material";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { matrixState } from "../../state/index.ts";
import styles from "./style.scss";

const Steps: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { stepNumber } = useParams(); // Use useParams to get the step number from the URL
  const currentStep = stepNumber ? parseInt(stepNumber, 10) : 1; // Convert to an integer, default to 1 if not present
  const parsedCsv = useRecoilValue(matrixState);

  return (
    <Container sx={{ py: 2 }}>
      <Stepper nonLinear activeStep={currentStep - 1}>
        <Step key={1} completed={!!parsedCsv}>
          <StepButton onClick={() => navigate(`/1`)}>Upload</StepButton>
        </Step>
        <Step key={2} disabled={!parsedCsv} completed={!!parsedCsv && currentStep > 2}>
          <StepButton onClick={() => navigate(`/2`)}>Configure</StepButton>
        </Step>
        <Step className={styles.stepButton} key={3} disabled={!parsedCsv}>
          <StepButton onClick={() => navigate(`/3`)}>Publish</StepButton>
        </Step>
      </Stepper>
    </Container>
  );
};

export default Steps;
