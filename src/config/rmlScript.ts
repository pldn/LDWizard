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
// TODO fix owl:sameAs

// [x] implement literal structure pattern
/**
ex:RowNumber/1 ex:predicate/Age :AgeValue1
ex:RowNumber/1 ex:predicate/Age-refined :Age-refinedValue1
:AgeValue1 rdf:type owl:NamedIndividual ;
           rdf:value "20";
           rdf:comment "Original literal value".
:Age-refinedValue1 rdf:type owl:NamedIndividual ;
           rdf:value "twenty" ;
           rdf:comment "Refined literal value";
:ageValue1 owl:sameAs :Age-refinedValue1
 */

// [x] add option to not have owl:sameAs (default?) ==> should make normal literal and IRI
// [x] implement IRI structure patterm
/**
 * 
ex:RowNumber/1 ex:predicate/Age ex:20
ex:RowNumber/1 ex:predicate/Age-refined ex:twenty

ex:20 owl:sameAs ex:twenty
 * 
 */

// [ ] check correct transformation in values - see TODOs
// TODO TEST owl:sameAs :
// [ ] test if yield for original IRI & refined IRI combination works
// [ ] test if yield for original IRI & refined LITERAL combination works
// [ ] test if yield for original IRI & refined undefined combination works
// [ ] test if yield for original LITERAL & refined LITERAL combination works
// [ ] test if yield for original LITERAL & refined IRI combination works
// [ ] test if yield for original LITERAL & refined undefined combination works
// TODO implement for no defined yield => undefined
// [ ] test if yield for original undefined & refined undefined combination works
// [ ] test if yield for original undefined & refined IRI combination works
// [ ] test if yield for original undefined & refined Literal combination works

// TODO Property IRI behavior fixes
// [ ]original value the given property IRI, but when customPredicateIRI is set, it will overrule the refined transformation's predicate
// [ ]with no customPredicateIRI it should return the original column header IRI (if possible)

