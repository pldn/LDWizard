import React from "react";
import styles from "./style.scss";
import { Alert, AlertTitle, Button, Box, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Papa from "papaparse";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";
import { sourceState, matrixState, transformationConfigState } from "../../state/index.ts";
import config from "../../config/index.ts";

const exampleFile = config.exampleCsv
  ? new File([new Blob([config.exampleCsv], { type: "text/csv" })], "example.csv")
  : undefined;

interface Props { }
export const Step = 1;
const parseCSV: (input: File) => Promise<Papa.ParseResult<string[]>> = (input) => {
  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(input, {
      error: (e) => {
        reject(e);
      },
      worker: true,
      complete: (results) => {
        resolve(results);
      },
      skipEmptyLines: "greedy",
    });
  });
};
const Upload: React.FC<Props> = ({ }) => {
  const navigate = useNavigate();
  const [error, setError] = React.useState<string>();
  const [parsedSource, setParsedSource] = useRecoilState(matrixState);
  const [source, setSource] = useRecoilState(sourceState);
  const setTransformationConfig = useSetRecoilState(transformationConfigState);
  const sourceText =
    (source && (typeof source === "string" ? "Input selected" : `Current file: ${source.name}`)) || "No file selected";
  const handleCsvParse = (sourceFile: File) => {
    setSource(sourceFile);
    setTransformationConfig((state) => {
      return { ...state, sourceFileName: sourceFile.name };
    });

    const validateCSV: (data: string[][]) => boolean = (data) => {
      const numColumns = data[0].filter(column => column !== "").length
      for (let i = 1; i < data.length; i++) {
        return data[i].length > numColumns ? false : true;
      }
    };

    setError(undefined);
    parseCSV(sourceFile)
      .then((parseResults) => {
        const parsedData = parseResults.data;
        if (validateCSV(parsedData)) {
          validateCSV(parsedData)
          setParsedSource(parseResults.data);
          setTransformationConfig((state) => {
            return {
              ...state,
              key: undefined,
              csvProps: {
                delimiter: parseResults.meta.delimiter,
              },
              columnConfiguration: parseResults.data[0].map((header) => {
                return { columnName: header };
              }),
            };
          });
          navigate(`/${Step + 1}`);
        }
        else {
          setError("Invalid CSV file format. The file includes column(s) without a header.")
        }
      })
      .catch((e) => {
        setError(e.message);
      });
  };

  // Drag and drop event handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length === 1) {
      const sourceFile = droppedFiles[0];
      handleCsvParse(sourceFile);
    } else {
      setError("You can only drop one file");
    }
  };

  return (
    <><div
      className={styles.button}
      onDragOver={(e) => handleDragOver(e)}
      onDrop={(e) => handleDrop(e)}>
        <div className={styles.dragDropIndicator}>
          <Typography variant="body1" color="primary">
            Drag and Drop Here
          </Typography>
        </div>
      <Typography variant="body1" gutterBottom>
        {sourceText}
      </Typography>
      <input
        id="csv-upload"
        type="file"
        className={styles.input}
        onChange={(event) => {
          if (event.target.files && event.target.files.length === 1) {
            const sourceFile = event.target.files[0];
            handleCsvParse(sourceFile);
          } else {
            setError(
              event.target.files && event.target.files.length > 0
                ? "You can only upload one file"
                : "No files selected"
            );
          }
        }}
        accept="text/csv"/>
      <label htmlFor="csv-upload">
        <Button component="span" variant="contained" style={{textTransform: 'none'}} startIcon={<FontAwesomeIcon icon="upload" />}>
          Load Your CSV File
        </Button>
        {error && <Typography color="error">No file selected</Typography>}
      </label>
      {exampleFile && (
        <Typography style={{ paddingTop: "1rem" }}>
          Or try it with an{" "}
          <a
            style={{ cursor: "pointer" }}
            onClick={() => {
              handleCsvParse(exampleFile);
            }}>
            example CSV file
          </a>
        </Typography>
      )}
    </div>
      <Box>
        <Button disabled className={styles.actionButtons} style={{textTransform: 'none'}}>
          Back
        </Button>
        <Button
          className={styles.actionButtons}
          variant="contained"
          color="primary"
          disabled={!parsedSource}
          onClick={() => navigate(`/${Step + 1}`)}
          style={{textTransform: 'none'}}
        >
          Next
        </Button>
        <Button
          className={styles.actionButtons}
          disabled={!parsedSource}
          onClick={() => {
            if (confirm("All progress will be lost, are you sure?")) {
              window.location.replace("");
            }
          }}
          style={{textTransform: 'none'}}
        >
          Restart
        </Button>
      </Box>
    </>
  );
};

export default Upload;
