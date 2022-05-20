import { Middleware } from "@triply/ratt";

export default function fromArray(input: string[][]): Middleware {
  const header = input[0];
  input = input.slice(1);
  return async function _fromArray(_ctx, next) {
    for (const row of input) {
      const resultObject: { [key: string]: number | string } = {};
      if (header) {
        header.forEach((val, idx) => {
          if (val === undefined || val.length === 0) return;
          resultObject[val] = row[idx] || "";
        });
      } else {
        for (const [colId, val] of row.entries()) {
          resultObject["" + colId] = val;
        }
      }
      await next(resultObject);
    }
  };
}