// TODO documentation
// [ ] add JSDOC comments to Definition.ts objects on what they do

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
      if ((header.columnRefinement.yieldsIri == true) && (header.columnRefinement.yieldsLiteral == true)) {
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
          if ((header.columnRefinement.KeepOriginalValueOptions.keepAsIri == true) && (header.columnRefinement.KeepOriginalValueOptions.keepAsLiteral == true)) {
            throw new Error(`Cannot use "keepAsIri" in combination with "keepAsLiteral" as columnRefinement KeepOriginalValue options in the refinement "${header.columnRefinement.label}", please only specify one in your configuration file.`)
          }
          // keeps the original value as triple in combination with the refined value
          for (let i = 0; i < 2; i++) {
            let colName: string;
            colName = header.columnName;
            if (i > 0) {
              if (header.columnRefinement.KeepOriginalValueOptions.owlSameAsRelationship) {
                // if the refined data transformation should be kept as an IRI or Literal
                if (header.columnRefinement.yieldsLiteral) {
                  writer.addQuad(
                    namedNode(":TriplesMap"),
                    namedNode("rr:predicateObjectMap"),
                    writer.blank([
                      {
                        predicate: namedNode("rr:predicate"),
                        object: namedNode(
                          header.columnRefinement.KeepOriginalValueOptions.customPredicateIRI
                            ? `${header.columnRefinement.KeepOriginalValueOptions.customPredicateIRI}`
                            : header.propertyIri
                        ),
                      },
                      {
                        predicate: namedNode("rr:objectMap"),
                        object: writer.blank(
                          [
                            {
                              predicate: namedNode("rml:template"),
                              // TODO check if this worked!! for row numbers
                              object: literal(`${getBasePredicateIri(baseIri)}{${header.columnName}-refined-_rowNumber}`),
                            },
                            {
                              predicate: namedNode("rr:termType"),
                              object: namedNode("rr:IRI"),
                            },
                          ]
                        ),
                      },
                    ])
                  )
                  writer.addQuad(
                    namedNode(":TriplesMap"),
                    namedNode("rr:subjectMap"),
                    writer.blank(
                      [
                        {
                          predicate: namedNode("rml:template"),
                          // TODO check if this worked!! for row numbers
                          object: literal(`${getBasePredicateIri(baseIri)}{${header.columnName}-refined-_rowNumber}`),
                        },
                        {
                          predicate: namedNode("rr:termType"),
                          object: namedNode("rr:IRI"),
                        },
                      ]
                    ))
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
                          // TODO test if becomes IRI
                          object: namedNode(('owl:NamedIndividual')),
                        }),
                      },
                      // {
                      //   predicate: namedNode("rr:termType"),
                      //   object: namedNode("rr:IRI"),
                      // },
                    ])
                  );
                  writer.addQuad(
                    namedNode(":TriplesMap"),
                    namedNode("rr:predicateObjectMap"),
                    writer.blank([
                      {
                        predicate: namedNode("rr:predicate"),
                        object: namedNode("rdf:value"),
                      },
                      {
                        predicate: namedNode("rr:objectMap"),
                        object: writer.blank({
                          predicate: namedNode("rr:reference"),
                          // TODO test if literal is correct refined value
                          object: literal((`${colName}-refined`)),
                        }),
                      },
                    ])
                  );
                  writer.addQuad(
                    namedNode(":TriplesMap"),
                    namedNode("rr:predicateObjectMap"),
                    writer.blank([
                      {
                        predicate: namedNode("rr:predicate"),
                        object: namedNode("rdf:comment"),
                      },
                      {
                        predicate: namedNode("rr:objectMap"),
                        object: writer.blank({
                          predicate: namedNode("rr:constant"),
                          object: literal(('Refined literal value')),
                        }),
                      },
                    ])
                  );
                } else {
                  // if refined has sameAs and yields IRI
                  writer.addQuad(
                    namedNode(":TriplesMap"),
                    namedNode("rr:predicateObjectMap"),
                    writer.blank([
                      {
                        predicate: namedNode("rr:predicate"),
                        object: namedNode(
                          header.columnRefinement.KeepOriginalValueOptions.customPredicateIRI
                            ? `${header.columnRefinement.KeepOriginalValueOptions.customPredicateIRI}`
                            : header.propertyIri
                        ),
                      },
                      {
                        predicate: namedNode("rr:objectMap"),
                        object: writer.blank(
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

                        ),
                      },
                    ])
                  );
                }
                // @philipperenzen
                // TODO make else case should also work for undefined yieldsIRI/Literal => should create IRI from template
              } else {
                // normal refined without owl:sameAs relationship
                writer.addQuad(
                  namedNode(":TriplesMap"),
                  namedNode("rr:predicateObjectMap"),
                  writer.blank([
                    {
                      predicate: namedNode("rr:predicate"),
                      object: namedNode(
                        header.columnRefinement.KeepOriginalValueOptions.customPredicateIRI
                          ? `${header.columnRefinement.KeepOriginalValueOptions.customPredicateIRI}`
                          : header.propertyIri
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
              }
            } else {
              // for the original data (unrefined) that we want to keep as well
              // add each seperately
              if (header.columnRefinement.KeepOriginalValueOptions.owlSameAsRelationship) {
                // if the original data transformation should be kept as an IRI or Literal
                if (header.columnRefinement.yieldsLiteral) {
                  writer.addQuad(
                    namedNode(":TriplesMap"),
                    namedNode("rr:predicateObjectMap"),
                    writer.blank([
                      {
                        predicate: namedNode("rr:predicate"),
                        object: namedNode(
                          header.columnRefinement.KeepOriginalValueOptions.customPredicateIRI
                            ? `${header.columnRefinement.KeepOriginalValueOptions.customPredicateIRI}`
                            : header.propertyIri
                        ),
                      },
                      {
                        predicate: namedNode("rr:objectMap"),
                        object: writer.blank(
                          [
                            {
                              predicate: namedNode("rml:template"),
                              // TODO check if this worked!! for row numbers
                              object: literal(`${getBasePredicateIri(baseIri)}{${header.columnName}-_rowNumber}`),
                            },
                            {
                              predicate: namedNode("rr:termType"),
                              object: namedNode("rr:IRI"),
                            },
                          ]
                        ),
                      },
                    ])
                  )
                  writer.addQuad(
                    namedNode(":TriplesMap"),
                    namedNode("rr:subjectMap"),
                    writer.blank(
                      [
                        {
                          predicate: namedNode("rml:template"),
                          // TODO check if this worked!! for row numbers
                          object: literal(`${getBasePredicateIri(baseIri)}{${header.columnName}-_rowNumber}`),
                        },
                        {
                          predicate: namedNode("rr:termType"),
                          object: namedNode("rr:IRI"),
                        },
                      ]
                    ))
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
                          // TODO test if becomes IRI
                          object: namedNode(('owl:NamedIndividual')),
                        }),
                      },
                      // {
                      //   predicate: namedNode("rr:termType"),
                      //   object: namedNode("rr:IRI"),
                      // },
                    ])
                  );
                  writer.addQuad(
                    namedNode(":TriplesMap"),
                    namedNode("rr:predicateObjectMap"),
                    writer.blank([
                      {
                        predicate: namedNode("rr:predicate"),
                        object: namedNode("rdf:value"),
                      },
                      {
                        predicate: namedNode("rr:objectMap"),
                        object: writer.blank({
                          predicate: namedNode("rr:reference"),
                          // TODO test if literal is correct refined value
                          object: literal((`${colName}`)),
                        }),
                      },
                    ])
                  );
                  writer.addQuad(
                    namedNode(":TriplesMap"),
                    namedNode("rr:predicateObjectMap"),
                    writer.blank([
                      {
                        predicate: namedNode("rr:predicate"),
                        object: namedNode("rdf:comment"),
                      },
                      {
                        predicate: namedNode("rr:objectMap"),
                        object: writer.blank({
                          predicate: namedNode("rr:constant"),
                          object: literal(('Original literal value')),
                        }),
                      },
                    ])
                  );
                  // adding owl:sameAs relationship
                  writer.addQuad(
                    namedNode(":TriplesMap"),
                    namedNode("rr:predicateObjectMap"),
                    writer.blank([
                      {
                        predicate: namedNode("rr:predicate"),
                        object: namedNode("owl:sameAs"),
                      },
                      {
                        predicate: namedNode("rr:objectMap"),
                        object: writer.blank([
                          {
                            predicate: namedNode("rml:template"),
                            // TODO check if this worked!! for row numbers
                            object: literal(`${getBasePredicateIri(baseIri)}{${header.columnName}-_rowNumber}`),
                          },
                          {
                            predicate: namedNode("rr:termType"),
                            object: namedNode("rr:IRI"),
                          },
                        ]),
                      },
                    ])
                  );

                } else {
                  // if original has sameAs and yields IRI
                  writer.addQuad(
                    namedNode(":TriplesMap"),
                    namedNode("rr:predicateObjectMap"),
                    writer.blank([
                      {
                        predicate: namedNode("rr:predicate"),
                        object: namedNode(
                          header.columnRefinement.KeepOriginalValueOptions.customPredicateIRI
                            ? `${header.columnRefinement.KeepOriginalValueOptions.customPredicateIRI}`
                            : header.propertyIri
                        ),
                      },
                      {
                        predicate: namedNode("rr:objectMap"),
                        object: writer.blank(
                          [
                            {
                              predicate: namedNode("rml:reference"),
                              object: literal(`${header.columnName}`),
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
                  writer.addQuad(
                    namedNode(":TriplesMap"),
                    namedNode("rr:subjectMap"),
                    writer.blank(
                      [
                        {
                          predicate: namedNode("rml:template"),
                          // TODO check if this worked!! for row numbers
                          object: writer.blank(
                            [
                              {
                                predicate: namedNode("rml:reference"),
                                object: literal(`${header.columnName}`),
                              },
                              {
                                predicate: namedNode("rr:termType"),
                                object: namedNode("rr:IRI"),
                              },
                            ]

                          ),
                        },
                        {
                          predicate: namedNode("rr:termType"),
                          object: namedNode("rr:IRI"),
                        },
                      ]
                    ))
                  writer.addQuad(
                    namedNode(":TriplesMap"),
                    namedNode("rr:predicateObjectMap"),
                    writer.blank([
                      {
                        predicate: namedNode("rr:predicate"),
                        object: namedNode('owl:sameAs'),
                      },
                      {
                        predicate: namedNode("rr:objectMap"),
                        object: writer.blank(
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

                        ),
                      },

                    ])
                  );
                }
              }
              else {
                // normal original without owl:sameAs relationship
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
                        header.columnRefinement.KeepOriginalValueOptions.keepAsLiteral === true
                          ? [
                            {
                              predicate: namedNode("rml:reference"),
                              object: literal(`${header.columnName}`),
                            },
                          ]
                          : header.columnRefinement.KeepOriginalValueOptions.keepAsIri === true
                            ? [
                              {
                                predicate: namedNode("rml:reference"),
                                object: literal(`${header.columnName}`),
                              },
                              {
                                predicate: namedNode("rr:termType"),
                                object: namedNode("rr:IRI"),
                              },
                            ] : [
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
