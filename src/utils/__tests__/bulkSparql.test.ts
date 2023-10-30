import { DataFactory } from 'n3'
import bulkSparql from '../bulkSparql.js'
import { assert } from "chai";

const rq = `
prefix skos: <http://www.w3.org/2004/02/skos/core#>
prefix sor: <https://data.kkg.kadaster.nl/sor/model/def/>
select ?transformed ?obj where {
  ?transformed skos:prefLabel ?obj; a sor:OpenbareRuimte
  filter(sameTerm(?obj, ?searchValue))
}
`
const sparqlEndpoint = 'https://api.labs.kadaster.nl/datasets/dst/kkg/services/default/sparql'
const transformer = (value: string) => DataFactory.literal(value, 'nl')
const streets = ['Fnidsen', 'Hoogeweg']
const streetsAsIris = ['https://data.kkg.kadaster.nl/id/openbareRuimte/0361300000001290', 'https://data.kkg.kadaster.nl/id/openbareRuimte/0537300000000209']

describe("bulkSparql", function () {
  it("should work against Kadaster KG", async function () {
     let enriched = await bulkSparql(rq, streets, {sparqlEndpoint, transformer, transformedValueName: 'obj'})
     assert.deepEqual(streets, enriched)
     enriched = await bulkSparql(rq, streets, {sparqlEndpoint, transformer})
     assert.deepEqual(streetsAsIris, enriched)
  })
  it("should work against Kadaster KG with batchsize 1", async function () {
     let enriched = await bulkSparql(rq, streets, {sparqlEndpoint, transformer, transformedValueName: 'obj', batchSize: 1})
     assert.deepEqual(streets, enriched)
     enriched = await bulkSparql(rq, streets, {sparqlEndpoint, transformer, batchSize: 1})
     assert.deepEqual(streetsAsIris, enriched)
  })
})

