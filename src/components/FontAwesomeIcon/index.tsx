//external dependencies
import * as React from "react";
import { Props as FaProps, FontAwesomeIcon as _FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconPrefix } from "@fortawesome/fontawesome-svg-core";

namespace FontAwesomeIcon {
  export interface Props extends FaProps {}
}
const defaultIconPrefix: IconPrefix = "far"; //solid, regular or light
const FontAwesomeIcon: React.FC<FontAwesomeIcon.Props> = (props) => {
  const icon: FontAwesomeIcon.Props["icon"] =
    typeof props.icon === "string" ? [defaultIconPrefix, props.icon] : props.icon;
  return <_FontAwesomeIcon {...props} icon={icon} />;
};
export default FontAwesomeIcon;
