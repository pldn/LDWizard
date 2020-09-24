import * as React from "react";
import { useRecoilValue } from "recoil";
import {
  Button,
  DialogTitle,
  Dialog,
  DialogContent,
  CircularProgress,
  Typography,
  IconButton,
} from "@material-ui/core";
import { currentDatasetSelector, currentTokenState, currentAccountDataSelector, apiInfoState } from "state/clientJs";
import { matrixState, sourceState, transformationConfigState } from "state";
import { wizardConfig } from "config";
import { AlertTitle, Alert } from "@material-ui/lab";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import App from "@triply/client.js";
import Dataset from "@triply/client.js/lib/Dataset";

import * as styles from "./style.scss";

function stringToFile(content: string, fileName: string, contentType: string) {
  return new File([new Blob([content], { type: contentType })], fileName);
}
async function uploadAsset(ds: Dataset, file: File) {
  try {
    const currentAssets = await ds.getAssets();
    const existingAsset = currentAssets.find((asset) => asset.assetName === file.name);
    await ds.uploadAsset(file, file.name, existingAsset?.identifier);
  } catch (e) {
    if (
      // No difference detected API side
      e.message.indexOf("Uploaded file is identical to the most recent version") >= 0 ||
      // No difference detected Client side
      e.message.indexOf("No response or upload already finished") >= 0
    ) {
      // Ignore this, the file is already an assets and hasn't changed since the last time
    } else {
      throw e;
    }
  }
}

interface Props {
  transformationResult: string;
}

const TriplyDBUploadProcess: React.FC<Props> = ({ transformationResult }) => {
  const selectedDataset = useRecoilValue(currentDatasetSelector);
  const parsedCsv = useRecoilValue(matrixState);
  const source = useRecoilValue(sourceState);
  const transformationConfig = useRecoilValue(transformationConfigState);
  const selectedAccount = useRecoilValue(currentAccountDataSelector);
  const token = useRecoilValue(currentTokenState);
  const apiInfo = useRecoilValue(apiInfoState);

  const [processDialogOpen, setProcessDialogOpen] = React.useState(false);
  const [processText, setProcessText] = React.useState("");
  const [processFinished, setProcessFinished] = React.useState(false);
  // Need a localized try/catch here, as the export process runs asynchronously throws errors won't propagate to the ErrorBoundary
  const [processError, setProcessError] = React.useState<string>();

  // Reset process finished state when dataset changes
  React.useEffect(() => {
    setProcessFinished(false);
  }, [selectedDataset?.id]);

  const uploadToTriplyDBProcess = async () => {
    if (!selectedAccount?.accountName || !selectedDataset || !parsedCsv || !source || processDialogOpen) return;
    setProcessFinished(false);
    setProcessDialogOpen(true);
    try {
      // We need to get a mutable object as we create a local job
      const ds = await App.get(token).getDataset(selectedAccount.accountName, selectedDataset?.name);
      setProcessText("Uploading results");
      await ds.importFromFiles(stringToFile(transformationResult, "results.nt", "application/n-triples"));
      setProcessText("Uploading scripts");

      const rattScript = await wizardConfig.getTransformationScript(transformationConfig, "ratt");
      const cowScript = await wizardConfig.getTransformationScript(transformationConfig, "cow");
      const rmlScript = await wizardConfig.getTransformationScript(transformationConfig, "rml");
      // We need to check if we are overwriting or uploading new assets
      // Removes extension from filename
      const fileBase = typeof source !== "string" ? source.name.replace(/\.[^/.]+$/, "") : undefined;
      if (typeof rattScript === "string") {
        await uploadAsset(
          ds,
          stringToFile(rattScript, `${fileBase ? fileBase + "." : ""}convert.ts`, "text/x-typescript")
        );
      }
      if (typeof cowScript === "string") {
        const fileName = typeof source === "string" ? `convert.csv-metadata.json` : `${source?.name}-metadata.json`;
        await uploadAsset(ds, stringToFile(cowScript, fileName, "application/json+ld"));
      }
      if (typeof rmlScript === "string") {
        await uploadAsset(ds, stringToFile(rmlScript, `${fileBase || "rules"}.rml.ttl`, "text/turtle"));
      }
      setProcessText("Uploading source");
      if (typeof source === "string") {
        await uploadAsset(ds, stringToFile(source, "source.csv", "text/csv"));
      } else {
        await uploadAsset(ds, source);
      }
      setProcessFinished(true);
    } catch (e) {
      setProcessError(e.message);
      console.error(e);
    } finally {
      setProcessDialogOpen(false);
    }
  };

  return (
    <div key={selectedDataset?.id}>
      {processError && (
        <Alert
          className={styles.processAlert}
          severity={"error"}
          action={
            <IconButton onClick={() => setProcessError(undefined)}>
              <FontAwesomeIcon icon="times" />
            </IconButton>
          }
        >
          <AlertTitle>Error</AlertTitle>
          {processError}
        </Alert>
      )}
      {processFinished && (
        <Alert severity={"success"} className={styles.processAlert}>
          <AlertTitle>
            {(apiInfo as any).consoleUrl ? (
              <>
                Finished publishing. {/* Waiting for next utils-public release */}
                <a
                  target="_blank"
                  href={`${(apiInfo as any).consoleUrl}/${selectedAccount?.accountName}/${selectedDataset?.name}`}
                >
                  Click here to view your results
                </a>
              </>
            ) : (
              <>Upload finished</>
            )}
          </AlertTitle>
        </Alert>
      )}
      {!processFinished && (
        <Button
          disabled={!selectedDataset || processDialogOpen}
          onClick={() =>
            uploadToTriplyDBProcess().catch((e) => {
              console.error(e), setProcessDialogOpen(false);
            })
          }
          variant="contained"
          color="primary"
        >
          Publish
        </Button>
      )}
      <Dialog open={processDialogOpen}>
        <DialogTitle>Uploading to {apiInfo?.branding.name}</DialogTitle>
        <DialogContent>
          <Typography>{processText}</Typography>
          <CircularProgress color="secondary" />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TriplyDBUploadProcess;
