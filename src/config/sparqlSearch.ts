const CLASS_SEARCH_QUERY = (term: string) => `prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
select distinct ?iri ?description {
  {
    ?iri a rdfs:Class.
    ?iri rdfs:comment ?description.
    ?iri rdfs:label ?label.
    filter(regex(str(?description), "${term}") ||
           regex(str(?iri), "${term}") ||
           regex(str(?label), "${term}"))
  } union {
    ?iri a rdfs:Class.
    ?iri rdfs:comment ?description.
    ?iri rdfs:label ?label.
  }
}
limit 10`;

const PREDICATE_SEARCH_CONFIG = (term: string) => `prefix owl: <http://www.w3.org/2002/07/owl#>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
select distinct ?iri ?description {
  {
    bind("/ISO3166" as ?apiVariable)
    {
      ?iri a rdf:Property.
    } union {
      ?iri a owl:DatatypeProperty.
    } union {
      ?iri a owl:ObjectProperty.
    }
    ?iri rdfs:comment ?description.
    ?iri rdfs:label ?label.
    filter(regex(str(?description), "${term}") ||
           regex(str(?iri), "${term}") ||
           regex(str(?label), "${term}"))
  } union {
    {
      ?iri a rdf:Property.
    } union {
      ?iri a owl:DatatypeProperty.
    } union {
      ?iri a owl:ObjectProperty.
    }
    ?iri rdfs:comment ?description.
    ?iri rdfs:label ?label.
  }
}
limit 10`;

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
