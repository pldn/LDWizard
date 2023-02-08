import { ShaclShapeMeta, ShaclShapeSetting } from "../Definitions";
import { Parser, Store, DataFactory, Term } from "n3";
const { namedNode } = DataFactory;

const cache: Map<any, ShaclShapeMeta[]> = new Map()

const resolveValue = (value: Term, store: Store): any => {
  if (value.termType === 'BlankNode') {
    const connectedQuads = store.getQuads(namedNode(value.id), null, null, null)
    return connectedQuads
      .flatMap(quad => resolveValue(quad.object, store))
      .filter(item => !['http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'].includes(item))
  }

  return value.value
}

export default async function (shaclShapeSettings: ShaclShapeSetting[]): Promise<ShaclShapeMeta[]> {
  if (cache.has(shaclShapeSettings)) return cache.get(shaclShapeSettings)!

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

    const properties = store.getQuads(null, namedNode("http://www.w3.org/ns/shacl#property"), null, null)
      .map(propertyQuad => {
        const property: { [key: string]: any } = {}
        const subProperties = store.getQuads(propertyQuad.object, null, null, null)
        
        for (const subProperty of subProperties) {
          const subPropertyName = subProperty.predicate.value.includes("http://www.w3.org/ns/shacl#") ? subProperty.predicate.value.split(/\/|#/g).pop()! : subProperty.predicate.value
          property[subPropertyName] = resolveValue(subProperty.object, store)
        }

        return property
      })

    return { iri, description, store, targetClasses, properties } as ShaclShapeMeta
  })

  const shaclShapeMetas = await Promise.all(promises)
  cache.set(shaclShapeSettings, shaclShapeMetas)
  return shaclShapeMetas
}