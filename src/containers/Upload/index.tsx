import React, { ChangeEventHandler } from "react";
import styles from "./style.scss";
import { Button, Box, Typography } from "@material-ui/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Papa from "papaparse";
import { useHistory } from "react-router-dom";
import { useRecoilState } from "recoil";
import { sourceState, matrixState, transformationConfigState } from "state";
import { SourceFileToMatrix } from "Definitions";
interface Props {}
export const Step = 1;
const fileToMatrix: SourceFileToMatrix = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(file, {
      error: (e) => {
        reject(e);
      },
      worker: true,
      complete: (results) => {
        resolve(results.data);
      },
      skipEmptyLines: "greedy",
    });
  });
};
const Upload: React.FC<Props> = ({}) => {
  const history = useHistory();
  const [error, setError] = React.useState<String>();
  const [, setSource] = useRecoilState(sourceState);
  const [parsedSource, setParsedSource] = useRecoilState(matrixState);
  const [, setTransformationConfig] = useRecoilState(transformationConfigState);
  const handleNewFile: ChangeEventHandler<HTMLInputElement> = (event) => {
    if (event.target.files && event.target.files.length === 1) {
      const sourceFile = event.target.files[0];
      setSource(sourceFile);
      setTransformationConfig((state) => {
        return { ...state, sourceFileName: sourceFile.name };
      });
      setError(undefined);
      fileToMatrix(event.target.files[0])
        .then((matrix) => {
          setParsedSource(matrix);
          history.push(`/${Step + 1}`);
        })
        .catch((e) => {
          setError(e.message);
        });
    } else {
      setError(
        event.target.files && event.target.files.length > 0 ? "You can only upload one file" : "No files selected"
      );
    }
  };
  return (
    <>
      <div className={styles.button}>
        <input id="csv-upload" type="file" className={styles.input} onChange={handleNewFile} accept="text/csv" />
        <label htmlFor="csv-upload">
          <Button component="span" variant="contained" startIcon={<FontAwesomeIcon icon="upload" />}>
            Load your CSV File
          </Button>
          {error && <Typography color="error">No file selected</Typography>}
        </label>
      </div>
      <Box>
        <Button disabled>Back</Button>
        <Button
          variant="contained"
          color="primary"
          disabled={!parsedSource}
          onClick={() => history.push(`/${Step + 1}`)}
        >
          Next
        </Button>
      </Box>
    </>
  );
};
export default Upload;
