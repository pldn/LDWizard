import React from "react";
import styles from "./style.scss";
import { Alert, AlertTitle, Button, Box, Typography, Stack, CircularProgress} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Papa from "papaparse";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";
import { sourceState, matrixState, transformationConfigState } from "../../state/index.ts";
import config from "../../config/index.ts";
import lodash from "lodash";

class EmptySpaceInRowError extends Error {
  constructor(message) {
    super(message);
    this.name = "EmptySpaceInRowError";
  }
}

class EmptySpaceInColumnError extends Error {
  constructor(message) {
    super(message);
    this.name = "EmptySpaceInColumnError";
  }
}


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

    const validateCSV: (data: string[][]) => boolean = (data) => {
      data[0]
      const numColumns = data[0].filter(column =>
        column).length
      for (let i = 1; i < data.length; i++) {
        if (data[i].includes("") || data[i].includes(" ")){
          throw new EmptySpaceInRowError("Invalid CSV file format. The file includes row(s) without a value.")
        }
        if (data[i].length > numColumns){
          throw new EmptySpaceInColumnError("Invalid CSV file format. The file includes column(s) without a value.")
        }
      }
      return true
    };

    setError(undefined);
    parseCSV(sourceFile)
      .then((parseResults) => {
        try {
          if (validateCSV(parseResults.data)) setError(undefined);
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
          setLoading(false);
          navigate(`/${Step + 1}`);
        }
        catch(e){
          console.error(e, typeof e)
          if(e instanceof EmptySpaceInRowError){
            setLoading(false);
            setError("Invalid CSV file format. The file includes row(s) without a value.")
          }
          if(e instanceof EmptySpaceInColumnError){
            setLoading(false);
            setError("Invalid CSV file format. The file includes column(s) without a header.")
          }
        }
      })
      .catch((e) => {
        setLoading(false);
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
    <> {loading ? (
      <div className={styles.loading}>
        <Stack alignItems="center">
          <Typography variant="body1" gutterBottom>
            Loading your CVS file
          </Typography>
          <CircularProgress />
        </Stack>

      </div>
    ) : (
      <div className={styles.button}
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
            }
            else {
              if (event.target.files && event.target.files.length > 0) {
                setError("You can only upload one file")
              }
              else if (event.target.files && event.target.files.length <= 0) {
                setError("No files selected")
              }
              else {
                setError("Invalid CSV file format")
              }
            }
          }}
          accept="text/csv"
        />
        <label htmlFor="csv-upload">
          <Box textAlign='center'>
            <Button component="span" variant="contained" style={{textTransform: 'none'}} startIcon={<FontAwesomeIcon icon="upload" />}>
              Load Your CSV File
            </Button>
          </Box>
          {error && <Alert severity="error"><AlertTitle>Error</AlertTitle>{error}</Alert>}
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
    </>
  );
};
export default Upload;