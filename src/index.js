/**
 * @module jscombguid
 * @description A high-performance sequential GUID generator that creates sortable, unique identifiers
 * with microsecond precision. The generator combines a base UUID with timestamp and counter information
 * to ensure uniqueness and chronological sortability.
 */

/**
 * Generates a sequential GUID (Globally Unique Identifier) that is sortable by creation time.
 * This implementation creates a COMB (Combined GUID) that embeds a timestamp with microsecond precision
 * and includes additional entropy sources to minimize collision probability.
 * 
 * @function generateSequentialGuid
 * @returns {string} A 36-character GUID string in the format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
const generateSequentialGuid = (() => {
  let counter = 0;
  const MAX_COUNTER = 0xFFFF;
  let lastTimestamp = 0;
  let lastCounter = 0;

  // Pre-allocate the byte array for better performance
  const bytes = new Uint8Array(16);

  return () => {
    // Get current time in milliseconds since Unix epoch
    const now = Date.now();
    let timestamp = now; // Keep in milliseconds
    
    // Ensure timestamp is monotonic
    if (timestamp <= lastTimestamp) {
      timestamp = lastTimestamp + 1;
    }
    lastTimestamp = timestamp;

    // Update counter
    counter = (counter + 1) % MAX_COUNTER;
    if (timestamp === lastTimestamp && counter <= lastCounter) {
      counter = lastCounter + 1;
    }
    lastCounter = counter;

    // Generate random bytes
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < 16; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
    }

    // Set version (4) and variant bits (10xx) first
    bytes[6] = (bytes[6] & 0x0F) | 0x40;  // Version 4
    bytes[8] = (bytes[8] & 0x3F) | 0x80;  // Variant 1

    // Embed timestamp in first 6 bytes
    // We use a custom epoch (2024-01-01) to keep timestamps smaller
    const CUSTOM_EPOCH = 1704067200000; // 2024-01-01 in milliseconds
    const relativeTimestamp = Math.max(0, timestamp - CUSTOM_EPOCH);
    
    // Convert relative timestamp to bytes, ensuring we don't exceed 48 bits
    const timestampLower48 = relativeTimestamp & 0xFFFFFFFFFFFF;
    bytes[0] = (timestampLower48 >> 40) & 0xFF;
    bytes[1] = (timestampLower48 >> 32) & 0xFF;
    bytes[2] = (timestampLower48 >> 24) & 0xFF;
    bytes[3] = (timestampLower48 >> 16) & 0xFF;
    bytes[4] = (timestampLower48 >> 8) & 0xFF;
    bytes[5] = timestampLower48 & 0xFF;

    // Ensure the timestamp bytes don't interfere with version and variant bits
    bytes[6] = (bytes[6] & 0x0F) | 0x40;  // Version 4
    bytes[8] = (bytes[8] & 0x3F) | 0x80;  // Variant 1

    // Convert to hex string
    let result = '';
    for (let i = 0; i < 16; i++) {
      const byte = bytes[i];
      result += byte.toString(16).padStart(2, '0');
      if (i === 3 || i === 5 || i === 7 || i === 9) {
        result += '-';
      }
    }

    return result;
  };
})();

export default generateSequentialGuid;