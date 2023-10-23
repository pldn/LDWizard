import React from "react";
import { Container, Step, StepButton, StepLabel, Stepper } from "@mui/material";
import { Step as UploadStep } from "../Upload/index.tsx";
import { Step as ConfigureStep } from "../Configure/index.tsx";
import { Step as PublishStep } from "../Publish/index.tsx";
import { useNavigate, useLocation } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { matrixState } from "../../state/index.ts";
import styles from "./style.scss";
import { ShaclShapeMeta } from '../../Definitions';
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { useRecoilState } from "recoil";
import { transformationConfigState } from "../../state";
import { wizardAppConfig } from "../../config";

const Steps: React.FC<{ type: 'steps' | 'buttons' }> = ({ type }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [transformationConfig] = useRecoilState(transformationConfigState);

  const currentStep = (location.pathname[1] !== undefined ? + location.pathname[1] : 1) as keyof typeof stepValidators

  /** Gathering of validation properties */
  const parsedCsv = useRecoilValue(matrixState);
  let shaclValidates = !transformationConfig.shaclShape // Initial SHACL does not validate if it is used.
  const [shaclShapeMetas, setShaclShapeMetas] = React.useState([] as ShaclShapeMeta[]);

  React.useEffect(() => {
    wizardAppConfig.getShaclShapes(transformationConfig.resourceClass)
      .then(shaclShapeMetas => setShaclShapeMetas(shaclShapeMetas))
  }, [transformationConfig]);

  if (shaclShapeMetas && transformationConfig.shaclShape) {
    const shaclShapeMeta = shaclShapeMetas.find(shaclShapeMeta => shaclShapeMeta.iri === transformationConfig.shaclShape);
    
    const requiredProperties = (shaclShapeMeta?.properties
      .filter(property => property.minCount && parseInt(property.minCount)) ?? [])
      .map(property => property.path)

    const configuredIris = transformationConfig.columnConfiguration.map(column => column.propertyIri);
    shaclValidates = requiredProperties.every(requiredProperty => configuredIris.includes(requiredProperty));
  }
  /** End of gathering of validation properties */

  const stepValidators = {
    1: () => !!parsedCsv,
    2: () => !!parsedCsv && shaclValidates,
    3: () => !!parsedCsv && currentStep > 2 && shaclValidates
  }

  const stepIsValid = (step: keyof typeof stepValidators) => {
    return step.toString() in stepValidators ? stepValidators[step]() : false;
  }

  /**
   * We have two ways of displaying the steps but one way of validating.
   */
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
      <Button disabled={!((currentStep - 1).toString() in stepValidators)} onClick={() => navigate(`/${currentStep - 1}`)} style={{textTransform: 'none'}} className={styles.actionButtons}>
        Back
      </Button>
      <Button
        className={styles.actionButtons}
        variant="contained"
        disabled={!((currentStep + 1).toString() in stepValidators) || !stepIsValid(currentStep)}
        color="primary"
        onClick={() => stepIsValid(currentStep) ? navigate(`/${currentStep + 1}`) : null}
        style={{textTransform: 'none'}}
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
        style={{textTransform: 'none'}}
      >
        Restart
      </Button>
    </Box>)
  }

  throw new Error('Unknown type given')
};
export default Steps;