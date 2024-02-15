import { PrefixesArray, getPrefixed } from '@triply/utils/prefixUtils.js'
import { ColumnConfiguration, ShaclShapeMeta } from '../Definitions.ts'


export const csvRowsToShaclRows = (
  rows: Array<Array<string>>, 
  headers: Array<ColumnConfiguration>, 
  shaclShapeMeta: ShaclShapeMeta, 
) => {

  const attachedShaclHeaders = headers
    .filter(header => header.propertyIri && shaclShapeMeta.properties
      .find(property => property.path === header.propertyIri)
    )

  const fillerCount = shaclShapeMeta.properties.length - attachedShaclHeaders.length
  const fillers = Array(fillerCount).fill('').map((v, i)=> '-')

  return rows.map(row => [
    ...fillers,
    ...row
  ])
}

export const configColumnsToShaclColumns = (
  headers: Array<ColumnConfiguration>, 
  shaclShapeMeta: ShaclShapeMeta, 
  prefixes: PrefixesArray
): Array<ColumnConfiguration> => {
  const mergedPrefixes = [
    ...prefixes,
    ...Object.entries(shaclShapeMeta.prefixes).map(([alias, iri]) => ({
      prefixLabel: alias, iri
    }))
  ]

  return [
    ...shaclShapeMeta.properties.map(property => {
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