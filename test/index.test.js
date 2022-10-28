import assert from "assert";
import generateCombGuid from "../src/index";

describe("Array", () => {
  describe("generateCombGuid()", () => {
    it("should return a 36 char string", () => {
      let val = generateCombGuid();
      assert.equal(val.length, 36);
    });

    it("should have 5 segments split on -", () => {
      let val = generateCombGuid();
      assert.equal(val.split("-").length, 5);
    });

    // this does in fact address both previous tests
    it("should be RFC4122 formatted uuid", () => {
      let val = generateCombGuid();

      // per SO; https://stackoverflow.com/questions/7905929/how-to-test-valid-uuid-guid/29742838
      // format from source here; https://github.com/chriso/validator.js/blob/master/src/lib/isUUID.js
      const isValidGuidFormat = ch =>
        ch.match(
          /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i
        ) !== null;

      assert.equal(isValidGuidFormat(val), true);
    });

    it("should not create a duplicate after 50,000 runs", () => {
      let arr = [];

      for (let i = 0; i < 50000; i++) {
        arr.push(generateCombGuid());
      }

      let findDuplicates = arr =>
        arr.filter((item, index) => arr.indexOf(item) != index);

      assert.equal(findDuplicates(arr), false);
    }).timeout(90000);
  });
});
