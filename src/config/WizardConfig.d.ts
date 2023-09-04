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
export default interface WizardConfig {
    appName?: string;
    dataplatformLink?: string;
    documentationLink?: string;
    repositoryLink?: string;
    primaryColor?: string;
    secondaryColor?: string;
    icon?: string;
    favIcon?: string;
    homepageMarkdown?: string;
    defaultBaseIri?: string;
    publishOrder?: PublishElement[];
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
    columnRefinements?: ColumnRefinement[];
    exampleCSV?: string;
    newDatasetAccessLevel?: "private" | "internal" | "public";
}
//# sourceMappingURL=WizardConfig.d.ts.map