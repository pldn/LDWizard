import { TransformationScript, TransformationConfiguration } from "Definitions";
import { DataFactory, Writer } from "n3";
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
        ]),
      },
      {
        predicate: namedNode("rml:referenceFormulation"),
        object: namedNode("ql:CSV"),
      },
    ])
  );

  // RML doesn't support adding base-iri + row-numbers as an identifier, so we use b-nodes here
  writer.addQuad(
    namedNode(":TriplesMap"),
    namedNode("rr:subjectMap"),
    writer.blank([{ predicate: namedNode("rr:termType"), object: namedNode("rr:BlankNode") }])
  );
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
          object: namedNode("http://www.w3.org/2000/01/rdf-schema#Resource"),
        }),
      },
    ])
  );
  // Add columns to the transform script
  for (const header of configuration.columnConfiguration) {
    writer.addQuad(
      namedNode(":TriplesMap"),
      namedNode("rr:predicateObjectMap"),
      writer.blank([
        {
          predicate: namedNode("rr:predicate"),
          object: namedNode(`${baseIri}${header.columnName}`),
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

export default getRmlTransformationScript;
