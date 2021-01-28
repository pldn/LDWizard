import * as React from "react";
import { TextField, Button, Typography, Checkbox, FormControlLabel, IconButton } from "@material-ui/core";
import { useRecoilState, useRecoilValue } from "recoil";
import * as style from "./style.scss";
import { currentTokenState, accountsInfoQuery } from "../../state/clientJs";
import ErrorBoundary from "../../components/ErrorBoundary";
import App from "@triply/triplydb";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import wizardConfig from "../../config";
export interface Props {}
const TokenForm: React.FC<Props> = () => {
  const [token, setToken] = useRecoilState(currentTokenState);
  const accounts = useRecoilValue(accountsInfoQuery);
  // The first account is always the token owner
  const tokenOwner = accounts[0];

  const [shouldStoreToken, setShouldStoreToken] = React.useState(true);
  const [currentTokenValue, setCurrentTokenValue] = React.useState("");
  const [tokenError, setTokenError] = React.useState<string>();

  const loadToken = async () => {
    try {
      const app = App.get(currentTokenValue);
      // Lets check if the endpoint is configured correctly
      await app.getApiInfo();
      if (shouldStoreToken) localStorage.setItem("token", currentTokenValue);
      setToken(currentTokenValue);
    } catch (e) {
      // This is when the api cannot be found, this means either an old token or that the API is down
      if (e.message === "info is null") {
        setTokenError("This token cannot be use please create a new one");
      } else if (e.message === "Invalid token") {
        setTokenError(e.message);
      } else {
        throw e;
      }
    }
  };

  return (
    <ErrorBoundary>
      {!!token && (
        <div className={style.loadedTokenMessage}>
          <Typography>{`Using token of account ${tokenOwner?.name || tokenOwner?.accountName}`}</Typography>
          <IconButton
            title="Forget token"
            onClick={() => {
              localStorage.removeItem("token");
              setToken("");
            }}
          >
            <FontAwesomeIcon icon="times" size="sm" />
          </IconButton>
        </div>
      )}
      {!token && (
        <form
          className={style.tokenForm}
          onSubmit={(e) => {
            e.preventDefault();
            return loadToken();
          }}
        >
          <div className={style.tokenField}>
            <TextField
              fullWidth
              label="Token"
              name="token"
              value={currentTokenValue}
              error={!!tokenError}
              onChange={(event) => {
                setCurrentTokenValue(event.currentTarget.value);
                setTokenError(undefined);
              }}
              helperText={
                tokenError || wizardConfig.triplyDbInstances.length > 0 ? (
                  <>
                    Create a new token at:{" "}
                    {wizardConfig.triplyDbInstances.map((reference, idx) => {
                      return (
                        <>
                          {idx !== 0 && (idx === wizardConfig.triplyDbInstances.length - 1 ? " or " : ", ")}
                          <a href={`${reference.link}${reference.link.endsWith("/") ? "" : "/"}me/-/settings/tokens`}>
                            {reference.label}
                          </a>
                        </>
                      );
                    })}
                  </>
                ) : (
                  <>
                    Create a new token{" "}
                    <a
                      href={`${wizardConfig.dataplatformLink}${
                        wizardConfig.dataplatformLink.endsWith("/") ? "" : "/"
                      }me/-/settings/tokens`}
                      target="_blank"
                    >
                      here
                    </a>
                  </>
                )
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={shouldStoreToken}
                  onChange={(event) => setShouldStoreToken(event.currentTarget.checked)}
                  name="storeToken"
                />
              }
              label="Remember"
            />
          </div>

          <Button type="submit" color="primary" disabled={currentTokenValue.length === 0}>
            Load token
          </Button>
        </form>
      )}
    </ErrorBoundary>
  );
};
export default TokenForm;
