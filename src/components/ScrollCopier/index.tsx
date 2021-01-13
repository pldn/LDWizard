import * as React from "react";

interface Props {
  scrollRef: React.RefObject<HTMLDivElement>;
}

const ScrollCopier: React.FC<Props> = ({ scrollRef }) => {
  const ownRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const tableDiv = ownRef.current;
    const topDiv = scrollRef.current;
    const topScrollFunction = () => {
      if (tableDiv && topDiv) tableDiv.scrollLeft = topDiv.scrollLeft;
    };
    const bottomScrollFunction = () => {
      if (topDiv && tableDiv) topDiv.scrollLeft = tableDiv.scrollLeft;
    };
    topDiv?.addEventListener("scroll", topScrollFunction);
    tableDiv?.addEventListener("scroll", bottomScrollFunction);
    return () => {
      topDiv?.removeEventListener("scroll", topScrollFunction);
      tableDiv?.removeEventListener("scroll", bottomScrollFunction);
    };
  }, [scrollRef, ownRef]);
  React.useEffect(() => {
    if (scrollRef.current && contentRef.current)
      contentRef.current.style.width = scrollRef.current.scrollWidth + "px" || "0px";
  }, [scrollRef, contentRef]);
  return (
    <div style={{ width: "100%", overflowX: "auto" }} ref={ownRef}>
      <div style={{ height: "1px", marginTop: "-1px" }} ref={contentRef}></div>
    </div>
  );
};

export default ScrollCopier;
