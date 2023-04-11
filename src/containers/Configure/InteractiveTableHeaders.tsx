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
  Autocomplete,
} from "@mui/material";
import styles from "./style.scss";
import { useRecoilState, useRecoilValue } from "recoil";
import { transformationConfigState, prefixState } from "../../state";
import { getPrefixed, getPrefixInfoFromPrefixedValue } from "@triply/utils/lib/prefixUtils";
import getClassName from "classnames";
import HintWrapper from "../../components/HintWrapper";
import { AutocompleteSuggestion } from "../../Definitions";
import { wizardAppConfig } from "../../config";
import { cleanCsvValue, getBasePredicateIri } from "../../utils/helpers";
import TransformationSelector from "./TransformationSelector";
import validator from "validator";

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
  const [selectedRefinement, setSelectedTransformation] = React.useState(selectedColumn?.columnRefinement);
  const [isValidUrl, setValidationState] = React.useState<boolean>()
  
  function showHelperText(){
    const result = autocompleteError || getPrefixed(propertyIri, prefixes) || propertyIri
    switch (isValidUrl) {
      case true:
        return
      case false:
        return "Invalid URL: " + `"`+result+ `"`
    }
  }
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
        setAutocompleteError(e instanceof Error ? e.message : "Unknown error");
        setAutocompleteSuggestions([]);
      }
    };
    getAutocompleteSuggestions();
  }, [selectedColumn, propertyIri]);

  const confirmIri = (e: React.FormEvent) => {
    e.preventDefault();
    setTransformationConfig((state) => {
      if (selectedHeader === undefined) return state;
      const columnConfiguration = [...state.columnConfiguration];
      // Objects in recoil arrays are read-only
      const processedPropertyIri = propertyIri.length > 0 ? propertyIri.trim() : undefined;
      columnConfiguration[selectedHeader] = {
        columnName: columnConfiguration[selectedHeader].columnName,
        propertyIri: processedPropertyIri,
        columnRefinement: selectedRefinement,
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
                  renderOption={(props, option: AutocompleteSuggestion) => {
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
                      <li {...props}>
                        <Typography sx={{ mr: 1 }}>{getPrefixed(titleString, prefixes) || titleString}</Typography>
                        {description && (
                          <Typography
                            dangerouslySetInnerHTML={{
                              __html: description,
                            }}
                            variant="caption"
                            className={styles.hint}
                          />
                        )}
                      </li>
                    );
                  }}
                  getOptionLabel={(value: any) =>
                    typeof value === "string" ? value : getPrefixed(value.iri, prefixes) || value.iri
                  }
                  onChange={(_event, newValue: AutocompleteSuggestion | null) => {
                    if (!newValue) return;
                    if (typeof newValue === "string") {
                      setPropertyIri(newValue);
                      setValidationState(true)
                    } else if ("iri" in newValue) {
                      setPropertyIri(newValue.iri);
                      setValidationState(true)
                    } else {
                      setPropertyIri(newValue.value);
                      setValidationState(true)
                    }
                  }}
                  disableClearable
                  openOnFocus
                  renderInput={(props) => (
                    <HintWrapper hint="This IRI will define the relation between the key column and this column">
                      <TextField
                        {...props}
                        autoFocus
                        label="Property URI"
                        error={!!autocompleteError || isValidUrl == false}
                        helperText={showHelperText()}
                        placeholder={`${getBasePredicateIri(transformationConfig.baseIri.toString())}${cleanCsvValue(
                          transformationConfig.columnConfiguration[selectedHeader].columnName
                        )}`}
                        InputLabelProps={{ shrink: true }}
                        type="url"
                        inputMode="url"
                        fullWidth
                        onChange={(event) => {
                          validator.isURL(event.currentTarget.value) == false ? setValidationState(false) : setValidationState(true)
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
              {selectedColumn && (
                <TransformationSelector
                  selectedColumn={selectedHeader}
                  selectedTransformation={selectedRefinement}
                  onTransformationChange={setSelectedTransformation}
                />
              )}
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
