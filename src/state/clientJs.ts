import {
  selector,
  atom,
  DefaultValue,
  selectorFamily,
  RecoilValueReadOnly,
  RecoilState,
} from "recoil";

import { Models } from "@triply/utils/lib";
import App from "@triply/triplydb";

const currentUserAtom = atom<number>({
  key: "selectedUserId",
  default: 0,
});
const currentTokenAtom = atom<string>({
  key: "currentTokenAtom",
  default: "",
});
// Keep this internally as it is used to extend the users
const createdDatasetsAtom = atom<Models.Dataset[]>({
  key: "createdDatasetsAtom",
  default: [],
});

export const currentDsIdState = atom<number>({
  key: "selectedDatasetIdState",
  default: 0,
});
export const accountsInfoQuery = selector({
  key: "accountsSelector",
  get: async ({ get }) => {
    const token = get(currentTokenState);
    if (!token || token.length === 0) return [];
    const clientJs = App.get(token);
    const account = await clientJs.getAccount();
    const accountInfo = await account.getInfo();
    const organizations = await Promise.all(
      (
        await (await account.asUser()).getOrganizations()
      ).map(async (org) => {
        return await org.getInfo();
      })
    );
    return [accountInfo, ...organizations];
  },
});

const datasetsOfAccountQuery = selectorFamily({
  key: "datasetOfAccountQuery",
  get:
    (currentAccountState: number) =>
    async ({ get }) => {
      const selectedAccount = get(accountsInfoQuery)[currentAccountState];
      if (!selectedAccount) return [];
      const account = await App.get(get(currentTokenState)).getAccount(selectedAccount.accountName);
      const datasets = await account.getDatasets().toArray();
      const retrievedDatasets = await Promise.all(
        datasets.map(async (ds) => {
          return await ds.getInfo();
        })
      );
      return retrievedDatasets;
    },
});
const apiInfoQuery = selectorFamily({
  key: "apiInfoQuery",
  get:
    (token?: string) =>
    async ({}) => {
      if (!token) return undefined;
      return await App.get(token).getInfo();
    },
});

export const apiInfoState = selector({
  key: "apiInfoAtom",
  get: async ({ get }) => get(apiInfoQuery(get(currentTokenAtom))),
});

export const userDatasetsState = selector({
  key: "datasetOfAccountState",
  get: ({ get }) => {
    return [...get(datasetsOfAccountQuery(get(currentUserAtom))), ...get(createdDatasetsAtom)];
  },
  set: ({ set, get }, newValue: Models.Dataset[] | DefaultValue) =>
    set(createdDatasetsAtom, newValue instanceof DefaultValue ? newValue : [...get(createdDatasetsAtom), ...newValue]),
});

export const currentUserIdState = selector({
  key: "getSelectedAccountId",
  get: ({ get }) => {
    return get(currentUserAtom);
  },
  set: ({ set, reset }, newValue: number | DefaultValue) => {
    if (!(newValue instanceof DefaultValue)) {
      set(currentUserAtom, newValue);
      reset(currentDsIdState);
      reset(createdDatasetsAtom);
    }
  },
});

//@ts-ignore
export const currentDatasetSelector: RecoilValueReadOnly<undefined | Models.Dataset> = selector({
  key: "selectedDatasetData",
  get: ({ get }) => {
    const datasets = get(userDatasetsState);
    return datasets.length === 0 ? undefined : datasets[get(currentDsIdState)];
  },
});
//@ts-ignore
export const currentAccountDataSelector: RecoilValueReadOnly<undefined | Models.Account> = selector({
  key: "selectedAccountData",
  get: ({ get }) => {
    const accounts = get(accountsInfoQuery);
    return accounts.length === 0 ? undefined : accounts[get(currentUserAtom)];
  },
});

export const currentTokenState: RecoilState<string> = selector({
  key: "currentToken",
  get: ({ get }) => {
    return get(currentTokenAtom);
  },
  set: ({ set, reset }, newValue: string | DefaultValue) => {
    if (!(newValue instanceof DefaultValue)) {
      set(currentTokenAtom, newValue);
      // Reset other states
      reset(currentUserAtom);
      reset(currentDsIdState);
      reset(createdDatasetsAtom);
    }
  },
});
