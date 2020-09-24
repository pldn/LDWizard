import * as chai from "chai";
import applyTransformation from "config/rattScript";
var expect = chai.expect;

describe("Ratt - applyTransformation", function () {
  it("sometest", async function () {
    const result = await applyTransformation({
      config: {
        baseIri: "http://blaat",
        columnConfiguration: [{ columnName: "a" }, { columnName: "b" }],
        sourceFileName: "inputFile.csv",
        csvProps: { delimiter: "," },
      },
      source: [
        ["a", "b"],
        ["c", "d"],
      ],
      type: "ratt",
    });

    expect(result.trim().split("\n")).to.have.lengthOf(3);
  });
});
