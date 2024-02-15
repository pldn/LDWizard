import * as React from "react";

import { useRecoilState, useRecoilValue } from "recoil";
import { transformationConfigState, prefixState } from "../../state/index.ts";
import validator from "validator";


import { Autocomplete } from "@mui/material";
import { Typography, TextField } from "@mui/material";
import HintWrapper from "../../components/HintWrapper/index.tsx";

import styles from "./style.scss";
import { AutocompleteSuggestion } from "../../Definitions.ts";
import { wizardAppConfig } from "../../config/index.ts";
import { getPrefixInfoFromPrefixedValue, getPrefixed } from "@triply/utils/prefixUtils.js";

interface Props {
  isValidUrl: boolean,
  setIsValidUrl: React.Dispatch<React.SetStateAction<boolean>>
}

const ResourceClassField: React.FC<Props> = ({ isValidUrl, setIsValidUrl }) => {
  const [transformationConfig, setTransformationConfig] = useRecoilState(transformationConfigState);
  const prefixes = useRecoilValue(prefixState);
  
  //   Create an intermediate value here, to stop it from re-rendering
  const [selectedClassValue, setSelectedClassValue] = React.useState<string | undefined>(undefined);
  const [writtenClassValue, setWrittenClassValue] = React.useState<string>(transformationConfig.resourceClass);
  const [autocompleteError, setAutocompleteError] = React.useState<string | undefined>();
  const [autocompleteSuggestions, setAutocompleteSuggestions] = React.useState<AutocompleteSuggestion[]>([]);
  
  // Async call for results effect
  React.useEffect(() => {
    const asyncCall = async () => {
      setAutocompleteError(undefined);
     try {
        const results = await wizardAppConfig.getClassSuggestions(writtenClassValue || "Resource");
        setAutocompleteSuggestions(results);
      } catch (e) {
        console.error(e);
        if (e instanceof Error) {
          setAutocompleteError(e.message);
        } else {
          setAutocompleteError("Unknown error");
        }
        setAutocompleteSuggestions([]);
      }
    };
    asyncCall();
  }, [transformationConfig, writtenClassValue]);

  // Update the global configuration when the user selects a class
  React.useEffect(() => {
    setTransformationConfig((state) => {
      return {
        ...state,
        resourceClass:
          selectedClassValue || writtenClassValue.trim() || "http://www.w3.org/2000/01/rdf-schema#Resource",
      };
    });
  }, [selectedClassValue, setTransformationConfig, writtenClassValue]);
  return (
    <Autocomplete
      freeSolo
      options={autocompleteSuggestions}
      className={styles.baseIriField}
      value={selectedClassValue || writtenClassValue}
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
            <Typography sx={{ mx: 1 }}>{getPrefixed(titleString, prefixes) || titleString}</Typography>
            {description && (
              <Typography dangerouslySetInnerHTML={{ __html: description }} variant="caption" className={styles.hint} />
            )}
          </li>
        );
      }}
      blurOnSelect
      getOptionLabel={(value: any) => (typeof value === "string" ? value : value.iri)}
      onChange={(event, newValue: AutocompleteSuggestion | null) => {
        if (!newValue) return;
        let newValueString: string;
        if (typeof newValue === "string") {
          newValueString = newValue;
        } else if ("iri" in newValue) {
          newValueString = newValue.iri;
        } else {
          newValueString = newValue.value;
        }
        setSelectedClassValue(newValueString);
        setIsValidUrl(validator.isURL(newValueString))
      }}
      disableClearable
      renderInput={(props) => (
        <HintWrapper hint="The resource class URI is used to describe the type of objects in each row">
          <TextField
            {...props}
            InputLabelProps={{
              shrink: true,
            }}
            value={writtenClassValue}
            helperText={isValidUrl ? "" : 'Invalid URL'}
            error={!!autocompleteError || !isValidUrl}
            onChange={(event) => {
              setSelectedClassValue(undefined);
              setIsValidUrl(validator.isURL(event.currentTarget.value))
              const prefixInfo = getPrefixInfoFromPrefixedValue(event.currentTarget.value, prefixes)
              if (prefixInfo.prefixLabel) {
                setWrittenClassValue(`${prefixInfo.iri}${prefixInfo.localName}`);
              } else {
                setWrittenClassValue(event.currentTarget.value);
              }
            }}
            label={"Resource class IRI"}
            fullWidth
            type="url"
            inputMode="url"
            placeholder="http://www.w3.org/2000/01/rdf-schema#Resource"
          />
        </HintWrapper>
      )}
    />
  );
};
export default ResourceClassField;
