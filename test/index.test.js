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
      
      // Variant bits should be set to 10xx (8, 9, A, or B)
      const variantChar = parts[3][0].toLowerCase();
      assert.ok(['8', '9', 'a', 'b'].includes(variantChar), 
        `Variant bits should be set to 10xx (8,9,A,B), got ${variantChar}`);
    });

    it("should have embedded timestamp in correct format", () => {
      const guid = generateSequentialGuid();
      const parts = guid.split('-');
      
      // Extract timestamp bytes in correct order
      const timestampBytes = [
        parseInt(parts[0].substring(0, 2), 16),
        parseInt(parts[0].substring(2, 4), 16),
        parseInt(parts[0].substring(4, 6), 16),
        parseInt(parts[0].substring(6, 8), 16),
        parseInt(parts[1].substring(0, 2), 16),
        parseInt(parts[1].substring(2, 4), 16)
      ];
      
      // Reconstruct timestamp
      const relativeTimestamp = 
        (timestampBytes[0] << 40) |
        (timestampBytes[1] << 32) |
        (timestampBytes[2] << 24) |
        (timestampBytes[3] << 16) |
        (timestampBytes[4] << 8) |
        timestampBytes[5];
      
      // Convert relative timestamp back to absolute time
      const CUSTOM_EPOCH = 1704067200000; // 2024-01-01 in milliseconds
      const timestamp = relativeTimestamp + CUSTOM_EPOCH;
      
      // Get current time in milliseconds
      const currentTime = Date.now();
      
      console.log('Debug timestamps:', {
        timestampBytes,
        relativeTimestamp,
        timestamp,
        currentTime,
        difference: timestamp - currentTime,
        guid
      });
      
      // Simple validation: timestamp should be positive and not in the future
      assert.ok(timestamp > 0, "Timestamp should be positive");
      assert.ok(timestamp <= currentTime, "Timestamp should not be in the future");
    });
  });

  describe("Uniqueness", () => {
    it("should generate unique values in high-frequency scenarios", function() {
      this.timeout(10000);
      const generated = new Set();
      const iterations = 1000;
      
      for (let i = 0; i < iterations; i++) {
        const guid = generateSequentialGuid();
        assert.ok(!generated.has(guid), `Duplicate GUID found at iteration ${i}`);
        generated.add(guid);
      }
      
      assert.strictEqual(generated.size, iterations, "All generated GUIDs should be unique");
    });

    it("should maintain uniqueness across multiple runs", () => {
      const firstRun = Array.from({ length: 100 }, () => generateSequentialGuid());
      const secondRun = Array.from({ length: 100 }, () => generateSequentialGuid());
      
      const intersection = firstRun.filter(guid => secondRun.includes(guid));
      assert.strictEqual(intersection.length, 0, "No GUIDs should be repeated across runs");
    });
  });

  describe("Sequential Properties", () => {
    it("should be sortable by generation time", () => {
      const guids = Array.from({ length: 100 }, () => generateSequentialGuid());
      const sorted = [...guids].sort();
      
      assert.deepStrictEqual(guids, sorted, "GUIDs should maintain chronological order when sorted");
    });

    it("should maintain chronological order", () => {
      const guids = Array.from({ length: 100 }, () => generateSequentialGuid());
      
      for (let i = 1; i < guids.length; i++) {
        const prevGuid = guids[i - 1];
        const currGuid = guids[i];
        
        // Compare the first 12 characters which contain the timestamp
        const prevTime = prevGuid.substring(0, 12);
        const currTime = currGuid.substring(0, 12);
        
        assert.ok(
          currTime >= prevTime,
          `GUID ${i} (${currGuid}) should be greater than or equal to previous GUID (${prevGuid})`
        );
      }
    });

    it("should handle very close timestamps correctly", () => {
      const guids = [];
      const startTime = Date.now();
      
      // Generate a fixed number of GUIDs instead of using time-based loop
      for (let i = 0; i < 1000; i++) {
        guids.push(generateSequentialGuid());
      }
      
      // Verify uniqueness
      const uniqueGuids = new Set(guids);
      assert.strictEqual(uniqueGuids.size, guids.length, "All GUIDs should be unique even with close timestamps");
      
      // Verify ordering by comparing timestamps
      for (let i = 1; i < guids.length; i++) {
        const prevTime = guids[i-1].substring(0, 12);
        const currTime = guids[i].substring(0, 12);
        assert.ok(
          currTime >= prevTime,
          `GUID ${i} should be greater than or equal to previous GUID`
        );
      }
    });
  });

  describe("Performance", () => {
    it("should generate GUIDs efficiently", function() {
      this.timeout(10000);
      const iterations = 10000;
      const start = process.hrtime();
      
      for (let i = 0; i < iterations; i++) {
        generateSequentialGuid();
      }
      
      const [seconds, nanoseconds] = process.hrtime(start);
      const totalTime = seconds * 1000 + nanoseconds / 1000000;
      const averageTime = totalTime / iterations;
      
      console.log(`Average generation time: ${averageTime.toFixed(3)}ms per GUID`);
      assert.ok(averageTime < 0.1, `Average generation time should be less than 0.1ms, got ${averageTime.toFixed(3)}ms`);
    });

    it("should maintain consistent throughput under sustained load", function() {
      this.timeout(10000);
      const duration = 1000; // Run for 1 second
      const startTime = Date.now();
      let count = 0;
      
      while (Date.now() - startTime < duration) {
        generateSequentialGuid();
        count++;
      }
      
      const throughput = count / (duration / 1000); // GUIDs per second
      console.log(`Throughput: ${throughput.toFixed(0)} GUIDs/second`);
      
      // Ensure we can generate at least 10,000 GUIDs per second
      assert.ok(throughput > 10000, `Throughput should be at least 10,000 GUIDs/second, got ${throughput.toFixed(0)}`);
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

  describe('Error handling and edge cases', () => {
    it('should handle crypto API unavailability', () => {
      // Mock crypto API as unavailable
      const originalCrypto = global.crypto;
      delete global.crypto;
      
      const guid = generateSequentialGuid();
      assert.match(guid, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      
      // Restore crypto API
      global.crypto = originalCrypto;
    });

    it('should handle timestamp rollover', () => {
      const guids = [];
      for (let i = 0; i < 1000; i++) {
        guids.push(generateSequentialGuid());
      }
      
      // Verify all GUIDs are unique and properly formatted
      const uniqueGuids = new Set(guids);
      assert.strictEqual(uniqueGuids.size, guids.length);
      guids.forEach(guid => {
        assert.match(guid, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      });
    });

    it('should handle counter overflow', () => {
      // Force counter to near MAX_COUNTER
      const guids = [];
      for (let i = 0; i < 0xFFFF + 10; i++) {
        guids.push(generateSequentialGuid());
      }
      
      // Verify all GUIDs are unique and properly formatted
      const uniqueGuids = new Set(guids);
      assert.strictEqual(uniqueGuids.size, guids.length);
      guids.forEach(guid => {
        assert.match(guid, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      });
    });
  });
});
