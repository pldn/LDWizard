import { TransformationScript, TransformationConfiguration } from "../../Definitions";
import { DataFactory, Writer } from "n3";
import { cleanCSVValue, getBaseIdentifierIri, getBasePredicateIri } from "../../utils/helpers";
const { namedNode, literal } = DataFactory;
/**
 * This file serves as the base template for a Rml transformation script
 * See `../../config/rmlScript.ts` for the current transformation script
 */

const rmlPrefixes: { [key: string]: string } = {
  rml: "http://semweb.mmlab.be/ns/rml#",
  rr: "http://www.w3.org/ns/r2rml#",
  ql: "http://semweb.mmlab.be/ns/ql#",
  csvw: "http://www.w3.org/ns/csvw#",
  rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  "": "http://example.org/rules/",
  schema: "http://schema.org/",
  dbo: "http://dbpedia.org/ontology/",
};
async function getRmlTransformationScript(configuration: TransformationConfiguration): Promise<TransformationScript> {
  const baseIri = configuration.baseIri.toString();

  // Create base RML interface
  const writer = new Writer({ prefixes: rmlPrefixes });
  writer.addQuad(namedNode(":TriplesMap"), namedNode("rdf:type"), namedNode("rr:TriplesMap"));
  writer.addQuad(
    namedNode(":TriplesMap"),
    namedNode("rml:logicalSource"),
    writer.blank([
      {
        predicate: namedNode("rml:source"),
        object: writer.blank([
          { predicate: namedNode("rdf:type"), object: namedNode("csvw:Table") },
          {
            predicate: namedNode("csvw:url"),
            object: literal(configuration.sourceFileName),
          },
          {
            predicate: namedNode("csvw:dialect"),
            object: writer.blank([
              {
                predicate: namedNode("rdf:type"),
                object: namedNode("csvw:Dialect"),
              },
              {
                predicate: namedNode("csvw:delimiter"),
                object: literal(configuration.csvProps.delimiter),
              },
              {
                predicate: namedNode("csvw:encoding"),
                object: literal("UTF-8"),
              },
            ]),
          },
        ]),
      },
      {
        predicate: namedNode("rml:referenceFormulation"),
        object: namedNode("ql:CSV"),
      },
    ])
  );

  const keyColumnName =
    (configuration.key !== undefined &&
      configuration.key >= 0 &&
      configuration.columnConfiguration[configuration.key].columnName) ||
    undefined;
  const subjectTuple = !!keyColumnName
    ? {
        predicate: namedNode("rr:template"),
        object: literal(`${getBaseIdentifierIri(configuration.baseIri.toString())}{${keyColumnName}}`),
      }
    : // RML doesn't support adding base-iri + row-numbers as an identifier, so we use b-nodes here
      { predicate: namedNode("rr:termType"), object: namedNode("rr:BlankNode") };
  writer.addQuad(namedNode(":TriplesMap"), namedNode("rr:subjectMap"), writer.blank([subjectTuple]));
  // Assign "rdfs:Resource" as a class to each row
  writer.addQuad(
    namedNode(":TriplesMap"),
    namedNode("rr:predicateObjectMap"),
    writer.blank([
      {
        predicate: namedNode("rr:predicate"),
        object: namedNode("rdf:type"),
      },
      {
        predicate: namedNode("rr:objectMap"),
        object: writer.blank({
          predicate: namedNode("rr:constant"),
          object: namedNode(configuration.resourceClass),
        }),
      },
    ])
  );
  // Add columns to the transform script
  for (const header of configuration.columnConfiguration) {
    if (header.columnName === keyColumnName) continue;
    writer.addQuad(
      namedNode(":TriplesMap"),
      namedNode("rr:predicateObjectMap"),
      writer.blank([
        {
          predicate: namedNode("rr:predicate"),
          object: namedNode(
            header.propertyIri
              ? header.propertyIri
              : `${getBasePredicateIri(baseIri)}${cleanCSVValue(header.columnName)}`
          ),
        },
        {
          predicate: namedNode("rr:objectMap"),
          object: writer.blank([{ predicate: namedNode("rml:reference"), object: literal(header.columnName) }]),
        },
      ])
    );
  }
  return new Promise((resolve, reject) => {
    writer.end((error, result) => {
      if (error) reject(error);
      resolve(result);
    });
  });
}
// Disabled export as this is a base template file
// export default getRmlTransformationScript;
