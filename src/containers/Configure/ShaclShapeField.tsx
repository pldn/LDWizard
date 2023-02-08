import * as React from "react";
import { wizardAppConfig } from "../../config";
import { useRecoilState } from "recoil";
import { transformationConfigState } from "../../state";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import HintWrapper from "../../components/HintWrapper";
import styles from "./style.scss";
import { ShaclShapeMeta } from '../../Definitions';

interface Props {}

const ShaclShapeField: React.FC<Props> = ({}) => {
  const [transformationConfig, setTransformationConfig] = useRecoilState(transformationConfigState);

  const [shaclShapeMetas, setShaclShapeMetas] = React.useState([] as ShaclShapeMeta[])

  // Async call for results effect
  React.useEffect(() => {
      wizardAppConfig.getShaclShapes(transformationConfig.resourceClass).then(shaclShapeMetas => {
        setShaclShapeMetas(shaclShapeMetas)
      })
  }, [transformationConfig]);

  return (
    <div className={styles.keyColumnWrapper}>
      <HintWrapper hint="The SHACL shape will limit which property URIs you can select.">
        <FormControl className={styles.shaclShapeSelector}>
          <InputLabel shrink={true}>SHACL shape</InputLabel>
          <Select
            displayEmpty
            defaultValue={""}
            value={transformationConfig.shaclShape ? transformationConfig.shaclShape : ''}
            onChange={(event) => {
              const shaclShape = event.target.value;
              setTransformationConfig((state) => ({ ...state, shaclShape }));
            }}
          >
            <MenuItem value={""}>No SHACL shape</MenuItem>
            {shaclShapeMetas.map((shaclShapeMeta) => (
              <MenuItem key={shaclShapeMeta.iri} value={shaclShapeMeta.iri}>
                {shaclShapeMeta.iri}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </HintWrapper>
    </div>

  );
};
export default ShaclShapeField;
