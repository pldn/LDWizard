import Rdf from "rdf-js";
/**
 * General definitions
 */
export type TransformationType = "cow" | "rml";
export type Matrix = Array<Array<string>>;
export type Source = File | string;
export type TransformationScript = string | {};
export type TransformationOutput = string;
export type AutocompleteSuggestion = string | Rdf.NamedNode | { iri: string; description?: string };
export type ColumnConfiguration = {
  columnName: string;
  disabled?: boolean;
  columnRefinement?: ColumnRefinementSetting | undefined;
  propertyIri?: string;
  shaclColumn?: boolean
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
  shaclShape: string,
  requireShaclShape: boolean,
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

/**
 * Define transformation scripts in configuration
 */
export interface BaseColumnRefinement {
  label: string;
  description: string;
  type: ColumnRefinementType;
  transformation: unknown;
}
export interface SingleColumnRefinement extends BaseColumnRefinement {
  type: "single";
  transformation: (value: string) => Promise<string | undefined>;
}
export interface DoubleColumnRefinement extends BaseColumnRefinement {
  type: "double-column";
  transformation: (firstColumn: string, selectedColumn: string) => Promise<string | undefined>;
}
export interface SingleColumnParamRefinement extends BaseColumnRefinement {
  type: "single-param";
  transformation: (value: string, iriPrefix: string) => Promise<string | undefined>;
}

export type ColumnRefinement = SingleColumnRefinement | DoubleColumnRefinement | SingleColumnParamRefinement;

export type ColumnRefinements = ColumnRefinement[];

/**
 * Use internally to store additional data needed for transformation
 */

interface BaseColumnRefinementSetting extends Pick<BaseColumnRefinement, "label" | "type" > {
  data?: unknown;
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