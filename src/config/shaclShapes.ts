import { ShaclShapeMeta, ShaclShapeSetting } from "../Definitions";
import { Parser, Store, DataFactory } from "n3";
const { namedNode } = DataFactory;

export default async function (shaclShapeSettings: ShaclShapeSetting[]) {
  const promises = shaclShapeSettings.map(async shaclShapeSetting => {
    const shaclFileResponse = await fetch(shaclShapeSetting.url)

    const shaclFileText = await shaclFileResponse.text()
    const parser = new Parser()
    const quads = await parser.parse(shaclFileText)
    const store = new Store()
    store.addQuads(quads)

    const shapeClasses = store.getQuads(null, namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), namedNode("http://www.w3.org/ns/shacl#NodeShape"), null)
    const shapeIris = new Set(shapeClasses.map(shapeClass => shapeClass.subject.value))
    const iri = shaclShapeSetting.targetShape ?? shaclFileResponse.url

    if (!shapeIris.has(iri)) throw new Error(`Could not find the requested shape with IRI: ${iri} in ${[...shapeIris.values()].join(', ')}`)

    const descriptionQuads = store.getQuads(iri, namedNode("http://www.w3.org/2000/01/rdf-schema#label"), null, null)
    const description = descriptionQuads?.length ? descriptionQuads[0].object.value : ''

    const targetClasses = store.getQuads(iri, namedNode("http://www.w3.org/ns/shacl#targetClass"), null, null).map(quad => quad.object.value)

    return { iri, description, store, targetClasses } as ShaclShapeMeta
  })

  return Promise.all(promises)
}