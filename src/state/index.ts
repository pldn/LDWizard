import { atom } from "recoil";
import { TransformationConfiguration, Matrix } from "Definitions";
import { wizardConfig } from "config";

export const sourceState = atom<File | string | undefined>({
  key: "source",
  default: undefined,
});

export const matrixState = atom<Matrix | undefined>({
  key: "matrix",
  default: undefined,
});

export const transformationConfigState = atom<TransformationConfiguration>({
  key: "config",
  default: {
    baseIri: wizardConfig.defaultBaseIri,
    columnConfiguration: [],
    sourceFileName: "input.csv",
    csvProps: {
      delimiter: ",",
    },
  },
});
