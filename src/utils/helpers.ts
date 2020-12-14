/**
 * Transforms a header into a valid part of an IRI
 * - Replaces spaces with underscores
 * @param headerName the name of the header
 * @returns the header as a valid part an IRI
 */
export function cleanCSVValue(headerName: string) {
  return headerName.replace(/ /g, "_");
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
