import React from "react";
import styles from "./style.scss";
import {
  Box,
  Container,
  Button,
  Card,
  CardActions,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@material-ui/core";
import FontAwesomeIcon from "components/FontAwesomeIcon";

import { useHistory, Redirect } from "react-router-dom";
import applyTransformation from "utils/ratt/applyTransformation";
import { useRecoilValue } from "recoil";
import { matrixState, sourceState, transformationConfigState } from "state";
import { TransformationType, GetTransformationScript } from "Definitions";
import getRattTransformationScript from "utils/ratt/getTransformation";
import getCowTransformationScript from "utils/cow/getTransformation";
import getRmlTransformationScript from "utils/rml/getTransformation";
interface Props {}
export const Step = 3;
const Export: React.FC<Props> = ({}) => {
  const [selectedTransformation, setSelectedTransformation] = React.useState<TransformationType>("ratt");
  const parsedCsv = useRecoilValue(matrixState);
  const source = useRecoilValue(sourceState);
  const transformationConfig = useRecoilValue(transformationConfigState);

  const history = useHistory();
  const downloadRef = React.useRef<HTMLAnchorElement>(null);

  if (!source || !parsedCsv) {
    return <Redirect to="/1" />;
  }
  const downloadFile = (content: File | string | undefined, defaultName: string) => {
    if (!downloadRef.current || !content) return;
    if (typeof content === "string") {
      const blob = new Blob([content], { type: "text/plain" });
      downloadRef.current.href = URL.createObjectURL(blob);
      downloadRef.current.download = defaultName;
    } else {
      downloadRef.current.href = URL.createObjectURL(content);
      downloadRef.current.download = content?.name || defaultName;
    }
    downloadRef.current.click();
  };
  const getDownloadScript: GetTransformationScript = (configuration, type) => {
    switch (type) {
      case "ratt":
        return getRattTransformationScript(configuration);
      case "cow":
        return getCowTransformationScript(configuration);
      case "rml":
        return getRmlTransformationScript(configuration);
      default:
        throw new Error("Unknown script selected");
    }
  };
  return (
    <>
      <Container>
        <div className={styles.segmentContainer}>
          <Card className={styles.segment}>
            <CardActions>
              <Button
                onClick={() => downloadFile(source, "source.csv")}
                component="span"
                fullWidth
                variant="contained"
                color="primary"
                disabled={!source}
                startIcon={<FontAwesomeIcon icon={["fas", "file-csv"]} />}
              >
                Export source file
              </Button>
            </CardActions>
          </Card>
          <Card className={styles.segment}>
            <CardActions>
              <Button
                onClick={() =>
                  applyTransformation({
                    config: transformationConfig,
                    source: parsedCsv,
                    type: "ratt",
                  }).then((result) => downloadFile(result, "result.trig"))
                }
                component="span"
                fullWidth
                variant="contained"
                color="primary"
                startIcon={<FontAwesomeIcon icon="file" />}
              >
                Export transformation output
              </Button>
            </CardActions>
          </Card>
          <Card className={styles.segment}>
            <CardContent>
              <FormControl fullWidth>
                <InputLabel>Transformation Script</InputLabel>
                <Select
                  value={selectedTransformation}
                  onChange={(event) => {
                    setSelectedTransformation(event.target.value as TransformationType);
                  }}
                >
                  <MenuItem value="ratt">Ratt</MenuItem>
                  <MenuItem value="cow">Cow</MenuItem>
                  <MenuItem value="rml">RML</MenuItem>
                </Select>
              </FormControl>
            </CardContent>

            <CardActions>
              <Button
                onClick={() =>
                  getDownloadScript(transformationConfig, selectedTransformation).then((file) => {
                    if (typeof file === "string") {
                      let fileName = "convert.ts";
                      if (selectedTransformation === "cow")
                        fileName = typeof source === "string" ? `convert.json` : `${source?.name}-metadata.json`;
                      if (selectedTransformation === "rml") fileName = "rules.rml.ttl";
                      downloadFile(file, fileName);
                    }
                  })
                }
                component="span"
                fullWidth
                variant="contained"
                color="primary"
                startIcon={<FontAwesomeIcon icon="file-code" />}
              >
                Export transformation script
              </Button>
            </CardActions>
          </Card>
        </div>
      </Container>
      <Box>
        <Button onClick={() => history.push(`/${Step - 1}`)}>Back</Button>
        <Button variant="contained" color="primary" disabled>
          Next
        </Button>
      </Box>
      <a style={{ visibility: "hidden" }} ref={downloadRef} />
    </>
  );
};
export default Export;
