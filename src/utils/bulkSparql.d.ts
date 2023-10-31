import RdfJs from 'rdf-js';
interface Opts {
    /**
     * The name of the returned/enriched binding
     *
     * it defaults to "transformed"
     */
    transformedValueName?: string;
    /**
     * The name of the value that is used to perform search/transformation
     *
     * it defaults to "searchValue"
     */
    searchValueName?: string;
    /**
     * Optional value to slice the batch in parts
     */
    batchSize?: number;
    /**
     * Required URL/string of the SPARQL endpoint
     */
    sparqlEndpoint: string | URL;
    /**
     * Optional extra arguments that the SPARQL endpount might need (e.g. credentials)
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Request
     */
    request?: RequestInit;
    /**
     * An optional transfomer function that preprocesses the CSV value
     *
     * @example: (value: string) => DataFactory.literal(value, 'nl')
     * @param value the original string value from the CSV
     * @returns NamedNode or Literal
     */
    transformer?: (value: string) => RdfJs.NamedNode | RdfJs.Literal;
}
export default function bulkSparql(query: string, values: string[], opts: Opts): Promise<string[]>;
export {};
//# sourceMappingURL=bulkSparql.d.ts.map