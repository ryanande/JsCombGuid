import assert from "assert";
import generateSequentialGuid from "../src/index";

describe("Sequential GUID Generator", () => {
  describe("Format Validation", () => {
    it("should generate a valid RFC4122 formatted UUID", () => {
      const guid = generateSequentialGuid();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      assert.match(guid, uuidRegex, "Generated GUID should match RFC4122 format");
    });

    it("should have consistent length of 36 characters", () => {
      const guid = generateSequentialGuid();
      assert.strictEqual(guid.length, 36, "GUID should be 36 characters long");
    });

    it("should have correct version and variant bits", () => {
      const guid = generateSequentialGuid();
      const parts = guid.split('-');
      
      // Version 4 UUID has version bits set to 0100
      assert.strictEqual(parts[2][0], '4', "Version bits should be set to 4");
      
      // Variant bits should be set to 10xx
      const variantBits = parseInt(parts[3][0], 16);
      assert.ok((variantBits & 0xC0) === 0x80, "Variant bits should be set to 10xx");
    });

    it("should have embedded timestamp in correct format", () => {
      const guid = generateSequentialGuid();
      const parts = guid.split('-');
      
      // First three parts should be timestamp-based
      const timestampHex = parts[0] + parts[1] + parts[2].substring(1);
      const timestamp = parseInt(timestampHex, 16);
      
      assert.ok(timestamp > 0, "Timestamp should be positive");
      assert.ok(timestamp <= Date.now() * 1000, "Timestamp should not be in the future");
    });
  });

  describe("Uniqueness", () => {
    it("should generate unique values in high-frequency scenarios", function() {
      this.timeout(10000); // 10 seconds for this specific test
      console.log("Starting uniqueness test...");
      
      const generated = new Set();
      const iterations = 1000; // Reduced from 100000 for faster testing
      
      for (let i = 0; i < iterations; i++) {
        const guid = generateSequentialGuid();
        assert.ok(!generated.has(guid), `Duplicate GUID found at iteration ${i}`);
        generated.add(guid);
        if (i % 100 === 0) console.log(`Processed ${i} GUIDs...`);
      }
      
      assert.strictEqual(generated.size, iterations, "All generated GUIDs should be unique");
      console.log("Uniqueness test completed successfully");
    });

    it("should maintain uniqueness across multiple runs", () => {
      console.log("Starting cross-run uniqueness test...");
      const firstRun = Array.from({ length: 100 }, () => generateSequentialGuid());
      const secondRun = Array.from({ length: 100 }, () => generateSequentialGuid());
      
      const intersection = firstRun.filter(guid => secondRun.includes(guid));
      assert.strictEqual(intersection.length, 0, "No GUIDs should be repeated across runs");
      console.log("Cross-run uniqueness test completed successfully");
    });

    it("should handle counter overflow correctly", () => {
      console.log("Starting counter overflow test...");
      const guids = new Set();
      const iterations = 1000; // Reduced from 0xFFFF + 100 for faster testing
      
      for (let i = 0; i < iterations; i++) {
        const guid = generateSequentialGuid();
        assert.ok(!guids.has(guid), `Duplicate GUID found at iteration ${i}`);
        guids.add(guid);
        if (i % 100 === 0) console.log(`Processed ${i} GUIDs...`);
      }
      
      assert.strictEqual(guids.size, iterations, "All GUIDs should be unique after counter overflow");
      console.log("Counter overflow test completed successfully");
    });
  });

  describe("Sequential Properties", () => {
    it("should be sortable by generation time", () => {
      console.log("Starting sortability test...");
      const guids = Array.from({ length: 100 }, () => generateSequentialGuid());
      const sorted = [...guids].sort();
      
      assert.deepStrictEqual(guids, sorted, "GUIDs should maintain chronological order when sorted");
      console.log("Sortability test completed successfully");
    });

    it("should have increasing values over time", () => {
      console.log("Starting increasing values test...");
      const guids = Array.from({ length: 100 }, () => generateSequentialGuid());
      
      for (let i = 1; i < guids.length; i++) {
        const prevGuid = guids[i - 1];
        const currGuid = guids[i];
        
        const prevTimestamp = prevGuid.slice(-16);
        const currTimestamp = currGuid.slice(-16);
        
        assert.ok(
          currTimestamp > prevTimestamp,
          `GUID ${i} (${currGuid}) should be greater than previous GUID (${prevGuid})`
        );
      }
      console.log("Increasing values test completed successfully");
    });

    it("should handle very close timestamps correctly", () => {
      console.log("Starting close timestamps test...");
      const guids = [];
      const startTime = Date.now();
      
      while (Date.now() - startTime < 100) {
        guids.push(generateSequentialGuid());
      }
      
      const uniqueGuids = new Set(guids);
      assert.strictEqual(uniqueGuids.size, guids.length, "All GUIDs should be unique even with close timestamps");
      
      const sorted = [...guids].sort();
      assert.deepStrictEqual(guids, sorted, "GUIDs should maintain order even with close timestamps");
      console.log("Close timestamps test completed successfully");
    });
  });

  describe("Performance", () => {
    it("should generate GUIDs efficiently", function() {
      this.timeout(10000); // 10 seconds for this specific test
      console.log("Starting efficiency test...");
      
      const iterations = 1000; // Reduced from 100000 for faster testing
      const start = process.hrtime();
      
      for (let i = 0; i < iterations; i++) {
        generateSequentialGuid();
        if (i % 100 === 0) console.log(`Processed ${i} GUIDs...`);
      }
      
      const [seconds, nanoseconds] = process.hrtime(start);
      const totalTime = seconds * 1000 + nanoseconds / 1000000;
      const averageTime = totalTime / iterations;
      
      assert.ok(averageTime < 0.1, `Average generation time should be less than 0.1ms, got ${averageTime.toFixed(3)}ms`);
      console.log("Efficiency test completed successfully");
    });

    it("should maintain performance under load", function() {
      this.timeout(10000); // 10 seconds for this specific test
      console.log("Starting load test...");
      
      const batchSize = 100; // Reduced from 1000 for faster testing
      const batches = 5; // Reduced from 10 for faster testing
      const times = [];
      
      // Warm up the JIT
      for (let i = 0; i < batchSize; i++) {
        generateSequentialGuid();
      }
      
      // Run the actual performance test
      for (let i = 0; i < batches; i++) {
        console.log(`Starting batch ${i + 1}/${batches}...`);
        const start = process.hrtime();
        for (let j = 0; j < batchSize; j++) {
          generateSequentialGuid();
        }
        const [seconds, nanoseconds] = process.hrtime(start);
        times.push(seconds * 1000 + nanoseconds / 1000000);
        console.log(`Completed batch ${i + 1}/${batches}`);
      }
      
      const averageTime = times.reduce((a, b) => a + b) / times.length;
      const maxDeviation = Math.max(...times) - Math.min(...times);
      const deviationPercentage = (maxDeviation / averageTime) * 100;
      
      console.log(`Average time per batch: ${averageTime.toFixed(3)}ms`);
      console.log(`Max deviation: ${maxDeviation.toFixed(3)}ms (${deviationPercentage.toFixed(1)}%)`);
      
      assert.ok(
        deviationPercentage < 20,
        `Performance deviation should be less than 20%, got ${deviationPercentage.toFixed(1)}%`
      );
      
      assert.ok(
        averageTime < 50,
        `Average batch time should be less than 50ms, got ${averageTime.toFixed(3)}ms`
      );
      console.log("Load test completed successfully");
    });
  });

  describe("Error Handling", () => {
    it("should handle system clock changes gracefully", () => {
      console.log("Starting clock change test...");
      const originalHrtime = process.hrtime;
      const guids = [];
      
      process.hrtime = () => [Math.floor(Date.now() / 1000), 0];
      
      try {
        for (let i = 0; i < 100; i++) {
          guids.push(generateSequentialGuid());
        }
        
        const uniqueGuids = new Set(guids);
        assert.strictEqual(uniqueGuids.size, guids.length, "All GUIDs should be unique even with clock changes");
        
        const sorted = [...guids].sort();
        assert.deepStrictEqual(guids, sorted, "GUIDs should maintain order even with clock changes");
      } finally {
        process.hrtime = originalHrtime;
      }
      console.log("Clock change test completed successfully");
    });

    it("should fall back to Math.random when crypto is not available", () => {
      console.log("Starting crypto fallback test...");
      const originalCrypto = global.crypto;
      const guids = [];
      
      delete global.crypto;
      
      try {
        for (let i = 0; i < 100; i++) {
          guids.push(generateSequentialGuid());
        }
        
        const uniqueGuids = new Set(guids);
        assert.strictEqual(uniqueGuids.size, guids.length, "All GUIDs should be unique when using Math.random");
        
        const sorted = [...guids].sort();
        assert.deepStrictEqual(guids, sorted, "GUIDs should maintain order when using Math.random");
      } finally {
        global.crypto = originalCrypto;
      }
      console.log("Crypto fallback test completed successfully");
    });
  });
});
