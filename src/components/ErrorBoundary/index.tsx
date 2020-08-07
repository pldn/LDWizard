import * as React from "react";
import Alert from "components/Alert";
interface Props {}
interface State {
  hasError: boolean | string;
}
export default class ErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: error.message || true };
  }

  render() {
    if (this.state.hasError) {
      return <Alert>{typeof this.state.hasError === "boolean" ? "Something went wrong" : this.state.hasError}</Alert>;
    }

    return this.props.children;
  }
}
