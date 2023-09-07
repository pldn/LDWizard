import * as React from "react";
import { TextField, Button, Typography, Checkbox, FormControlLabel, IconButton } from "@mui/material";
import { useRecoilState, useRecoilValue } from "recoil";
import style from "./style.scss";
import { currentTokenState, accountsInfoQuery } from "../../state/clientJs.ts";
import ErrorBoundary from "../../components/ErrorBoundary/index.tsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import wizardConfig from "../../config/index.ts";
import App from "@triply/triplydb/App.js";
export interface Props {}
const TokenForm: React.FC<Props> = () => {
  const [token, setToken] = useRecoilState(currentTokenState);
  const accounts = useRecoilValue(accountsInfoQuery);
  // The first account is always the token owner
  const tokenOwner = accounts[0];

  const [shouldStoreToken, setShouldStoreToken] = React.useState(true);
  const [currentTokenValue, setCurrentTokenValue] = React.useState(localStorage.getItem("token") || "");
  const [tokenError, setTokenError] = React.useState<string>();

  // Load token on mount here, this way we can prevent updates
  React.useEffect(() => {
    // Load-token should handle itself correctly
    loadToken().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadToken = async () => {
    try {
      const app = App.get(currentTokenValue);
      // Lets check if the endpoint is configured correctly
      await app.getInfo();
      if (shouldStoreToken) localStorage.setItem("token", currentTokenValue);
      setToken(currentTokenValue);
    } catch (e) {
      if (e instanceof Error) {
        // This is when the api cannot be found, this means either an old token or that the API is down
        if (e.message === "info is null") {
          setTokenError("This token cannot be use please create a new one");
        } else if (e.message === "Invalid token") {
          // Invalid formatted token
          setTokenError(e.message);
        } else if (e.message.indexOf("401: Token does not exist.") >= 0) {
          // Deleted token
          setTokenError("Token no longer exists");
          setToken("");
          setCurrentTokenValue("");
          localStorage.removeItem("token");
        } else {
          throw e;
        }
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
            size="large"
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
                tokenError ||
                (wizardConfig.triplyDbInstances.length > 0 ? (
                  <>
                    Create a new token at:{" "}
                    {wizardConfig.triplyDbInstances.map((reference, idx) => {
                      return (
                        <>
                          {idx !== 0 && (idx === wizardConfig.triplyDbInstances.length - 1 ? " or " : ", ")}
                          <a
                            href={`${reference.link}${reference.link.endsWith("/") ? "" : "/"}me/-/settings/tokens`}
                            target="_blank"
                          >
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
                ))
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

          <Button type="submit" color="primary" disabled={currentTokenValue.length === 0}  style={{textTransform: 'none'}}>
            Load token
          </Button>
        </form>
      )}
    </ErrorBoundary>
  );
};
export default TokenForm;
