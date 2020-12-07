import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./containers/App";
import ContextProviders from "./ContextProviders";
import registerIcons from "./utils/FaIcons";

registerIcons();
ReactDOM.render(
  <ContextProviders>
    <App />
  </ContextProviders>,
  document.getElementById("app")
);
