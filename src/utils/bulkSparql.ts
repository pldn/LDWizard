
import { DataFactory } from 'n3'
import RdfJs from 'rdf-js'
import sparqljs from 'sparqljs'
const { Parser, Generator } = sparqljs

interface Opts {
  /**
   * The name of the returned/enriched binding
   * 
   * it defaults to "transformed"
   */ 
  transformedValueName?: string

  /**
   * The name of the value that is used to perform search/transformation
   * 
   * it defaults to "searchValue"
   */ 
  searchValueName?: string

  /**
   * Optional value to slice the batch in parts
   */
  batchSize?: number
  
  /**
   * Required URL/string of the SPARQL endpoint
   */
  sparqlEndpoint: string | URL,

  /**
   * Optional extra arguments that the SPARQL endpount might need (e.g. credentials)
   * 
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Request
   */
  request?: RequestInit,

  /**
   * An optional transfomer function that preprocesses the CSV value
   * 
   * @example: (value: string) => DataFactory.literal(value, 'nl')
   * @param value the original string value from the CSV
   * @returns NamedNode or Literal
   */
  transformer?: (value: string) => RdfJs.NamedNode | RdfJs.Literal
}

const isVariable = (val: any): val is RdfJs.Variable => {
  return typeof val === 'object' &&
    Object.keys(val).includes('termType') &&
    val.termType === 'Variable' &&
    Object.keys(val).includes('value')
}

export default async function bulkSparql(query: string, values: string[], opts: Opts): Promise<string[]> {
  const request: RequestInit = {
    method: 'POST',
    headers: {
      Accept: "application/sparql-results+json",
      "Content-Type": "application/x-www-form-urlencoded",
      ...opts.request?.headers ?? {}
    },
    ...opts.request ?? {}
  }

  const optsWithDefault: Required<Opts> = {
    transformedValueName: 'transformed',
    request,
    searchValueName: 'searchValue',
    batchSize: 0,
    transformer: (value: string) => DataFactory.literal(value),
    ...opts
  }
  const parsed = (new Parser()).parse(query)
  // check if the query is a select query
  if (parsed.type !== 'query') {
    throw new Error(`Unexpected query type '${parsed.type}', expected 'query'`)    
  }
  if (parsed.queryType !== 'SELECT') {
    throw new Error(`Unexpected query type '${parsed.queryType}', expected 'SELECT'`)    
  }

  // the transformedValue must be in the bindings:
  let found = false
  for (const variable of parsed.variables) {
    if (isVariable(variable) && variable.value === optsWithDefault.transformedValueName) {
      found = true
    }
  }
  if (!found) {
    throw new Error(`Expected variable '${optsWithDefault.transformedValueName}' to be in the result bindings but it is not.`)
  }

  // remove the prefixes from the query template, we need to add them later in the union query:
  const prefixes = Object.keys(parsed.prefixes).map(prefix => `prefix ${prefix}: <${parsed.prefixes[prefix]}>`).join('\n')
  parsed.prefixes = {}

  // for each resultset, we only want the first one
  parsed.limit = 1

  const where = parsed.where ?? []
  const variables = parsed.variables ?? []
  
  // make sure the variable name is prependend by a '?':
  const searchValueName = '?' + optsWithDefault.searchValueName.replace(/^\?/, '')

  // here we will store all the individual queries
  const union: string[] = []

  // here we will store all transformed values:
  const enriched: string[] = values.map(_ => '')

  function buildUnionQuery() {
    return `${prefixes}\nselect ?${optsWithDefault.transformedValueName} ?rowIx where {\n${union.join("\nunion\n")}\n}`
  }
  let rowIx = 0
  for (const value of values) {
    // add the rownumber to the bindings:
    const row = {
      expression:DataFactory.literal(rowIx, DataFactory.namedNode('https://www.w3.org/2001/XMLSchema#integer')),
      variable: DataFactory.variable('rowIx')
    }
    // @ts-ignore
    parsed.variables = [...variables, row]

    // inject the searchValue as a SPARQL value:
    parsed.where = [
      ...where,
      { type: 'values', values: [{[searchValueName]: optsWithDefault.transformer(value)}]}
    ]
    union.push(`\n###### row ${rowIx} ######\n{\n${(new Generator()).stringify(parsed)}\n}`)
    if (optsWithDefault.batchSize !== undefined && optsWithDefault.batchSize > 0 && ((rowIx - 1) % optsWithDefault.batchSize) === 0) {
      // perform the query:
      await executeQuery(buildUnionQuery(), enriched, optsWithDefault)
      union.length = 0
    }
    rowIx++
  }
  if (union.length > 0)  {
    // perform the query:
    await executeQuery(buildUnionQuery(), enriched, optsWithDefault)
  }

  // return the enriched values:
  return enriched
}

async function executeQuery(query: string, enriched: string[], opts: Required<Opts>): Promise<string[]> {
  const body = 'query=' + encodeURIComponent(query)

  return fetch(opts.sparqlEndpoint, {...opts.request, body})
    .then(res => res.json())
    .then(res => res.results.bindings)
    .then(bindings => {
      for (const binding of bindings) {
        const transformed = binding[opts.transformedValueName]
        enriched[parseInt(binding.rowIx.value)] = transformed.value
      }
      return enriched
    })
}
