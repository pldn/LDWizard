/**
 * Standalone typings for the LD-Wizard config files
 */
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
};
export interface BaseColumnRefinement {
    label: string;
    description: string;
    type: ColumnRefinementType;
    yieldsLiteral?: boolean;
    yieldsIri?: boolean;
    keepOriginalValue?: KeepOriginalValueOptions;
}
export interface SingleBaseColumnRefinement extends BaseColumnRefinement {
    transformation: unknown;
}
export interface BulkBaseColumnRefinement extends BaseColumnRefinement {
    bulkTransformation: unknown;
}
export interface SingularSingleColumnRefinement extends SingleBaseColumnRefinement {
    type: "single";
    transformation: (value: string) => Promise<string | undefined>;
}
export interface SingularDoubleColumnRefinement extends SingleBaseColumnRefinement {
    type: "double-column";
    transformation: (firstColumn: string, selectedColumn: string) => Promise<string | undefined>;
}
export interface SingularColumnParamRefinement extends SingleBaseColumnRefinement {
    type: "single-param";
    transformation: (value: string, iriPrefix: string) => Promise<string | undefined>;
}
export interface BulkSingleColumnRefinement extends BulkBaseColumnRefinement {
    type: "single";
    bulkTransformation: (value: string[]) => Promise<string[] | undefined>;
}
export interface BulkDoubleColumnRefinement extends BulkBaseColumnRefinement {
    type: "double-column";
    bulkTransformation: (firstColumn: string[], selectedColumn: string[]) => Promise<string[] | undefined>;
}
export interface BulkSingleColumnParamRefinement extends BulkBaseColumnRefinement {
    type: "single-param";
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
//# sourceMappingURL=WizardConfig.d.ts.map