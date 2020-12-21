/**
 * Transforms a header into a valid part of an IRI
 * - Replaces spaces with underscores
 * @param headerName the name of the header
 * @returns the header as a valid part an IRI
 */
export function cleanCsvValue(value: unknown) {
  if (typeof value === "string") return value.replace(/ /g, "_");
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
