import * as React from "react";

import { useRecoilState } from "recoil";
import { transformationConfigState } from "../../state";

import { TextField } from "@mui/material";
import HintWrapper from "../../components/HintWrapper";
import styles from "./style.scss";
import validator from "validator";

interface Props {}

const BaseIriField: React.FC<Props> = ({}) => {
  const [transformationConfig, setTransformationConfig] = useRecoilState(transformationConfigState);

  //   Create an intermediate value here, to stop it from re-rendering
  const [baseIriTemp, setValue] = React.useState(transformationConfig.baseIri.toString() || "");
  const [isValidUrl, setValidationState] = React.useState<boolean>()

  const confirmBaseIri = () => {
    let baseIri = baseIriTemp.toString();
    if (!baseIri.endsWith("/") && !baseIri.endsWith("#")) baseIri = baseIri + "/";
    setTransformationConfig((state) => {
      return { ...state, baseIri: baseIri };
    });
  };
  function showHelperText(){
    switch (isValidUrl){
      case true:
        return
      case false:
        return "Invalid URL: " + `"`+transformationConfig.baseIri.toString()+ `"`
    }
  }

  return (
    <HintWrapper hint="The base IRI is used as a base for generating IRIs out of your resources">
      <TextField
        className={styles.baseIriField}
        value={baseIriTemp}
        onChange={(event) => {
          setValue(event.currentTarget.value)
          // URL validation
          validator.isURL(event.currentTarget.value) == false ? setValidationState(false) : setValidationState(true)
        }}
        onEmptied={() => setValue("")}
        helperText={showHelperText()}
        label={"Base IRI"}
        error={isValidUrl == false}
        fullWidth
        type="url"
        inputMode="url"
        onBlur={confirmBaseIri}
        placeholder="/"
        InputLabelProps={{ shrink: true }}
      />
    </HintWrapper>
  );
};
export default BaseIriField;
