import * as React from "react";
import Alert from "../Alert/index.tsx";
import { Button } from "@mui/material";
import styles from "./style.scss";
interface Props {
  resetAction?: (errorText: string) => void;
  children: React.ReactNode;
}
interface State {
  hasError: boolean | string;
}
export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: error.message || true };
  }
  resetError = () => {
    this.props.resetAction?.(typeof this.state.hasError === "boolean" ? "Something went wrong" : this.state.hasError);
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Alert>
          <p className={styles.errorContent}>
            {typeof this.state.hasError === "boolean" ? "Something went wrong" : this.state.hasError}
          </p>
          <Button onClick={this.resetError} color="inherit" size="small">
            Retry
          </Button>
        </Alert>
      );
    }

    return this.props.children;
  }
}
