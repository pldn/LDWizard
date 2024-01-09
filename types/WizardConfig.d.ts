export type PublishElement = "download" | "triplyDB";
export type PrefixEntry = {
    prefixLabel: string;
    iri: string;
};
export type TriplyDbReference = {
    label: string;
    link: string;
};
export type ColumnRefinementType = "single" | "double-column" | "single-param";
export type KeepOriginalValueOptions = {
    keepValue: boolean;
    customPredicateIRI?: string;
    keepAsIri?: boolean
    keepAsLiteral?: boolean
    owlSameAsRelationship: boolean
};
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

export type ShaclShapeSetting = {
    url: string;
    targetShape?: string;
};
export default interface WizardConfig {
    /**
     * Branding
     */
    appName?: string;
    dataplatformLink?: string;
    documentationLink?: string;
    repositoryLink?: string;
    primaryColor?: string;
    secondaryColor?: string;
    icon?: string;
    favIcon?: string;
    homepageMarkdown?: string;
    /**
     * App settings
     */
    defaultBaseIri?: string;
    publishOrder?: PublishElement[];
    /**
     * Helper Settings
     */
    predicateConfig?: {
        method: "elastic" | "sparql";
        endpoint: string;
    };
    classConfig?: {
        method: "elastic" | "sparql";
        endpoint: string;
    };
    triplyDbInstances?: TriplyDbReference[];
    getAllowedPrefixes?: () => Promise<PrefixEntry[]>;
    /**
     * Refinement options
     */
    columnRefinements?: ColumnRefinement[];
    exampleCSV?: string;
    newDatasetAccessLevel?: "private" | "internal" | "public";
    shaclShapes?: ShaclShapeSetting[];
    requireShaclShape?: boolean;
}
