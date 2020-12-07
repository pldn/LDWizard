//external dependencies
import * as React from "react";
import getClassName from "classnames";
//import own dependencies
import FontAwesomeIcon from "../FontAwesomeIcon";

export interface AlertProps {
  className?: string;
  style?: React.CSSProperties;
  transparent?: boolean;
  hideIcon?: boolean;
  size?: "md" | "sm";
  error?: boolean;
  warning?: boolean;
  info?: boolean;
  success?: boolean;
}
import * as styles from "./style.scss";

const Alert: React.FC<AlertProps> = ({
  transparent,
  hideIcon,
  className,
  children,
  style,
  error,
  warning,
  info,
  success,
  size,
}) => {
  if (!children) return null;

  const classNames: { [className: string]: boolean } = {
    [styles.alert]: !!styles.alert,
    [styles.transparent]: !!transparent,
    [styles.error]: (!error && !warning && !info && !success) || !!error, //Default style is error
    [styles.warning]: !!warning,
    [styles.info]: !!info,
    [styles.success]: !!success,
    [className || ""]: !!className,
    [styles.sm]: size === "sm",
  };

  return (
    <div style={style || {}} className={getClassName(classNames)}>
      {!hideIcon && (
        <div className={styles.icon}>
          <FontAwesomeIcon icon={["fas", info || success ? "info-circle" : "exclamation-triangle"]} />
        </div>
      )}
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default Alert;
