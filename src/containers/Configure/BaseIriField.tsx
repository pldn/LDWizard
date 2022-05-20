import * as React from "react";

import { useRecoilState } from "recoil";
import { transformationConfigState } from "../../state";

import { TextField } from "@mui/material";
import HintWrapper from "../../components/HintWrapper";
import * as styles from "./style.scss";

interface Props {}

const BaseIriField: React.FC<Props> = ({}) => {
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
        onChange={(event) => setValue(event.currentTarget.value)}
        onEmptied={() => setValue("")}
        label={"Base IRI"}
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
