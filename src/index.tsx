import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./containers/App";
import ContextProviders from "./ContextProviders";
import registerIcons from "./utils/FaIcons";

registerIcons();
const root = createRoot(document.getElementById("app")!);
root.render(
  <ContextProviders>
    <App />
  </ContextProviders>
);
