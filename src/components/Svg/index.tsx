import * as React from "react";
//
import getClassName from "classnames";

import styles from "./style.scss";
/**
IMPORTANT:
Use this SVG for images that are either large, or when they are infrequently used in the website.
SVGs that are small and used frequently, used be used via a sprite, in orde to improve caching.
**/
export interface ISvgProps {
  className?: string;
  innerClassName?: string;
  // style?: React.CSSProperties,
  src: string;
  style?: React.CSSProperties;
  imgStyle?: React.CSSProperties;
}

const Svg: React.FC<ISvgProps> = (props: ISvgProps) => {
  const { className, src, style, imgStyle, innerClassName } = props;

  const classNames: { [className: string]: boolean } = {
    [styles.svgStatic]: true,
    "svg-static": true,
  };
  return (
    <div className={getClassName(className, classNames)} style={style ? style : {}}>
      <img src={src} style={imgStyle ? imgStyle : {}} className={innerClassName} />
    </div>
  );
};

export default Svg;
