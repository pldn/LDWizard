import { TransformationScript, TransformationConfiguration } from "../../Definitions";
import { cleanCSVValue, getBaseIdentifierIri, getBasePredicateIri } from "../../utils/helpers";
/**
 * This file serves as the base template for a CoW transformation script
 * See `../../config/cowScript.ts` for the current transformation script
 */
interface CowColumn {
  "@id"?: string;
  datatype?: string;
  name?: string;
  propertyUrl?: string;
  aboutUrl?: string;
  valueUrl?: string;
  virtual?: boolean;
  "csvw:value"?: string;
}

interface CowTransformation {
  "@id": string;
  "@context": [string, { "@base": string }];
  url: string;
  dialect: {
    delimiter: string;
    encoding: string;
    quoteChar: string;
  };
  tableSchema: {
    aboutUrl: string;
    primaryKey: string;
    columns: CowColumn[];
  };
}

async function getCowTransformationScript(configuration: TransformationConfiguration): Promise<TransformationScript> {
  const baseIri = configuration.baseIri.toString();

  const columns: CowColumn[] = [];
  const keyColumn = `${getBaseIdentifierIri(baseIri)}{${
    (configuration.key && configuration.columnConfiguration[configuration.key].columnName) ?? "_row"
  }}`;
  columns.push({
    virtual: true,
    propertyUrl: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    aboutUrl: keyColumn,
    valueUrl: configuration.resourceClass,
  });
  for (const columnConfig of configuration.columnConfiguration) {
    if (columnConfig.columnName.length === 0) continue;
    if (
      columnConfig.columnName === (configuration.key && configuration.columnConfiguration[configuration.key].columnName)
    )
      continue;
    columns.push({
      datatype: "string",
      "@id": `${baseIri}column/${columnConfig.columnName}`,
      name: columnConfig.columnName,
      propertyUrl:
        columnConfig.propertyIri ?? `${getBasePredicateIri(baseIri)}${cleanCSVValue(columnConfig.columnName)}`,
    });
  }

  const script: CowTransformation = {
    "@id": baseIri,
    "@context": [
      "https://raw.githubusercontent.com/CLARIAH/COW/master/csvw.json",
      {
        "@base": baseIri,
      },
    ],
    url: "",
    dialect: {
      delimiter: configuration.csvProps.delimiter,
      encoding: "UTF-8",
      quoteChar: '"',
    },
    tableSchema: {
      aboutUrl: keyColumn,
      primaryKey: "Resource",
      columns: columns,
    },
  };
  return JSON.stringify(script, undefined, 2);
}
// Disabled export as this is a base template file
// export default getCowTransformationScript;
