import * as React from "react";

import { useRecoilState, useRecoilValue } from "recoil";
import { transformationConfigState, prefixState } from "../../state";

import { getPrefixed, getPrefixInfoFromPrefixedValue } from "@triply/utils/lib/prefixUtils";

import { Autocomplete } from "@mui/material";
import { Typography, TextField } from "@mui/material";
import HintWrapper from "../../components/HintWrapper";

import * as styles from "./style.scss";
import { AutocompleteSuggestion } from "../../Definitions";
import { wizardAppConfig } from "../../config";

interface Props {}

const ResourceClassField: React.FC<Props> = ({}) => {
  const [transformationConfig, setTransformationConfig] = useRecoilState(transformationConfigState);
  const prefixes = useRecoilValue(prefixState);
  //   Create an intermediate value here, to stop it from re-rendering
  const [classValue, setClassValue] = React.useState<string>(transformationConfig.resourceClass);
  const [autocompleteError, setAutocompleteError] = React.useState<string | undefined>();
  const [autocompleteSuggestions, setAutocompleteSuggestions] = React.useState<AutocompleteSuggestion[]>([]);

  const updateClassValue = (newClassValue: string) => {
    setClassValue(newClassValue);
    confirmClassUri(newClassValue);
  };

  const confirmClassUri = (newClassValue: string) => {
    setTransformationConfig((state) => {
      return {
        ...state,
        resourceClass:
          newClassValue.length > 0 ? newClassValue.trim() : "http://www.w3.org/2000/01/rdf-schema#Resource",
      };
    });
  };
  // Async call for results effect
  React.useEffect(() => {
    const asyncCall = async () => {
      setAutocompleteError(undefined);
      try {
        const results = await wizardAppConfig.getClassSuggestions(classValue || "Resource");
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
  }, [transformationConfig, classValue]);

  return (
    <Autocomplete
      freeSolo
      options={autocompleteSuggestions}
      className={styles.baseIriField}
      value={classValue}
      renderOption={(_props, option: AutocompleteSuggestion) => {
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
              <Typography dangerouslySetInnerHTML={{ __html: description }} variant="caption" className={styles.hint} />
            )}
          </div>
        );
      }}
      blurOnSelect
      getOptionLabel={(value: any) => (typeof value === "string" ? value : value.iri)}
      onChange={(event, newValue: AutocompleteSuggestion | null) => {
        if (!newValue) return;
        if (typeof newValue === "string") {
          updateClassValue(newValue);
        } else if ("iri" in newValue) {
          updateClassValue(newValue.iri);
        } else {
          updateClassValue(newValue.value);
        }
      }}
      disableClearable
      renderInput={(props) => (
        <HintWrapper hint="The resource class URI is used to describe the type of objects in each row">
          <TextField
            {...props}
            InputLabelProps={{
              shrink: true,
            }}
            value={classValue}
            helperText={autocompleteError || getPrefixed(classValue, prefixes) || classValue || ""}
            error={!!autocompleteError}
            onChange={(event) => {
              const prefixInfo = getPrefixInfoFromPrefixedValue(event.currentTarget.value, prefixes);
              if (prefixInfo.prefixLabel) {
                updateClassValue(`${prefixInfo.iri}${prefixInfo.localName}`);
              } else {
                updateClassValue(event.currentTarget.value);
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
