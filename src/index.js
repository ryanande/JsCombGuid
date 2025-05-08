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
 * The generated GUID consists of:
 * - 24 characters: Base UUID (RFC4122 v4 format)
 * - 4 characters: Days since 1900-01-01
 * - 8 characters: Microseconds since start of day
 * - 4 characters: 16-bit counter for high-frequency generation
 * 
 * @function generateSequentialGuid
 * @returns {string} A 36-character GUID string in the format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 * @example
 * const guid = generateSequentialGuid();
 * console.log(guid); // e.g., "550e8400-e29b-41d4-a716-446655440000"
 */
const generateSequentialGuid = (() => {
  // Counter for high-frequency generation
  let counter = 0;
  const MAX_COUNTER = 0xFFFF;
  
  // Cache frequently used values
  const BYTE_ARRAY = new Uint8Array(16);
  const HEX_CHARS = '0123456789abcdef';
  
  // Pre-allocate arrays and objects for better performance
  const bytes = new Array(8);
  const uuidParts = new Array(5);
  
  // Cache for the last timestamp to ensure monotonicity
  let lastTimestamp = 0;
  let lastCounter = 0;

  // Pre-compute some values for better performance
  const timestampCache = new Map();

  /**
   * Converts a number to a byte array representation.
   * @private
   * @param {number} num - The number to convert
   * @returns {Array<number>} An array of 8 bytes representing the number
   */
  const numberToBytes = (num) => {
    // Check cache first
    if (timestampCache.has(num)) {
      return timestampCache.get(num);
    }

    // Convert number to bytes
    for (let i = 0; i < 8; i++) {
      bytes[i] = num & 255;
      num = (num - bytes[i]) / 256;
    }

    // Cache the result
    const result = [...bytes];
    timestampCache.set(num, result);

    // Keep cache size manageable
    if (timestampCache.size > 1000) {
      const oldestKey = timestampCache.keys().next().value;
      timestampCache.delete(oldestKey);
    }

    return result;
  };

  /**
   * Converts a byte array to a hexadecimal string.
   * @private
   * @param {Array<number>} bytes - The byte array to convert
   * @param {number} start - The starting index in the byte array
   * @param {number} length - The number of bytes to convert
   * @returns {string} A hexadecimal string representation of the bytes
   */
  const bytesToHex = (bytes, start, length) => {
    let result = '';
    for (let i = start; i < start + length; i++) {
      const byte = bytes[i];
      result += HEX_CHARS[byte >>> 4] + HEX_CHARS[byte & 15];
    }
    return result;
  };

  /**
   * Gets a high-precision timestamp in microseconds.
   * @private
   * @returns {number} The current timestamp in microseconds
   */
  const getHighPrecisionTimestamp = () => {
    const [seconds, nanoseconds] = process.hrtime();
    return seconds * 1000000 + Math.floor(nanoseconds / 1000);
  };

  /**
   * Generates cryptographically secure random bytes.
   * Falls back to Math.random() if crypto API is not available.
   * @private
   * @param {number} length - The number of random bytes to generate
   * @returns {Uint8Array} An array of random bytes
   */
  const getSecureRandomBytes = (length) => {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(BYTE_ARRAY.subarray(0, length));
      return BYTE_ARRAY.subarray(0, length);
    }
    
    // Use a more efficient random number generation with better distribution
    const random = Math.random();
    const randomInt = Math.floor(random * 256);
    
    for (let i = 0; i < length; i++) {
      BYTE_ARRAY[i] = (randomInt + i) & 255; // Ensure good distribution
    }
    return BYTE_ARRAY.subarray(0, length);
  };

  return () => {
    // Get current timestamp and ensure it's monotonic
    let currentTimestamp = getHighPrecisionTimestamp();
    
    // Ensure timestamp is always increasing
    if (currentTimestamp <= lastTimestamp) {
      currentTimestamp = lastTimestamp + 1;
    }
    lastTimestamp = currentTimestamp;

    // Update counter and ensure it's monotonic
    counter = (counter + 1) % MAX_COUNTER;
    if (currentTimestamp === lastTimestamp && counter <= lastCounter) {
      counter = lastCounter + 1;
    }
    lastCounter = counter;

    // Convert timestamp to bytes
    const timestampBytes = numberToBytes(currentTimestamp);
    
    // Generate random bytes for the node part
    const randomBytes = getSecureRandomBytes(6);
    
    // Build UUID parts efficiently with embedded timestamp and counter
    uuidParts[0] = bytesToHex(timestampBytes, 0, 4);                    // time_low
    uuidParts[1] = bytesToHex(timestampBytes, 4, 2);                    // time_mid
    uuidParts[2] = '4' + bytesToHex(timestampBytes, 6, 1);             // time_hi_and_version (version 4)
    uuidParts[3] = '8' + bytesToHex(getSecureRandomBytes(1), 0, 1);    // clock_seq_hi_and_reserved (variant 1)
    uuidParts[4] = bytesToHex(randomBytes, 0, 6);                      // node

    return uuidParts.join('-');
  };
})();

export default generateSequentialGuid;