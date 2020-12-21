import {
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@material-ui/core";
import * as React from "react";
import HintWrapper from "../../components/HintWrapper";
import * as styles from "./style.scss";
import config from "../../config";
interface Props {
  selectedTransformation: string | undefined;
  iriPrefix: string | undefined;
  onTransformationChange: (newTransformation: string | undefined) => void;
  onIriPrefixChange: (iriPrefix: string | undefined) => void;
}
const IRI_TRANSFORMATION = "IRI_PREFIX_TRANSFORMATION";
const TransformationSelector: React.FC<Props> = ({
  selectedTransformation,
  iriPrefix,
  onTransformationChange,
  onIriPrefixChange,
}) => {
  const transformationText =
    (selectedTransformation &&
      config.refinementOptions.find((refinementOption) => refinementOption.label === selectedTransformation)
        ?.description) ||
    undefined;
  if (Object.keys(config.refinementOptions).length === 0) {
    return (
      <div className={styles.columnConfigSection}>
        <Typography variant="subtitle1">Value configuration</Typography>
        <HintWrapper
          hint="When enabled, values in this column will be transformed to IRIs"
          className={styles.hintOverride}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedTransformation === IRI_TRANSFORMATION}
                onChange={(_input, checked) => {
                  if (checked) {
                    onTransformationChange(IRI_TRANSFORMATION);
                    onIriPrefixChange(config.defaultBaseIri);
                  } else {
                    onTransformationChange(undefined);
                    onIriPrefixChange(undefined);
                  }
                }}
              />
            }
            label={<Typography variant="body2">Convert to IRI</Typography>}
          />
        </HintWrapper>
        {selectedTransformation === IRI_TRANSFORMATION && (
          <div className={styles.indent}>
            <HintWrapper hint="This prefix will be prepended to all values in this column.">
              <TextField
                label="Prefix"
                value={iriPrefix}
                onChange={(event) => onIriPrefixChange(event.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </HintWrapper>
          </div>
        )}
      </div>
    );
  } else {
    return (
      <div className={styles.columnConfigSection}>
        <Typography variant="subtitle1">Value refinement</Typography>
        <HintWrapper
          hint="To improve your data quality you can use these transformations to enrich your data by linking to other datasets."
          className={styles.hintOverride}
        >
          <FormControl fullWidth className={styles.refinementSelector}>
            <InputLabel shrink>Refinement selector</InputLabel>
            <Select
              displayEmpty
              value={selectedTransformation || ""}
              onChange={(event) => {
                if (event.target.value === "") {
                  onTransformationChange(undefined);
                  if (iriPrefix !== undefined) onIriPrefixChange(undefined);
                } else if (event.target.value === IRI_TRANSFORMATION) {
                  onTransformationChange(IRI_TRANSFORMATION);
                  onIriPrefixChange(iriPrefix || config.defaultBaseIri);
                } else if (typeof event.target.value === "string") {
                  onTransformationChange(event.target.value);
                  if (iriPrefix !== undefined) onIriPrefixChange(undefined);
                }
              }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value={IRI_TRANSFORMATION}>IRI Prefix transformation</MenuItem>
              {config.refinementOptions.map((refinementConfig) => (
                <MenuItem key={refinementConfig.label} value={refinementConfig.label}>
                  {refinementConfig.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </HintWrapper>
        {transformationText && (
          <div className={styles.indent}>
            <Typography paragraph>{transformationText}</Typography>
          </div>
        )}
        {selectedTransformation === IRI_TRANSFORMATION && (
          <div className={styles.indent}>
            <HintWrapper hint="This prefix will be prepended to all values in this column.">
              <TextField
                label="Prefix"
                value={iriPrefix}
                onChange={(event) => onIriPrefixChange(event.currentTarget.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </HintWrapper>
          </div>
        )}
      </div>
    );
  }
};
export default TransformationSelector;
