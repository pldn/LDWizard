import React from "react";
import styles from "./style.scss";
import { Button, Box, Typography, Stack, CircularProgress } from "@mui/material";
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
  const [loading, setLoading] = React.useState(false);

  const setTransformationConfig = useSetRecoilState(transformationConfigState);

  const sourceText =
    (source && (typeof source === "string" ? "Input selected" : `Current file: ${source.name}`)) || "No file selected";
  const handleCsvParse = (sourceFile: File) => {
    setLoading(true);
    setSource(sourceFile);
    setTransformationConfig((state) => {
      return { ...state, sourceFileName: sourceFile.name };
    });
    setError(undefined);
    parseCSV(sourceFile)
      .then((parseResults) => {
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
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  };
  return (
    <>    {loading ? (
      <div className={styles.loading}>
        <Stack alignItems="center">
          <Typography variant="body1" gutterBottom>
            Loading your CVS file
          </Typography>
          <CircularProgress />
        </Stack>

      </div>
    ) : (
      <div className={styles.button}>
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
          accept="text/csv"
        />
        <label htmlFor="csv-upload">
          <Button component="span" variant="contained" startIcon={<FontAwesomeIcon icon="upload" />}>
            Load your CSV File
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
              }}
            >
              example CSV file
            </a>
          </Typography>
        )}
      </div>
    )}
      <Box>
        <Button disabled className={styles.actionButtons}>
          Back
        </Button>
        <Button
          className={styles.actionButtons}
          variant="contained"
          color="primary"
          disabled={!parsedSource}
          onClick={() => navigate(`/${Step + 1}`)}
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
        >
          Restart
        </Button>
      </Box>
    </>
  );
};
export default Upload;
