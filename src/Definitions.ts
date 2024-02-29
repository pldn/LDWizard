import Rdf from "rdf-js";
import { PrefixesArray } from "@triply/utils/prefixUtils.ts";
/**
 * General definitions
 */
export type TransformationType = "cow" | "rml" | "yarrrml";
export type Matrix = Array<Array<string>>;
export type Source = File | string;
export type TransformationScript = string | {};
export type TransformationOutput = string;
export type AutocompleteSuggestion = string | Rdf.NamedNode | { iri: string; description?: string };
export type ColumnConfiguration = {
  columnName: string;
  columnRefinement?: ColumnRefinementSetting | undefined;
  propertyIri?: string;
  disabled?: boolean;
  shaclColumn?: boolean;
};
export interface TransformationConfiguration {
  /** Base IRI */
  baseIri: string | Rdf.NamedNode;
  /** Selected key column */
  key?: number;
  /** Column configuration */
  columnConfiguration: ColumnConfiguration[];
  /** Needed for RML to specify the input file */
  sourceFileName: string;
  /** Class URI applied to each row */
  resourceClass: string;
  /** SHACL shape */
  shaclShape: string;
  requireShaclShape: boolean;
  /** Meta information about the CSV dialect */
  csvProps: {
    delimiter: string;
  };
}

/**
 * Add source data
 */
export type AddSourceFile = (file: Source) => void;

/**
 * Add transformation script
 */
export type AddTransformationScript = (file: Source, type: TransformationType) => void;

/**
 * Convert the source data to an internal matrix structure
 */
export type SourceFileToMatrix = (file: Source) => Promise<Matrix>;

/**
 * Set the base IRI
 */
export type SetBaseIri = (baseIri: string | Rdf.NamedNode) => void;

/**
 * Get suggestions for the class, given some textual input
 */
export type GetClassSuggestions = (partialString: string) => Promise<Array<AutocompleteSuggestion>>;

/**
 * Select a key column from the matrix
 */
export type SelectKeyColumn = (key: number) => void;

/**
 * Get suggestions for a property given some textual input
 */
export type GetPropertySuggestions = (partialString: string) => Promise<Array<AutocompleteSuggestion>>;

/**
 * Get the transformation script from the internal transformation configuration
 */
export type GetTransformationScript = (
  transformationConfiguration: TransformationConfiguration,
  forType: TransformationType
) => Promise<TransformationScript>;

export interface ApplyTransformationI {
  config: TransformationConfiguration;
  type: TransformationType;
  source: Source | Matrix;
  prefixes: PrefixesArray
}
/**
 * Apply the transformation to the source data
 */
export type ApplyTransformation = (opts: ApplyTransformationI) => Promise<TransformationOutput>;

export interface UploadTransformationI<P> {
  type: TransformationType;
  source: Source;
  transformation: TransformationScript;
  output: TransformationOutput;
  publishConfiguration: P;
}
/**
 * Upload the source data, transformation script, and transformation output to a public environment
 */
export type UploadTransformation<P> = (opts: UploadTransformationI<P>) => Promise<void>;

/**
 * Interface used for defining refinement option
 */

export type ColumnRefinementType = "single" | "double-column" | "to-iri" | "single-param";
export type KeepOriginalValueOptions = {
  keepValue: boolean
  customPredicateIRI?: string
  keepAsIri?: boolean
  keepAsLiteral?: boolean
  owlSameAsRelationship?: boolean
}
/**
 * Define transformation scripts in configuration
 */
