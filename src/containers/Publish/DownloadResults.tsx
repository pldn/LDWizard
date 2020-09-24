import React from "react";
import styles from "./style.scss";
import { Container, Button, Card, CardActions, CardContent, CardHeader, Typography } from "@material-ui/core";
import FontAwesomeIcon from "components/FontAwesomeIcon";
import SplitButton from "components/SplitButton";
import { TransformationType } from "Definitions";
import { useRecoilValue } from "recoil";
import { sourceState, transformationConfigState } from "state";
import { wizardConfig } from "config";

interface Props {
  transformationResult: string;
}
const DownloadResults: React.FC<Props> = ({ transformationResult }) => {
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
  return (
    <Card variant="outlined">
      <CardHeader
        title={<Typography variant="h5">Download results</Typography>}
        avatar={<FontAwesomeIcon icon={["fas", "download"]} />}
      />
      <CardContent className={styles.downloadContent}>
        <Container className={styles.downloadContainer}>
          <Card variant="outlined" className={styles.downloadSegment}>
            <CardHeader title="Download CSV" avatar={<FontAwesomeIcon icon={["fas", "file-csv"]} />} />
            <CardContent className={styles.downloadContent}>
              Download your tabular source data as standardized CSV.{" "}
            </CardContent>
            <CardActions>
              <Button
                onClick={() => downloadFile(source, "source.csv", "text/csv")}
                component="span"
                variant="contained"
                color="primary"
                disabled={!source}
              >
                Download CSV
              </Button>
            </CardActions>
          </Card>
          <Card variant="outlined" className={styles.downloadSegment}>
            <CardHeader title="Download RDF" avatar={<FontAwesomeIcon icon="file" />} />
            <CardContent className={styles.downloadContent}>
              Download the transformed Linked Data (RDF) to your local machine.
            </CardContent>
            <CardActions>
              <Button
                onClick={() => downloadFile(transformationResult, "result.nt", "application/n-triples")}
                component="span"
                variant="contained"
                color="primary"
              >
                Download RDF
              </Button>
            </CardActions>
          </Card>
          <Card variant="outlined" className={styles.downloadSegment}>
            <CardHeader title="Download script" avatar={<FontAwesomeIcon icon="file-code" />} />
            <CardContent className={styles.downloadContent}>
              Download a script that you can use to run the transformation yourself. The following script languages are
              supported: RATT, CoW, RML.
            </CardContent>
            <CardActions>
              <SplitButton
                actions={["rml", "cow", "ratt"]}
                getButtonlabel={(selectedOption) => `Download ${selectedOption}`}
                getOptionsLabel={(option) => (option === "cow" ? "CoW" : option.toUpperCase())}
                onActionSelected={(result) =>
                  wizardConfig
                    .getTransformationScript(transformationConfig, result as TransformationType)
                    .then((file) => {
                      const fileBase =
                        // Removes extension from filename
                        typeof source !== "string" ? source.name.replace(/\.[^/.]+$/, "") : undefined;
                      if (typeof file === "string") {
                        if (result === "ratt") {
                          downloadFile(file, `${fileBase ? fileBase + "." : ""}convert.ts`, "text/x-typescript");
                        } else if (result === "cow") {
                          const fileName =
                            typeof source === "string" ? `convert.csv-metadata.json` : `${source?.name}-metadata.json`;
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
    </Card>
  );
};

export default DownloadResults;
