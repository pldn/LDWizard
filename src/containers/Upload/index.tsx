import React from "react";
import styles from "./style.scss";
import { Alert, AlertTitle, Button, Box, Typography, Stack, CircularProgress} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Papa from "papaparse";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";
import { sourceState, matrixState, transformationConfigState } from "../../state/index.ts";
import config from "../../config/index.ts";
import * as chardet from 'chardet';

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

function hasUtf8Bom(buffer: Uint8Array): boolean {
  return buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF;
}

function detectAndDecodeToUTF8(file: File): Promise<File | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function(event) {
      if (event.target) {
        const buffer = new Uint8Array(event.target.result as ArrayBuffer);

        // Check for Byte Order Marks (BOM) indicating UTF-8
        if (hasUtf8Bom(buffer)) {
          console.log('File is already in UTF-8 encoding (BOM detected). Skipping decoding.');
          resolve(null);
          return;
        }

        // Detecting the encoding
        const detectedEncoding = chardet.detect(buffer);
        console.log('Detected Encoding:', detectedEncoding);

        // Convert to UTF-8 using detected encoding
        const textDecoder = new TextDecoder(detectedEncoding);
        const utf8Decoded = textDecoder.decode(buffer);
        console.log('UTF-8 Decoded Content:', utf8Decoded);

        // Create a Blob with the UTF-8 content
        const blob = new Blob([utf8Decoded], { type: 'text/plain' });

        // Create a File object from the Blob
        const fileObject = new File([blob], 'decoded_utf8.txt', { type: 'text/plain' });

        resolve(fileObject);
      }
    };

    reader.onerror = reject;

    reader.readAsArrayBuffer(file);
  });
}

const parseCSV: (input: File) => Promise<Papa.ParseResult<string[]>> = async (input) => {
  /**
   * NOTE: Detecting the encoding of a file automatically can be a bit complex, as there's no foolproof way to detect the encoding with absolute certainty. However, libraries like chardet can help in making an educated guess about the encoding.
   * The accuracy of automatic encoding detection can vary, so it might not always be 100% reliable.
   */
  input = await detectAndDecodeToUTF8(input)

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