export interface BaseColumnRefinement {
  label: string;
  description: string;
  /**
   * Defines the type of column refinement
   * @property "single": a single column's values will be used for refinement/transformation
   * @property "double-column" two different columns's values will be used for refinement/transformation
   * @property "single-param" a single column's values with one parameter will be used for refinement/transformation
   */
  type: ColumnRefinementType;
  yieldsLiteral?: boolean;
  yieldsIri?: boolean;
  keepOriginalValue?: KeepOriginalValueOptions;
}
export interface SingleBaseColumnRefinement extends BaseColumnRefinement {
  transformation: unknown
}
export interface BulkBaseColumnRefinement extends BaseColumnRefinement {
  /**
   * Only used for `bulkTransformation`s
   *
   * Size of elements of total size to perform bulk opperation on
   * @example batchSize = 5 in array [1,2,3,4,5,6,7,8,9,10,11] yields:
   * first batch => 1,2,3,4,5
   * second batch => 6,7,8,9,10
   * third batch => 11
   */
  batchSize?: number
  bulkTransformation: unknown
}
export interface SingularSingleColumnRefinement extends SingleBaseColumnRefinement {
  /**
   * @property a single column's values will be used for refinement/transformation
   */
  type: "single";
  /**
   * @param value value in column row used for transformation
   * @returns transformed value of column row
   */
  transformation: (value: string) => Promise<string | undefined>;
}
export interface SingularDoubleColumnRefinement extends SingleBaseColumnRefinement {
  /**
   * @property two different columns's values will be used for refinement/transformation
   */
  type: "double-column";
  /**
   * @param value value in column row used for transformation
   * @returns transformed value of column row
   */
  transformation: (firstColumn: string, selectedColumn: string) => Promise<string | undefined>;
}
export interface SingularColumnParamRefinement extends SingleBaseColumnRefinement {
  /**
   * @property a single column's values with one parameter will be used for refinement/transformation
   */
  type: "single-param";
  /**
   * @param value value in column row used for transformation
   * @returns transformed value of column row
   */
  transformation: (value: string, iriPrefix: string) => Promise<string | undefined>;
}
export interface BulkSingleColumnRefinement extends BulkBaseColumnRefinement {
  /**
   * @property a single column's values will be used for refinement/transformation
   */
  type: "single";
  /**
   * @param value values in column used for transformation (all row values as array)
   * @returns transformed column values
   */
 bulkTransformation: (value: string[]) => Promise<string[] | undefined>;
}
export interface BulkDoubleColumnRefinement extends BulkBaseColumnRefinement {
  /**
   * @property two different columns's values will be used for refinement/transformation
   */
  type: "double-column";
  /**
   * @param value values in column used for transformation (all row values as array)
   * @returns transformed column values
   */
 bulkTransformation: (firstColumn: string[], selectedColumn: string[]) => Promise<string[] | undefined>;
}
export interface BulkSingleColumnParamRefinement extends BulkBaseColumnRefinement {
  /**
   * @property a single column's values with one parameter will be used for refinement/transformation
   */
  type: "single-param";
  /**
   *
   * @param value values in column used for transformation (all row values as array)
   * @returns transformed column values
   */
  bulkTransformation: (value: string[], iriPrefix: string) => Promise<string[] | undefined>;
}

export type ColumnRefinement = SingularSingleColumnRefinement | SingularDoubleColumnRefinement | SingularColumnParamRefinement | BulkSingleColumnRefinement | BulkDoubleColumnRefinement | BulkSingleColumnParamRefinement;

export type ColumnRefinements = ColumnRefinement[];

/**
 * Use internally to store additional data needed for transformation
 */

interface BaseColumnRefinementSetting extends Pick<BaseColumnRefinement, "label" | "type" > {
  data?: unknown;
  yieldsIri?: boolean;
  yieldsLiteral?: boolean;
  KeepOriginalValueOptions?: KeepOriginalValueOptions
}
interface SingleColumnRefinementSetting extends BaseColumnRefinementSetting {
  type: "single";
  data?: never;
}
interface DoubleColumnRefinementSetting extends BaseColumnRefinementSetting {
  type: "double-column";
  data: { secondColumnIdx: number };
}
interface SingleColumnParamRefinementSetting extends BaseColumnRefinementSetting {
  type: "single-param";
  data: { iriPrefix: string };
}
interface ToIriColumnRefinementSetting extends BaseColumnRefinementSetting {
  type: "to-iri";
  data: { iriPrefix: string };
}
export type ColumnRefinementSetting =
  | SingleColumnRefinementSetting
  | DoubleColumnRefinementSetting
  | SingleColumnParamRefinementSetting
  | ToIriColumnRefinementSetting;

export type ShaclShapeSetting = {
  url: string,
  targetShape?: string
};

export type ShaclShapeMeta = {
  iri: string,
  description: string,
  store: Rdf.Store,
  targetClasses: string[],
  prefixes: { [key: string]: string }
  properties: { [key: string]: any }[]
};