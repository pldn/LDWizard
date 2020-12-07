const CLASS_SEARCH_QUERY = (term: string) => `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT distinct ?iri ?description WHERE {
  {
    ?iri a rdfs:Class .
    ?iri rdfs:comment ?description .
    ?iri rdfs:label ?label .
    FILTER(regex(str(?description),str("${term}"))|| regex(str(?iri),str("${term}"))||regex(str(?label),str("${term}")))
  } union {
    ?iri a rdfs:Class .
    ?iri rdfs:comment ?description .
    ?iri rdfs:label ?label.
  }
} LIMIT 10`;

const PREDICATE_SEARCH_CONFIG = (term: string) => `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT distinct ?iri ?description WHERE {
  {
    BIND("/ISO3166" as ?apiVariable)
    ?iri a rdf:Property .
    ?iri rdfs:comment ?description .
    ?iri rdfs:label ?label .
    FILTER(regex(str(?description),str("${term}"))|| regex(str(?iri),str("${term}"))||regex(str(?label),str("${term}")))
  } union {
    ?iri a rdf:Property .
    ?iri rdfs:comment ?description .
    ?iri rdfs:label ?label.
  }
} LIMIT 10`;

interface SparqlResult {
  iri: string;
  resource: string;
}
/**
 *
 */

interface AutocompleteSuggestion {
  iri: string;
  description?: string;
}

/**
 * Gets autocomplete results
 * @param searchTerm The term to search for
 * @param type Which type of autocompletions you want ("class" || "property")
 * @param [location] location of the autocomplete ElasticSearch endpoint
 * @returns autocomplete results
 */
async function getAutocompleteResults(
  searchTerm: string,
  type: "class" | "property",
  location: string
): Promise<AutocompleteSuggestion[]> {
  const query = type === "class" ? CLASS_SEARCH_QUERY : PREDICATE_SEARCH_CONFIG;
  const request = new URL(location);
  request.search = `query=${encodeURI(query(searchTerm))}`;
  const result = await fetch(request.toString());
  if (result.ok) {
    const json: SparqlResult[] = await result.json();
    return json;
  }
  return [];
}

export function getClassSuggestions(searchTerm: string, endpoint: string) {
  return getAutocompleteResults(searchTerm, "class", endpoint);
}

export function getPropertySuggestions(searchTerm: string, endpoint: string) {
  return getAutocompleteResults(searchTerm, "property", endpoint);
}
