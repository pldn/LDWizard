const CLASS_SEARCH_CONFIG = [
  {
    simple_query_string: {
      query: '"http://www.w3.org/2000/01/rdf-schema#Class" | "http://www.w3.org/2002/07/owl#Class"',
      fields: ["http://www w3 org/1999/02/22-rdf-syntax-ns#type"],
    },
  },
];

const PREDICATE_SEARCH_CONFIG = [
  {
    simple_query_string: {
      query: '"http://www.w3.org/1999/02/22-rdf-syntax-ns#Property"',
      fields: ["http://www w3 org/1999/02/22-rdf-syntax-ns#type"],
    },
  },
];

interface ShardHit {
  _id: string;
  _source: {
    "http://www w3 org/2000/01/rdf-schema#comment"?: string[];
  };
}
/**
 *
 */
interface ShardResponse {
  timed_out: boolean;
  hits: {
    hits: ShardHit[];
  };
}
interface AutocompleteSuggestion {
  iri: string;
  description?: string;
}

function getSuggestionFromBody(responseBody: ShardResponse): AutocompleteSuggestion[] {
  return responseBody.hits.hits.map((suggestion) => {
    return {
      iri: suggestion._id,
      description: suggestion._source["http://www w3 org/2000/01/rdf-schema#comment"]?.[0],
    };
  });
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
  const searchObject = {
    query: {
      bool: {
        must: type === "class" ? CLASS_SEARCH_CONFIG : PREDICATE_SEARCH_CONFIG,
        should: [
          // Search for wildcard
          {
            wildcard: { "http://www w3 org/2000/01/rdf-schema#label": searchTerm + "*" },
          },
          // Catch spelling mistakes
          { fuzzy: { "http://www w3 org/2000/01/rdf-schema#label": searchTerm } },
          // Match full IRI
          {
            match: { "@id": searchTerm },
          },
          // Search for words in descriptions
          {
            simple_query_string: {
              query: searchTerm,
              fields: ["http://www w3 org/2000/01/rdf-schema#comment"],
            },
          },
        ],
        minimum_should_match: 1,
      },
    },
  };

  const response = await fetch(location, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(searchObject),
  });
  const json: ShardResponse = await response.json();
  return getSuggestionFromBody(json);
}

export function getClassSuggestions(searchTerm: string, location: string) {
  return getAutocompleteResults(searchTerm, "class", location);
}

export function getPropertySuggestions(searchTerm: string, location: string) {
  return getAutocompleteResults(searchTerm, "property", location);
}
