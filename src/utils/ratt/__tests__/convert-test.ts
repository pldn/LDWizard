import * as chai from "chai";
import applyTransformation from "../../../config/rattScript";
var expect = chai.expect;

describe("Ratt - applyTransformation", function () {
  it("sometest", async function () {
    const result = await applyTransformation({
      config: {
        baseIri: "http://blaat",
        columnConfiguration: [{ columnName: "a" }, { columnName: "b" }],
        sourceFileName: "inputFile.csv",
        resourceClass: "http://schaap/",
        csvProps: {
          delimiter: ",",
        },
      },
      source: [
        ["a", "b"],
        ["c", "d"],
      ],
      type: "ratt",
    });
    expect(result.trim().split("\n")).to.have.lengthOf(3);
  });
  describe(" - Predicate transformations", () => {
    it("convert predicate columns to string", async function () {
      const result = await applyTransformation({
        config: {
          baseIri: "http://blaat",
          columnConfiguration: [{ columnName: "a" }, { columnName: "a space" }],
          sourceFileName: "inputFile.csv",
          resourceClass: "http://schaap/",
          csvProps: {
            delimiter: ",",
          },
        },
        source: [
          ["a", "a space"],
          ["c", "d"],
        ],
        type: "ratt",
      });
      expect(result.trim().split("\n")).to.have.lengthOf(3);
      expect(result).to.contain("a_space");
    });
    it("Apply predicate in config in transformation", async function () {
      const result = await applyTransformation({
        config: {
          baseIri: "http://blaat",
          columnConfiguration: [{ columnName: "a" }, { columnName: "b", propertyIri: "http://iri" }],
          sourceFileName: "inputFile.csv",
          resourceClass: "http://schaap/",
          csvProps: {
            delimiter: ",",
          },
        },
        source: [
          ["a", "b"],
          ["c", "d"],
        ],
        type: "ratt",
      });
      expect(result.trim().split("\n")).to.have.lengthOf(3);
      expect(result).to.contain("http://iri");
    });
  });
  describe(" - Resource class transformation", () => {
    it("Resource class should be applied", async function () {
      const result = await applyTransformation({
        config: {
          baseIri: "http://blaat",
          columnConfiguration: [{ columnName: "a" }, { columnName: "b" }],
          sourceFileName: "inputFile.csv",
          resourceClass: "http://schaap/",
          csvProps: {
            delimiter: ",",
          },
        },
        source: [
          ["a", "b"],
          ["c", "d"],
        ],
        type: "ratt",
      });
      expect(result.trim().split("\n")).to.have.lengthOf(3);
      expect(result).to.contain("<http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schaap/>");
    });
  });
  describe(" - Key column configuration", () => {
    it("Check selected key column", async function () {
      const result = await applyTransformation({
        config: {
          baseIri: "http://blaat/",
          columnConfiguration: [{ columnName: "a" }, { columnName: "b" }],
          sourceFileName: "inputFile.csv",
          resourceClass: "http://schaap/",
          key: 0,
          csvProps: {
            delimiter: ",",
          },
        },
        source: [
          ["a", "b"],
          ["c", "d"],
        ],
        type: "ratt",
      });
      expect(result.trim().split("\n")).to.have.lengthOf(2);
      expect(result).to.contain("http://blaat/id/c");
    });
    it("Use row number by default", async function () {
      const result = await applyTransformation({
        config: {
          baseIri: "http://blaat/",
          columnConfiguration: [{ columnName: "a" }, { columnName: "b" }],
          sourceFileName: "inputFile.csv",
          resourceClass: "http://schaap/",
          csvProps: {
            delimiter: ",",
          },
        },
        source: [
          ["a", "b"],
          ["c", "d"],
        ],
        type: "ratt",
      });
      expect(result.trim().split("\n")).to.have.lengthOf(3);
      expect(result).to.contain("http://blaat/id/1");
    });
  });
});
