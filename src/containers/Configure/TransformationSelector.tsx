import {
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import * as React from "react";
import HintWrapper from "../../components/HintWrapper/index.tsx";
import styles from "./style.scss";
import config from "../../config/index.ts";
import { ColumnRefinementSetting } from "../../Definitions.ts";
import { useRecoilValue } from "recoil";
import { transformationConfigState } from "../../state/index.ts";
interface Props {
  selectedColumn: number;
  selectedTransformation: ColumnRefinementSetting | undefined;
  onTransformationChange: (newTransformation: ColumnRefinementSetting | undefined) => void;
}
const TransformationSelector: React.FC<Props> = ({
  selectedColumn,
  selectedTransformation,
  onTransformationChange,
}) => {
  const transformationConfig = useRecoilValue(transformationConfigState);
  const transformationText =
    selectedTransformation &&
    config.refinementOptions.find((refinementOption) => refinementOption.label === selectedTransformation.label)
      ?.description;
  // Only render a checkbox when the "to-iri" transformation is the only transformation
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
                checked={selectedTransformation?.type === "to-iri"}
                onChange={(_input, checked) => {
                  if (checked) {
                    onTransformationChange({
                      label: "to-iri",
                      type: "to-iri",
                      data: { iriPrefix: config.defaultBaseIri },
                    KeepOriginalValueOptions: undefined
                    });
                  } else {
                    onTransformationChange(undefined);
                  }
                }}
              />
            }
            label={<Typography variant="body2">Convert to IRI</Typography>}
          />
        </HintWrapper>
        {selectedTransformation && selectedTransformation.type === "to-iri" && (
          <div className={styles.indent}>
            <HintWrapper hint="This prefix will be prepended to all values in this column.">
              <TextField
                label="Prefix"
                value={selectedTransformation.data.iriPrefix}
                onChange={(event) =>
                  onTransformationChange({
                    ...selectedTransformation,
                    data: { iriPrefix: event.target.value },
                    KeepOriginalValueOptions: undefined
                  })
                }
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </HintWrapper>
          </div>
        )}
      </div>
    );
  } else {
    const noOtherColumns = transformationConfig.columnConfiguration.length <= 1;
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
              value={selectedTransformation?.label || ""}
              onChange={(event) => {
                if (event.target.value === "") return onTransformationChange(undefined);
                if (event.target.value === "to-iri")
                  return onTransformationChange({
                    label: "to-iri",
                    type: "to-iri",
                    data: { iriPrefix: config.defaultBaseIri },
                    KeepOriginalValueOptions: undefined
                  });
                const selectedTransformation = config.refinementOptions.find((ref) => ref.label === event.target.value);
                if (selectedTransformation) {
                  //@phil 128 here we do the single, double and single param - haal de boolean uit selectedTransformation en geef mee aan de transformatie
                  if (selectedTransformation.type === "single") {
                    onTransformationChange({
                      label: selectedTransformation.label,
                      type: "single",
                      KeepOriginalValueOptions: selectedTransformation.keepOriginalValue || undefined
                    });
                  } else if (selectedTransformation.type === "double-column") {
                    onTransformationChange({
                      label: selectedTransformation.label,
                      type: "double-column",
                      data: {
                        secondColumnIdx:
                          // Don't do transformations with the same column
                          selectedColumn === 0 ? 1 : 0,
                      },
                      KeepOriginalValueOptions: selectedTransformation.keepOriginalValue || undefined
                    });
                  } else if (selectedTransformation.type === "single-param") {
                    onTransformationChange({
                      label: selectedTransformation.label,
                      type: "single-param",
                      data: { iriPrefix: config.defaultBaseIri },
                      KeepOriginalValueOptions: selectedTransformation.keepOriginalValue || undefined
                    });
                  }
                }
              }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="to-iri">IRI Prefix transformation</MenuItem>
              {config.refinementOptions.map((refinementConfig) => (
                <MenuItem
                  key={refinementConfig.label}
                  value={refinementConfig.label}
                  disabled={refinementConfig.type === "double-column" && noOtherColumns}
                >
                  {refinementConfig.label}
                  {refinementConfig.type === "double-column" && noOtherColumns && (
                    <Typography variant="caption" className={styles.duplicateWarning}>
                      Not enough columns are available
                    </Typography>
                  )}
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
        {selectedTransformation && selectedTransformation.type === "to-iri" && (
          <div className={styles.indent}>
            <HintWrapper hint="This prefix will be prepended to all values in this column.">
              <TextField
                label="Prefix"
                value={selectedTransformation.data.iriPrefix}
                onChange={(event) =>
                  onTransformationChange({
                    ...selectedTransformation,
                    data: { iriPrefix: event.target.value.trim() },
                    KeepOriginalValueOptions: selectedTransformation.KeepOriginalValueOptions || undefined
                  })
                }
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </HintWrapper>
          </div>
        )}
        {selectedTransformation && selectedTransformation.type === "double-column" && (
          <div className={styles.indent}>
            <HintWrapper hint="Select another column to perform this transformation with.">
              <FormControl className={styles.selector}>
                <InputLabel shrink>Second column</InputLabel>
                <Select
                  label="Prefix"
                  value={selectedTransformation.data.secondColumnIdx}
                  onChange={(event) =>
                    onTransformationChange({
                      ...selectedTransformation,
                      data: { secondColumnIdx: event.target.value as number },
                      KeepOriginalValueOptions: selectedTransformation.KeepOriginalValueOptions || undefined
                    })
                  }
                >
                  {transformationConfig.columnConfiguration.map((config, idx) => (
                    <MenuItem
                      key={config.columnName}
                      value={idx}
                      disabled={idx === transformationConfig.key || idx === selectedColumn}
                    >
                      {config.columnName}
                      {idx === selectedColumn && (
                        <Typography variant="caption" className={styles.duplicateWarning}>
                          This column is currently selected
                        </Typography>
                      )}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </HintWrapper>
          </div>
        )}
        {selectedTransformation && selectedTransformation.type === "single-param" && (
          <div className={styles.indent}>
            <HintWrapper hint="Provide the parameter for the refinement.">
              <TextField
                label="Prefix"
                value={selectedTransformation.data.iriPrefix}
                onChange={(event) =>
                  onTransformationChange({
                    ...selectedTransformation,
                    data: { iriPrefix: event.target.value.trim() },
                    KeepOriginalValueOptions: selectedTransformation.KeepOriginalValueOptions || undefined
                  })
                }
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
