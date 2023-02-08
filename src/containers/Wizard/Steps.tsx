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

const Steps: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentStep = location.pathname[1] !== undefined ? +location.pathname[1] : 1;
  const parsedCsv = useRecoilValue(matrixState);
  const publishDisabled = !parsedCsv

  const yes = (<Step
    className={styles.stepButton}
    key={PublishStep}
    disabled={!parsedCsv}
    onClick={() => publishDisabled ? null : navigate(`/${PublishStep}`)}
  >
    <StepLabel>Publish</StepLabel>
  </Step>)

  const no = (<Step
    className={styles.stepButton}
    key={PublishStep}
    disabled
    onClick={() => publishDisabled ? null : navigate(`/${PublishStep}`)}
  >
    <StepLabel>Publish</StepLabel>
  </Step>)

  return (
    <Container sx={{ py: 2 }}>
      <Stepper activeStep={currentStep - 1}>
        <Step key={UploadStep} completed={!!parsedCsv}>
          <StepButton onClick={() => navigate(`/${UploadStep}`)}>Upload</StepButton>
        </Step>
        <Step key={ConfigureStep} disabled={!parsedCsv} completed={!!parsedCsv && currentStep > 2}>
          <StepButton onClick={() => navigate(`/${ConfigureStep}`)}>Configure</StepButton>
        </Step>

        <ShaclValidates yes={yes} no={no} />

      </Stepper>
    </Container>
  );
};
export default Steps;
