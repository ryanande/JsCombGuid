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
 * @returns A 36-character GUID string in the format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 * 
 * @example
 * ```typescript
 * import generateSequentialGuid from 'jscombguid';
 * 
 * const guid = generateSequentialGuid();
 * console.log(guid); // e.g., "550e8400-e29b-41d4-a716-446655440000"
 * ```
 */
declare function generateSequentialGuid(): string;

export default generateSequentialGuid;

