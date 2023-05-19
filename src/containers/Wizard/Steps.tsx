import React from "react";
import Container from "@mui/material/Container";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepButton from "@mui/material/StepButton";
import { Step as UploadStep } from "../Upload";
import { Step as ConfigureStep } from "../Configure";
import { Step as PublishStep } from "../Publish";
import { useNavigate, useLocation } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { matrixState } from "../../state";
import styles from "./style.scss";
import ShaclValidates from '../../components/ShaclValidates';
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

const Steps: React.FC<{ type: 'steps' | 'buttons' }> = ({ type }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const stepValidators = {
    1: () => !!parsedCsv,
    2: () => !!parsedCsv,
    3: () => !!parsedCsv && currentStep > 2
  }

  const currentStep = (location.pathname[1] !== undefined ? + location.pathname[1] : 1) as keyof typeof stepValidators
  const parsedCsv = useRecoilValue(matrixState);

  const stepIsValid = (step: keyof typeof stepValidators) => {
    return step.toString() in stepValidators ? stepValidators[step]() : false
  }

  if (type === 'steps') {
    return (
      <Container sx={{ py: 2 }}>
        <Stepper activeStep={currentStep - 1}>
          <Step key={UploadStep} completed={stepValidators[1]()}>
            <StepButton onClick={() => navigate(`/${UploadStep}`)}>Upload</StepButton>
          </Step>
          <Step key={ConfigureStep} disabled={stepValidators[1]()} completed={stepValidators[2]()}>
            <StepButton onClick={() => stepValidators[1]() ? navigate(`/${ConfigureStep}`) : null}>Configure</StepButton>
          </Step>
  
          <Step
            className={styles.stepButton}
            key={PublishStep}
            disabled={!stepValidators[1]()}
            onClick={() => stepValidators[2]() ? navigate(`/${PublishStep}`) : null}
          >
            <StepLabel>Publish</StepLabel>
          </Step>
  
        </Stepper>
      </Container>
    );  
  }
  else if (type === 'buttons') {
    return (<Box>
      <Button disabled={!((currentStep - 1).toString() in stepValidators)} onClick={() => navigate(`/${currentStep - 1}`)} className={styles.actionButtons}>
        Back
      </Button>
      <Button
        className={styles.actionButtons}
        variant="contained"
        disabled={!((currentStep + 1).toString() in stepValidators) || !stepIsValid(currentStep)}
        color="primary"
        onClick={() => stepIsValid(currentStep) ? navigate(`/${currentStep + 1}`) : null}
      >
        Next
      </Button>
      <Button
        className={styles.actionButtons}
        onClick={() => {
          const confirmed = confirm("All progress will be lost, are you sure?")
          if (!confirmed) return
          window.location.replace("");
        }}
      >
        Restart
      </Button>
    </Box>)
  }

  throw new Error('Unknown type given')
};
export default Steps;
