import { Matrix } from "../Definitions.ts";

/**
 * Transforms a header into a valid part of an IRI
 * - Replaces spaces with underscores
 * @param headerName the name of the header
 * @returns the header as a valid part an IRI
 */
export function cleanCsvValue(value: unknown) {
  if (typeof value === "string") return encodeURI(value.replace(/ /g, "_"));
  if (typeof value === "number") return "" + value;
  throw new Error("Expected CSV value to be a string, got " + typeof value);
}

export function getBasePredicateIri(baseIri: string) {
  if (baseIri.endsWith("#")) {
    return baseIri.slice(0, -1) + "/def#";
  }
  return baseIri + "def/";
}
export function getBaseIdentifierIri(baseIri: string) {
  if (baseIri.endsWith("#")) {
    return baseIri.slice(0, -1) + "/id#";
  }
  return baseIri + "id/";
}
export function getFileBaseName(fileName: string) {
  return fileName.split(".")[0];
}

export function matrixToCsv(matrix: Matrix) {
  let lineArray: any[] = [];
  matrix.forEach((infoArray, i1) => {
    const lineEscaped: any[] = []
    infoArray.forEach((cell, i2) => {
      lineEscaped.push(cell.replace('"', '""'))
    })
    lineArray.push(lineEscaped.join('","'));
  });
  return '"' + lineArray.join('"\n"') + '"';
}