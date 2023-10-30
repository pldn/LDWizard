import { TransformationScript, TransformationConfiguration } from "../Definitions.ts";
import { DataFactory, Writer } from "n3";
import { cleanCsvValue, getBaseIdentifierIri, getBasePredicateIri, getFileBaseName } from "../utils/helpers.ts";

const { namedNode, literal } = DataFactory;

const rmlPrefixes: { [key: string]: string } = {
  rml: "http://semweb.mmlab.be/ns/rml#",
  rr: "http://www.w3.org/ns/r2rml#",
  ql: "http://semweb.mmlab.be/ns/ql#",
  csvw: "http://www.w3.org/ns/csvw#",
  rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  "": "http://example.org/rules/",
  schema: "http://schema.org/",
  dbo: "http://dbpedia.org/ontology/",
  owl: "http://www.w3.org/2002/07/owl#",
};
async function getRmlTransformationScript(configuration: TransformationConfiguration): Promise<TransformationScript> {
  const baseIri = configuration.baseIri.toString();
  // Create base RML interface
  const writer = new Writer({ prefixes: rmlPrefixes });
  const usesRefinedSource = configuration.columnConfiguration.some((config) => !!config.columnRefinement);
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
            object: literal(
              usesRefinedSource
                ? getFileBaseName(configuration.sourceFileName) + ".csv"
                : // ? getFileBaseName(configuration.sourceFileName) + "-enriched.csv"
                  configuration.sourceFileName
            ),
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
    : // RML doesn't support adding base-iri + row-numbers as an identifier, so we temporarily inject a _rowNumber column in rmlScript.ts
      {
        predicate: namedNode("rr:template"),
        object: literal(`${getBaseIdentifierIri(configuration.baseIri.toString())}{_rowNumber}`),
      };
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
    if (header.columnRefinement) {
      if ((header.columnRefinement.yieldsIri == true) && (header.columnRefinement.yieldsLiteral == true)){
        throw new Error(`Cannot use "yieldsIri" in combination with "yieldsLiteral" as columnRefinement options in the refinement "${header.columnRefinement.label}", please only specify one in your configuration file.`)
      }
      // don't add both if column refinement is "to-iri"
      if (header.columnRefinement?.type === "to-iri") {
        // add each seperately
        writer.addQuad(
          namedNode(":TriplesMap"),
          namedNode("rr:predicateObjectMap"),
          writer.blank([
            {
              predicate: namedNode("rr:predicate"),
              object: namedNode(
                header.propertyIri
                  ? header.propertyIri
                  : `${getBasePredicateIri(baseIri)}${cleanCsvValue(header.columnName)}`
              ),
            },
            {
              predicate: namedNode("rr:objectMap"),
              object: writer.blank(
                header.columnRefinement.data.iriPrefix === ""
                  ? [
                      {
                        predicate: namedNode("rml:reference"),
                        object: namedNode(`${header.columnName}`),
                      },
                      {
                        predicate: namedNode("rr:termType"),
                        object: namedNode("rr:IRI"),
                      },
                    ]
                  : [
                      {
                        predicate: namedNode("rr:template"),
                        object: literal(`${header.columnRefinement.data.iriPrefix}{${header.columnName}}`),
                      },
                      {
                        predicate: namedNode("rr:termType"),
                        object: namedNode("rr:IRI"),
                      },
                    ]
              ),
            },
          ])
        );
      } else {
        // for any other column refinement add both original and refined value to the RML script
        if (header.columnRefinement.KeepOriginalValueOptions && header.columnRefinement.KeepOriginalValueOptions.keepValue) {
          // keeps the original value as triple in combination with the refined value
          for (let i = 0; i < 2; i++) {
            let colName: string;
            colName = header.columnName;
            if (i > 0) {
              // for the refined data, add each seperately
              writer.addQuad(
                namedNode(":TriplesMap"),
                namedNode("rr:predicateObjectMap"),
                writer.blank([
                  {
                    predicate: namedNode("rr:predicate"),
                    object: namedNode(
                      header.propertyIri
                        ? header.propertyIri
                        : header.columnRefinement.KeepOriginalValueOptions.customPredicateIRI
                        ? `${header.columnRefinement.KeepOriginalValueOptions.customPredicateIRI}`
                        : "owl:sameAs"
                    ),
                  },
                  {
                    predicate: namedNode("rr:objectMap"),
                    object: writer.blank(
                      header.columnRefinement.yieldsLiteral
                        ? [
                            {
                              predicate: namedNode("rml:reference"),
                              object: literal(`${colName}-refined`),
                            },
                          ]
                        : header.columnRefinement.yieldsIri
                        ? [
                          {
                            predicate: namedNode("rml:reference"),
                            object: literal(`${header.columnName}-refined`),
                          },
                          {
                            predicate: namedNode("rr:termType"),
                            object: namedNode("rr:IRI"),
                          },
                        ]
                        : [
                            {
                              predicate: namedNode("rml:template"),
                              object: literal(`${getBasePredicateIri(baseIri)}{${header.columnName}-refined}`),
                            },
                            {
                              predicate: namedNode("rr:termType"),
                              object: namedNode("rr:IRI"),
                            },
                          ]
                    ),
                  },
                ])
              );
            } else {
              // for the original data (unrefined) that we want to keep as well
              // add each seperately
              writer.addQuad(
                namedNode(":TriplesMap"),
                namedNode("rr:predicateObjectMap"),
                writer.blank([
                  {
                    predicate: namedNode("rr:predicate"),
                    object: namedNode(
                      header.propertyIri
                        ? header.propertyIri
                        : `${getBasePredicateIri(baseIri)}${cleanCsvValue(colName)}`
                    ),
                  },
                  {
                    predicate: namedNode("rr:objectMap"),
                    object: writer.blank(
                      // header.columnRefinement.yieldsLiteral
                      //   ? [
                      //       {
                      //         predicate: namedNode("rml:reference"),
                      //         object: literal(`${header.columnName}`),
                      //       },
                      //     ]
                      //   : header.columnRefinement.yieldsIri 
                      //   ? [
                      //     {
                      //       predicate: namedNode("rml:reference"),
                      //       object: literal(`${header.columnName}`),
                      //     },
                      //     {
                      //       predicate: namedNode("rr:termType"),
                      //       object: namedNode("rr:IRI"),
                      //     },
                      //   ]
                      //   :

                        [
                            {
                              predicate: namedNode("rml:template"),
                              object: literal(`${getBasePredicateIri(baseIri)}{${header.columnName}}`),
                            },
                            {
                              predicate: namedNode("rr:termType"),
                              object: namedNode("rr:IRI"),
                            },
                          ]
                    ),
                  },
                ])
              );
            }
          }
        } else {
          // when during column refinement we do not keep the original an replace the original value
          let colName: string;
          colName = header.columnName;
          writer.addQuad(
            namedNode(":TriplesMap"),
            namedNode("rr:predicateObjectMap"),
            writer.blank([
              {
                predicate: namedNode("rr:predicate"),
                object: namedNode(
                  header.propertyIri ? header.propertyIri : `${getBasePredicateIri(baseIri)}${cleanCsvValue(colName)}`
                ),
              },
              {
                predicate: namedNode("rr:objectMap"),
                object: writer.blank(
                  header.columnRefinement.yieldsLiteral
                    ? [
                        {
                          predicate: namedNode("rml:reference"),
                          object: literal(`${colName}-refined`),
                        },
                      ]
                    : header.columnRefinement.yieldsIri ?
                    [
                      {
                        predicate: namedNode("rml:reference"),
                        object: literal(`${header.columnName}-refined`),
                      },
                      {
                        predicate: namedNode("rr:termType"),
                        object: namedNode("rr:IRI"),
                      },
                    ]
                    : [
                        {
                          predicate: namedNode("rml:template"),
                          object: literal(`${getBasePredicateIri(baseIri)}{${header.columnName}-refined}`),
                        },
                        {
                          predicate: namedNode("rr:termType"),
                          object: namedNode("rr:IRI"),
                        },
                      ]
                ),
              },
            ])
          );
        }
      }
    } else {
      // when not using column refinement
      writer.addQuad(
        namedNode(":TriplesMap"),
        namedNode("rr:predicateObjectMap"),
        writer.blank([
          {
            predicate: namedNode("rr:predicate"),
            object: namedNode(
              header.propertyIri
                ? header.propertyIri
                : `${getBasePredicateIri(baseIri)}${cleanCsvValue(header.columnName)}`
            ),
          },
          {
            predicate: namedNode("rr:objectMap"),
            object: writer.blank([
              {
                predicate: namedNode("rml:reference"),
                object: literal(header.columnName),
              },
            ]),
          },
        ])
      );
    }
  }
  return new Promise((resolve, reject) => {
    writer.end((error, result) => {
      if (error) reject(error);
      resolve(result);
    });
  });
}

export default getRmlTransformationScript;
