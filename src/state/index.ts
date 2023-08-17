import { atom, selector, DefaultValue } from "recoil";
import { TransformationConfiguration, Matrix } from "../Definitions.ts";
import { MD5 } from "jshashes";
import { wizardAppConfig } from "../config/index.ts";
const hasher = new MD5().setUTF8(true);

export const sourceState = atom<File | string | undefined>({
  key: "source",
  default: undefined,
});

const matrixAtom = atom<Matrix | undefined>({
  key: "matrix",
  default: undefined,
});

export const transformationConfigState = atom<TransformationConfiguration>({
  key: "config",
  default: {
    baseIri: wizardAppConfig.defaultBaseIri,
    columnConfiguration: [],
    sourceFileName: "input.csv",
    resourceClass: "http://www.w3.org/2000/01/rdf-schema#Resource",
    csvProps: {
      delimiter: ",",
    },
  },
});

export const matrixState = selector({
  key: "sourceState",
  get: ({ get }) => get(matrixAtom),
  set: ({ set, reset }, newValue: Matrix | undefined | DefaultValue) => {
    if (newValue instanceof DefaultValue) {
      reset(matrixAtom);
    } else {
      set(matrixAtom, newValue);
      if (newValue) {
        // @here transformations 
        set(transformationConfigState, (state) => {
          return {
            ...state,
            baseIri:
              wizardAppConfig.defaultBaseIri +
              hasher.hex(newValue.map((row) => row.join(",")).join("\n")).substr(0, 6) +
              "/",
          };
        });
      }
    }
  },
});

export const prefixState = selector({
  key: "prefixes",
  get: wizardAppConfig.getPrefixes,
});
