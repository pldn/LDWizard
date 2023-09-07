import * as React from "react";

import { useRecoilState } from "recoil";
import { transformationConfigState } from "../../state/index.ts";

import { TextField } from "@mui/material";
import HintWrapper from "../../components/HintWrapper/index.tsx";
import styles from "./style.scss";
import validator from "validator";

interface Props {
  isValidUrl: boolean,
  setIsValidUrl: React.Dispatch<React.SetStateAction<boolean>>
}

const BaseIriField: React.FC<Props> = ({isValidUrl, setIsValidUrl}) => {
  const [transformationConfig, setTransformationConfig] = useRecoilState(transformationConfigState);

  //   Create an intermediate value here, to stop it from re-rendering
  const [baseIriTemp, setValue] = React.useState(transformationConfig.baseIri.toString() || "");
  const confirmBaseIri = () => {
    let baseIri = baseIriTemp.toString();
    if (!baseIri.endsWith("/") && !baseIri.endsWith("#")) baseIri = baseIri + "/";
    setTransformationConfig((state) => {
      return { ...state, baseIri: baseIri };
    });
  };
  return (
    <HintWrapper hint="The base IRI is used as a base for generating IRIs out of your resources">
      <TextField
        className={styles.baseIriField}
        value={baseIriTemp}
        onChange={(event) => {
          setValue(event.currentTarget.value)
          setIsValidUrl(validator.default.isURL(event.currentTarget.value))
        }}
        onEmptied={() => setValue("")}
        helperText={isValidUrl ? "" : 'Invalid URL'}
        label={"Base IRI"}
        error={!isValidUrl}
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
