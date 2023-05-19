import { ColumnConfiguration, ShaclShapeMeta, TransformationConfiguration } from '../Definitions'
import { PrefixesArray } from "@triply/utils/lib/prefixUtils";
import { getPrefixed } from "@triply/utils/lib/prefixUtils";

export const csvRowsToShaclRows = (rows: Array<Array<string>>, headers: Array<ColumnConfiguration>) => {
  return rows.map(row => [
    'test',
    ...row
  ])
}

export const configColumnsToShaclColumns = (headers: Array<ColumnConfiguration>, shaclMetas: Array<ShaclShapeMeta>, transformationConfig: TransformationConfiguration, prefixes: PrefixesArray): Array<ColumnConfiguration> => {
  const shaclShape = shaclMetas.find(shaclMeta => shaclMeta.iri === transformationConfig.shaclShape)
  if (!shaclShape) return headers

  const mergedPrefixes = [
    ...prefixes,
    ...Object.entries(shaclShape.prefixes).map(([alias, iri]) => ({
      prefixLabel: alias, iri
    }))
  ]

  return [
    ...shaclShape.properties.map(property => {
      const columnName = property.name ?? getPrefixed(property.path, mergedPrefixes) ?? property.path

      return {
        propertyIri: property.path,
        columnName,
        disabled: true,
        shaclColumn: true
      }
    }).filter(property => headers.filter(header => header.propertyIri && header.propertyIri === property.propertyIri).length === 0)
    , ...headers]
}