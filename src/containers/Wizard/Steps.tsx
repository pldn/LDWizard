import React from "react";
import Container from "@material-ui/core/Container";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import StepButton from "@material-ui/core/StepButton";
import { Step as UploadStep } from "../Upload";
import { Step as ConfigureStep } from "../Configure";
import { Step as PublishStep } from "../Publish";
import { useHistory, useLocation } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { matrixState } from "../../state";
import styles from "./style.scss";
const Steps: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const currentStep = +location.pathname[1];

  const parsedCsv = useRecoilValue(matrixState);
  return (
    <Container>
      <Stepper nonLinear activeStep={currentStep - 1}>
        <Step key={UploadStep} completed={!!parsedCsv}>
          <StepButton onClick={() => history.push(`/${UploadStep}`)}>Upload</StepButton>
        </Step>
        <Step key={ConfigureStep} disabled={!parsedCsv} completed={!!parsedCsv && currentStep > 2}>
          <StepButton onClick={() => history.push(`/${ConfigureStep}`)}>Configure</StepButton>
        </Step>
        <Step
          className={styles.stepButton}
          key={PublishStep}
          disabled={!parsedCsv}
          onClick={() => history.push(`/${PublishStep}`)}
        >
          <StepLabel>Publish</StepLabel>
        </Step>
      </Stepper>
    </Container>
  );
};
export default Steps;
