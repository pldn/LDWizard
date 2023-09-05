import React from "react";
import styles from "./style.scss";
import { Container, Button, Card, CardActions, CardContent, CardHeader, Typography } from "@mui/material";
import FontAwesomeIcon from "../../components/FontAwesomeIcon/index.tsx";
import SplitButton from "../../components/SplitButton/index.tsx";
import { Matrix, TransformationType } from "../../Definitions.ts";
import { useRecoilValue } from "recoil";
import { sourceState, transformationConfigState } from "../../state/index.ts";
import { wizardAppConfig } from "../../config/index.ts";
import { unparse as serializeCsv } from "papaparse";
import { getFileBaseName } from "../../utils/helpers.ts";
interface Props {
  transformationResult: string;
  refinedCsv: Matrix | undefined;
}
const DownloadResults: React.FC<Props> = ({ transformationResult, refinedCsv }) => {
  const downloadRef = React.useRef<HTMLAnchorElement>(null);
  const source = useRecoilValue(sourceState);
  
  const transformationConfig = useRecoilValue(transformationConfigState);


  const downloadFile = (content: File | string | undefined, defaultName: string, mediaType: string) => {
    if (!downloadRef.current || !content) return;
    if (typeof content === "string") {
      const blob = new Blob([content], { type: mediaType });
      downloadRef.current.href = URL.createObjectURL(blob);
      downloadRef.current.download = defaultName;
    } else {
      downloadRef.current.href = URL.createObjectURL(content);
      downloadRef.current.download = content?.name || defaultName;
    }
    downloadRef.current.click();
  };
  if (!source) return null;

  const rdfFileName =
    (source && source instanceof File &&  "name" in source) ? getFileBaseName(source.name) + ".nt" : "result.nt";

  return (
    (<Card variant="outlined">
      <CardHeader
        title={<Typography variant="h5">Download results</Typography>}
        avatar={<FontAwesomeIcon icon={["fas", "download"]} />}
      />
      <CardContent className={styles.downloadContent}>
        <Container className={styles.downloadContainer}>
          <Card variant="outlined" className={styles.downloadSegment}>
            <CardHeader title="Download CSV" avatar={<FontAwesomeIcon icon={["fas", "file-csv"]} />} />
            <CardContent className={styles.downloadContent}>
              {refinedCsv &&
                "Your data has been enriched before being transformed, the CoW and RML transformation scripts expect to use this file\n"}
              Download your tabular source data as standardized CSV.
            </CardContent>
            <CardActions>
              {refinedCsv ? (
                <SplitButton
                  actions={["Enriched CSV", "CSV"]}
                  getButtonlabel={(selectedOption) => `Download ${selectedOption}`}
                  onActionSelected={(action) => {
                    downloadFile(
                      action === "CSV" ? source : serializeCsv(refinedCsv),
                      action === "CSV"
                        ? "source.csv"
                        : typeof source !== "string"
                        ? getFileBaseName(source.name) + "-enriched.csv"
                        : "source-enriched.csv",
                      "text/csv"
                    );
                  }}
                />
              ) : (
                <Button
                  onClick={() => downloadFile(source, "source.csv", "text/csv")}
                  component="span"
                  variant="contained"
                  color="primary"
                  disabled={!source}
                  style={{textTransform: 'none'}}
                >
                  Download CSV
                </Button>
              )}
            </CardActions>
          </Card>
          <Card variant="outlined" className={styles.downloadSegment}>
            <CardHeader title="Download RDF" avatar={<FontAwesomeIcon icon="file" />} />
            <CardContent className={styles.downloadContent}>
              Download the transformed Linked Data (RDF) to your local machine.
            </CardContent>
            <CardActions>
              <Button
                onClick={() => downloadFile(transformationResult, rdfFileName, "application/n-triples")}
                component="span"
                variant="contained"
                color="primary"
                style={{textTransform: 'none'}}
              >
                Download RDF
              </Button>
            </CardActions>
          </Card>
          <Card variant="outlined" className={styles.downloadSegment}>
            <CardHeader title="Download script" avatar={<FontAwesomeIcon icon="file-code" />} />
            <CardContent className={styles.downloadContent}>
              Download the RML mappings that you can use to run the transformation yourself. The following mapping languages are
              supported: RML, CoW.
            </CardContent>
            <CardActions>
              <SplitButton
                actions={["rml", "cow"]}
                getButtonlabel={(selectedOption) => `Download ${selectedOption.toUpperCase()}`}
                getOptionsLabel={(option) => (option === "cow" ? "CoW" : option.toUpperCase())}
                onActionSelected={(result) =>
                  wizardAppConfig
                    .getTransformationScript(transformationConfig, result as TransformationType)
                    .then((file) => {
                      const fileBase =
                        // Removes extension from filename
                        typeof source !== "string" ? source.name.replace(/\.[^/.]+$/, "") : undefined;
                      if (typeof file === "string") {
                        if (result === "cow") {
                          const fileName =
                            typeof source === "string"
                              ? `convert.csv-metadata.json`
                              : `${refinedCsv ? fileBase + "-enriched.csv" : source?.name}-metadata.json`;
                          downloadFile(file, fileName, "application/json+ld");
                        } else if (result === "rml") {
                          downloadFile(file, `${fileBase || "rules"}.rml.ttl`, "text/turtle");
                        }
                      }
                    })
                }
              />
            </CardActions>
          </Card>
        </Container>
      </CardContent>
      <a style={{ visibility: "hidden" }} ref={downloadRef} />
    </Card>)
  );
};

export default DownloadResults;
