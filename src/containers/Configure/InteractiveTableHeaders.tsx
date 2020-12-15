import * as React from "react";
import {
  TableHead,
  TableRow,
  TableCell,
  Typography,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  ButtonBase,
  TextField,
  Checkbox,
  FormControlLabel,
} from "@material-ui/core";
import * as styles from "./style.scss";
import { useRecoilState, useRecoilValue } from "recoil";
import { transformationConfigState, prefixState } from "../../state";
import { Autocomplete } from "@material-ui/lab";
import { getPrefixed, getPrefixInfoFromPrefixedValue } from "@triply/utils/lib/prefixUtils";
import getClassName from "classnames";
import HintWrapper from "../../components/HintWrapper";
import { AutocompleteSuggestion } from "../../Definitions";
import { wizardAppConfig } from "../../config";
import { cleanCsvValue, getBasePredicateIri } from "../../utils/helpers";

interface Props {}
const TableHeaders: React.FC<Props> = ({}) => {
  const transformationConfig = useRecoilValue(transformationConfigState);
  const [selectedHeader, setSelectedHeader] = React.useState<number | undefined>();
  const prefixes = useRecoilValue(prefixState);
  return (
    <>
      <TableHead>
        <TableRow>
          {transformationConfig.columnConfiguration.map((columnConfig, idx) => {
            const propertyIRI = transformationConfig.columnConfiguration[idx].propertyIri;
            const fullUri =
              propertyIRI ??
              `${getBasePredicateIri(transformationConfig.baseIri.toString())}${cleanCsvValue(
                columnConfig.columnName
              )}`;
            const shortUri = propertyIRI !== undefined ? getPrefixed(propertyIRI, prefixes) || propertyIRI : "";
            const isKeyColumn = idx === transformationConfig.key;
            return (
              <TableCell
                key={`${columnConfig.columnName}${idx}`}
                className={getClassName(styles.tableHeader, { [styles.disabled]: isKeyColumn })}
                // Implement the disable here, I still want to be able to use tooltip
                onClick={isKeyColumn ? undefined : () => setSelectedHeader(idx)}
                // Replace Default tableCell with ButtonBase to create ripple effects on click
                component={(props) => (
                  <Tooltip
                    PopperProps={{ className: styles.tooltip }}
                    title={isKeyColumn ? "This column will be used to create identifiers" : fullUri}
                  >
                    <ButtonBase {...props} component="th" />
                  </Tooltip>
                )}
              >
                <strong>{columnConfig.columnName + (isKeyColumn ? " (Key)" : "")}</strong>
                <br />
                {shortUri ? <Typography variant="caption">{shortUri}</Typography> : <br />}
              </TableCell>
            );
          })}
        </TableRow>
      </TableHead>
      <ColumnConfigDialog
        key={selectedHeader}
        selectedHeader={selectedHeader}
        onClose={() => setSelectedHeader(undefined)}
      />
    </>
  );
};
interface AutoCompleteProps {
  selectedHeader: number | undefined;
  onClose: () => void;
}
const ColumnConfigDialog: React.FC<AutoCompleteProps> = ({ selectedHeader, onClose }) => {
  const [transformationConfig, setTransformationConfig] = useRecoilState(transformationConfigState);
  const prefixes = useRecoilValue(prefixState);

  const [autocompleteError, setAutocompleteError] = React.useState<string | undefined>();
  const [autocompleteSuggestions, setAutocompleteSuggestions] = React.useState<AutocompleteSuggestion[]>([]);
  const selectedColumn =
    (selectedHeader !== undefined && transformationConfig.columnConfiguration[selectedHeader]) || undefined;
  const [propertyIri, setPropertyIri] = React.useState(selectedColumn?.propertyIri || "");
  const [applyIriTransformation, setApplyIriTransformation] = React.useState(selectedColumn?.iriPrefix !== undefined);
  const [iriPrefix, setIriPrefix] = React.useState(selectedColumn?.iriPrefix ?? wizardAppConfig.defaultBaseIri);

  // Async call for results effect
  React.useEffect(() => {
    if (!selectedColumn) return;
    const searchTerm = propertyIri.length === 0 ? selectedColumn.columnName : propertyIri;
    const getAutocompleteSuggestions = async () => {
      setAutocompleteError(undefined);
      try {
        const results = await wizardAppConfig.getPropertySuggestions(searchTerm);
        setAutocompleteSuggestions(results);
      } catch (e) {
        console.error(e);
        setAutocompleteError(e.message);
        setAutocompleteSuggestions([]);
      }
    };
    getAutocompleteSuggestions();
  }, [selectedColumn, propertyIri]);

  const confirmIri = () => {
    setTransformationConfig((state) => {
      if (selectedHeader === undefined) return state;
      const columnConfiguration = [...state.columnConfiguration];
      // Objects in recoil arrays are read-only
      const processedPropertyIri = propertyIri.length > 0 ? propertyIri : undefined;
      const processedIriPrefix = applyIriTransformation ? iriPrefix : undefined;

      columnConfiguration[selectedHeader] = {
        columnName: columnConfiguration[selectedHeader].columnName,
        propertyIri: processedPropertyIri,
        iriPrefix: processedIriPrefix,
      };
      return {
        ...state,
        columnConfiguration: columnConfiguration,
      };
    });
    // Close the dialog
    onClose();
  };
  return (
    <Dialog open={selectedHeader !== undefined} onClose={onClose} fullWidth maxWidth="md">
      <form onSubmit={confirmIri}>
        <DialogTitle>
          Column configuration (
          {selectedHeader !== undefined && transformationConfig.columnConfiguration[selectedHeader].columnName})
        </DialogTitle>
        <DialogContent>
          {selectedHeader !== undefined && (
            <>
              <div className={styles.columnConfigSection}>
                <Typography variant="subtitle1">Property configuration</Typography>
                <Autocomplete
                  freeSolo
                  options={autocompleteSuggestions}
                  value={propertyIri}
                  renderOption={(option: AutocompleteSuggestion) => {
                    let titleString: string;
                    let description: string | undefined;
                    if (typeof option === "string") {
                      titleString = option;
                    } else if ("iri" in option) {
                      titleString = option.iri;
                      description = option.description;
                    } else {
                      titleString = option.value;
                    }
                    return (
                      <div>
                        <Typography>{getPrefixed(titleString, prefixes) || titleString}</Typography>
                        {description && (
                          <Typography
                            dangerouslySetInnerHTML={{
                              __html: description,
                            }}
                            variant="caption"
                            className={styles.hint}
                          />
                        )}
                      </div>
                    );
                  }}
                  getOptionLabel={(value: any) =>
                    typeof value === "string" ? value : getPrefixed(value.iri, prefixes) || value.iri
                  }
                  onChange={(_event, newValue: AutocompleteSuggestion | null) => {
                    if (!newValue) return;
                    if (typeof newValue === "string") {
                      setPropertyIri(newValue);
                    } else if ("iri" in newValue) {
                      setPropertyIri(newValue.iri);
                    } else {
                      setPropertyIri(newValue.value);
                    }
                  }}
                  disableClearable
                  openOnFocus
                  renderInput={(props) => (
                    <HintWrapper hint="This IRI will define the relation between the key column and this column">
                      <TextField
                        {...props}
                        autoFocus
                        label="property URI"
                        error={!!autocompleteError}
                        helperText={autocompleteError || getPrefixed(propertyIri, prefixes)}
                        placeholder={`${getBasePredicateIri(transformationConfig.baseIri.toString())}${cleanCsvValue(
                          transformationConfig.columnConfiguration[selectedHeader].columnName
                        )}`}
                        InputLabelProps={{ shrink: true }}
                        type="url"
                        inputMode="url"
                        fullWidth
                        onChange={(event) => {
                          const prefixInfo = getPrefixInfoFromPrefixedValue(event.currentTarget.value, prefixes);
                          if (prefixInfo.prefixLabel) {
                            setPropertyIri(`${prefixInfo.iri}${prefixInfo.localName}`);
                          } else {
                            setPropertyIri(event.currentTarget.value);
                          }
                        }}
                      />
                    </HintWrapper>
                  )}
                />
              </div>
              <div className={styles.columnConfigSection}>
                <Typography variant="subtitle1">Value configuration</Typography>
                <HintWrapper
                  hint="When enabled, values in this column will be transformed to IRIs"
                  className={styles.hintOverride}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={applyIriTransformation}
                        onChange={(_input, checked) => setApplyIriTransformation(checked)}
                      />
                    }
                    label={<Typography variant="body2">Convert to IRI</Typography>}
                  />
                </HintWrapper>
                {applyIriTransformation && (
                  <div className={styles.indent}>
                    <HintWrapper hint="This prefix will be prepended to all values in this column.">
                      <TextField
                        label="Prefix"
                        value={iriPrefix || ""}
                        onChange={(event) => {
                          setIriPrefix(event.target.value);
                        }}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                    </HintWrapper>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button className={styles.actionButtons} variant="contained" color="primary" type="submit">
            Confirm
          </Button>
          <Button className={styles.actionButtons} onClick={onClose}>
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
export default TableHeaders;
