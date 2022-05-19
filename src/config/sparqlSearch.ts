const CLASS_SEARCH_QUERY = (term: string) => `prefix owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
select distinct ?iri ?description {
  {
    # Support both OWL and RDFS classes.
    {
      ?iri a owl:Class.
    } union {
      ?iri a rdfs:Class.
    }
    ?iri
      rdfs:comment ?description;
      rdfs:label ?label.
    # Prefer classes that match with the search term.
    filter(
      regex(str(?description), "${term}", "i") ||
      # Sometimes IRIs contain substring that can be used to filter.
      regex(str(?iri), "${term}", "i") ||
      regex(str(?label), "${term}", "i"))
  } union {
    # Since the above regex match is relatively crude,
    # also return a tail of arbitrary classes.
    {
      ?iri a owl:Class.
    } union {
      ?iri a rdfs:Class.
    }
    ?iri
      rdfs:comment ?description;
      rdfs:label ?label.
  }
}
limit 10`;

const PREDICATE_SEARCH_CONFIG = (term: string) => `prefix owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
select distinct ?iri ?description {
  {
    # Support both OWL and RDF properties.
    {
      ?iri a owl:DatatypeProperty.
    } union {
      ?iri a owl:ObjectProperty.
    } union {
      ?iri a rdf:Property.
    }
    ?iri
      rdfs:comment ?description;
      rdfs:label ?label.
    # Prefer classes that match with the search term.
    filter(
      regex(str(?description), "${term}", "i") ||
      # Sometimes IRIs contain substring that can be used to filter.
      regex(str(?iri), "${term}", "i") ||
      regex(str(?label), "${term}", "i"))
  } union {
    # Since the above regex match is relatively crude,
    # also return a tail of arbitrary properties.
    {
      ?iri a rdf:Property.
    } union {
      ?iri a owl:DatatypeProperty.
    } union {
      ?iri a owl:ObjectProperty.
    }
    ?iri
      rdfs:comment ?description;
      rdfs:label ?label.
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
  const headers = new Headers();
  headers.append("Accept", "application/sparql-results+json;q=0.9,application/json;q=0.8,*/*;q=0.7");
  const result = await fetch(request.toString(), { method: "GET", headers: headers });
  if (result.ok) {
    const json: any = await result.json();
    const sparqlResults: SparqlResult[] = [];
    // Convert standard SPARQL results JSON to a simpler object
    for (const row of json.results.bindings) {
      const rowResults: any = {};
      for (const variable of Object.keys(row)) {
        if (row[variable].value) {
          rowResults[variable] = row[variable].value;
        }
      }
      sparqlResults.push(rowResults);
    }
    return sparqlResults;
  }
  return [];
}

export function getClassSuggestions(searchTerm: string, endpoint: string) {
  return getAutocompleteResults(searchTerm, "class", endpoint);
}

export function getPropertySuggestions(searchTerm: string, endpoint: string) {
  return getAutocompleteResults(searchTerm, "property", endpoint);
}
