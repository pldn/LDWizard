import * as React from "react";

import { useRecoilState, useRecoilValue } from "recoil";
import { transformationConfigState, prefixState } from "../../state";

import { getPrefixed, getPrefixInfoFromPrefixedValue } from "@triply/utils/lib/prefixUtils";

import { Autocomplete } from "@material-ui/lab";
import { Typography, TextField } from "@material-ui/core";
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

  const confirmClassUri = () => {
    setTransformationConfig((state) => {
      return {
        ...state,
        resourceClass: classValue.length > 0 ? classValue.trim() : "http://www.w3.org/2000/01/rdf-schema#Resource",
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
        setAutocompleteError(e.message);
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
              <Typography dangerouslySetInnerHTML={{ __html: description }} variant="caption" className={styles.hint} />
            )}
          </div>
        );
      }}
      getOptionLabel={(value: any) => (typeof value === "string" ? value : value.iri)}
      onChange={(_event, newValue: AutocompleteSuggestion | null) => {
        if (!newValue) return;
        if (typeof newValue === "string") {
          setClassValue(newValue);
        } else if ("iri" in newValue) {
          setClassValue(newValue.iri);
        } else {
          setClassValue(newValue.value);
        }
        confirmClassUri();
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
                setClassValue(`${prefixInfo.iri}${prefixInfo.localName}`);
              } else {
                setClassValue(event.currentTarget.value);
              }
            }}
            label={"Resource class IRI"}
            fullWidth
            type="url"
            inputMode="url"
            onBlur={confirmClassUri}
            placeholder="http://www.w3.org/2000/01/rdf-schema#Resource"
          />
        </HintWrapper>
      )}
    />
  );
};
export default ResourceClassField;
