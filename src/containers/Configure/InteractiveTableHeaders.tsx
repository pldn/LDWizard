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
import { transformationConfigState, prefixState } from "../../state/index.ts";
import { getPrefixed, getPrefixInfoFromPrefixedValue } from "@triply/utils/lib/prefixUtils.js";
import getClassName from "classnames";
import HintWrapper from "../../components/HintWrapper/index.tsx";
import { AutocompleteSuggestion, ShaclShapeMeta, ColumnConfiguration } from "../../Definitions.ts";
import { wizardAppConfig } from "../../config/index.ts";
import { cleanCsvValue, getBasePredicateIri } from "../../utils/helpers.ts";
import TransformationSelector from "./TransformationSelector.tsx";
import validator from "validator";
import { configColumnsToShaclColumns } from "../../utils/csvRowsToShaclRows.ts";

interface Props { shaclShapeMeta?: ShaclShapeMeta }
const TableHeaders: React.FC<Props> = ({ shaclShapeMeta }) => {
  const [transformationConfig, setTransformationConfig] = useRecoilState(transformationConfigState);
  const [selectedHeader, setSelectedHeader] = React.useState<ColumnConfiguration | undefined>();
  const prefixes = useRecoilValue(prefixState);
  const [activeDragOverColumn, setActiveDragOverColumn] = React.useState('')

  let columns = transformationConfig.columnConfiguration
   
  if (shaclShapeMeta) {
    columns = configColumnsToShaclColumns(columns, shaclShapeMeta, prefixes)
  }

  const dragStart = (columnConfig: ColumnConfiguration) => columnConfig.shaclColumn ? (event: any) => {
    event.dataTransfer.setData("application/ld-wizard", columnConfig.propertyIri);
    event.dataTransfer.effectAllowed = "move";
  } : undefined

  const dragOver = (columnConfig: ColumnConfiguration) => !columnConfig.shaclColumn ? (event: any) => {
    event.preventDefault();
    setActiveDragOverColumn(columnConfig.columnName)
    event.dataTransfer.dropEffect = "move";
  } : undefined


  const dragOut = (columnConfig: ColumnConfiguration) => !columnConfig.shaclColumn ? (event: any) => {
    setActiveDragOverColumn('')
  } : undefined

  

  const dropArea = (columnConfig: ColumnConfiguration) => !columnConfig.shaclColumn ? (event: any) => {
    event.preventDefault();
    const propertyIri = event.dataTransfer.getData("application/ld-wizard");
    setActiveDragOverColumn('')

    setTransformationConfig((state) => {
      const columnConfiguration = [...state.columnConfiguration];
      // Objects in recoil arrays are read-only
      const processedPropertyIri = propertyIri.length > 0 ? propertyIri.trim() : undefined;
      const index = state.columnConfiguration.indexOf(columnConfig)!
      columnConfiguration[index] = {
        ...selectedHeader,
        columnName: columnConfig.columnName,
        propertyIri: processedPropertyIri,
      }

      return {
        ...state,
        columnConfiguration: columnConfiguration,
      };
    });


  } : undefined
  return (
    <>
      <TableHead>
        <TableRow>
          {columns.map((columnConfig, idx) => {
            const propertyIRI = columnConfig.propertyIri;

            const fullUri =
              propertyIRI ??
              `${getBasePredicateIri(transformationConfig.baseIri.toString())}${cleanCsvValue(
                columnConfig.columnName
              )}`;
            const shortUri = propertyIRI !== undefined ? getPrefixed(propertyIRI, prefixes) || propertyIRI : "";
            const isKeyColumn = idx === transformationConfig.key;
            const disabled = isKeyColumn || columnConfig.disabled

            return (
              <TableCell
                onDragStart={dragStart(columnConfig)}
                draggable={columnConfig.shaclColumn}
                onDrop={dropArea(columnConfig)}
                onDragOver={dragOver(columnConfig)}
                onDragLeave={dragOut(columnConfig)}
                key={`${columnConfig.columnName}${idx}`}
                className={getClassName(styles.tableHeader, { [styles.disabled]: isKeyColumn, [styles.shaclColumn]: columnConfig.shaclColumn, [styles.draggingOver]: columnConfig.columnName === activeDragOverColumn })}
                // Implement the disable here, I still want to be able to use tooltip
                onClick={columnConfig.disabled ? undefined : () => setSelectedHeader(columnConfig)}
                // Replace Default tableCell with ButtonBase to create ripple effects on click
                component={disabled ? undefined : (props) => (
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
        key={JSON.stringify(selectedHeader)}
        selectedHeader={selectedHeader}
        onClose={() => setSelectedHeader(undefined)}
      />
    </>
  );
};
interface AutoCompleteProps {
  selectedHeader: ColumnConfiguration | undefined;
  onClose: () => void;
}
const ColumnConfigDialog: React.FC<AutoCompleteProps> = ({ selectedHeader, onClose }) => {
  const [transformationConfig, setTransformationConfig] = useRecoilState(transformationConfigState);
  const prefixes = useRecoilValue(prefixState);

  const [autocompleteError, setAutocompleteError] = React.useState<string | undefined>();
  const [autocompleteSuggestions, setAutocompleteSuggestions] = React.useState<AutocompleteSuggestion[]>([]);
  const selectedColumn = selectedHeader
  const [propertyIri, setPropertyIri] = React.useState(selectedColumn?.propertyIri || "");
  const [selectedRefinement, setSelectedTransformation] = React.useState(selectedColumn?.columnRefinement);
  const [isValidUrl, setIsValidUrl] = React.useState<boolean>(true)

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
      const index = state.columnConfiguration.indexOf(selectedHeader)
      columnConfiguration[index] = {
        ...selectedHeader,
        propertyIri: processedPropertyIri,
        columnRefinement: selectedRefinement,
      }
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
            {selectedHeader?.columnName})
        </DialogTitle>
        <DialogContent>
          {selectedHeader !== undefined && (
            <>
              <div className={styles.columnConfigSection}>
                <Typography variant="subtitle1">Property configuration</Typography>
                <Autocomplete
                  freeSolo
                  options={autocompleteSuggestions}
                  value={propertyIri || `${getBasePredicateIri(transformationConfig.baseIri.toString())}${cleanCsvValue(
                    selectedHeader.columnName
                  )}`}
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
                      setIsValidUrl(validator.isURL(newValue))
                    } else if ("iri" in newValue) {
                      setPropertyIri(newValue.iri);
                      setIsValidUrl(validator.isURL(newValue.iri))
                    } else {
                      setPropertyIri(newValue.value);
                      setIsValidUrl(validator.isURL(newValue.value))
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
                        error={!!autocompleteError || !isValidUrl}
                        helperText={isValidUrl ? "" : 'Invalid URL'}
                        placeholder={`${getBasePredicateIri(transformationConfig.baseIri.toString())}${cleanCsvValue(
                          selectedHeader.columnName
                        )}`}
                        InputLabelProps={{ shrink: true }}
                        type="url"
                        inputMode="url"
                        fullWidth
                        onChange={(event) => {
                          setIsValidUrl(validator.isURL(event.currentTarget.value))
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
          <Button disabled={!isValidUrl} className={styles.actionButtons} style={{textTransform: 'none'}} variant="contained" color="primary" type="submit">
            Confirm
          </Button>
          <Button className={styles.actionButtons} onClick={onClose} style={{textTransform: 'none'}}>
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
export default TableHeaders;
