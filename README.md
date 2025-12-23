# JsCombGuid

[![npm version](https://badge.fury.io/js/jscombguid.svg)](https://badge.fury.io/js/jscombguid)
[![Build Status](https://github.com/ryanande/JsCombGuid/workflows/CI/badge.svg)](https://github.com/ryanande/JsCombGuid/actions)
[![Coverage Status](https://coveralls.io/repos/github/ryanande/JsCombGuid/badge.svg?branch=master)](https://coveralls.io/github/ryanande/JsCombGuid?branch=master)

A high-performance JavaScript Sequential GUID Generator that creates sortable, unique identifiers with microsecond precision. Perfect for databases, distributed systems, and any scenario where you need sortable, unique IDs.

## Features

- **High Performance**: Optimized for speed with minimal memory allocations
- **Microsecond Precision**: Uses high-resolution timestamps for better uniqueness
- **Sortable**: GUIDs are chronologically sortable by creation time
- **Collision Resistant**: Multiple entropy sources and a counter for high-frequency generation
- **RFC4122 Compliant**: Generates valid UUID v4 format
- **Zero Dependencies**: Pure JavaScript with no external dependencies
- **TypeScript Support**: Includes TypeScript type definitions

## Installation

```bash
npm install jscombguid
```

## Usage

### ES Modules (Recommended)

```javascript
import generateSequentialGuid from 'jscombguid';

// Generate a single GUID
const guid = generateSequentialGuid();
console.log(guid); // e.g., "550e8400-e29b-41d4-a716-446655440000"

// Generate multiple GUIDs
const guids = Array.from({ length: 10 }, () => generateSequentialGuid());
```

### CommonJS

```javascript
const generateSequentialGuid = require('jscombguid');

const guid = generateSequentialGuid();
```

### TypeScript

```typescript
import generateSequentialGuid from 'jscombguid';

const guid: string = generateSequentialGuid();
```

### Use Cases

```javascript
// Database primary keys
const userId = generateSequentialGuid();

// Sortable transaction IDs
const transactionIds = Array.from({ length: 100 }, () => generateSequentialGuid());
// These can be sorted chronologically!

// Distributed system identifiers
const sessionId = generateSequentialGuid();
```

## Performance

The generator is optimized for high-performance scenarios:

- Average generation time: < 0.1ms per GUID
- Can generate 100,000+ unique GUIDs per second
- Memory efficient with minimal allocations
- Stable performance under load

## How It Works

The generator creates sequential GUIDs by combining:

1. A base UUID (24 characters)
2. Days since 1900-01-01 (4 characters)
3. Microseconds since start of day (8 characters)
4. A 16-bit counter for high-frequency generation (4 characters)

This combination ensures:
- Chronological sortability
- High uniqueness
- Microsecond precision
- Collision resistance

## API

### `generateSequentialGuid()`

Generates a sequential GUID string.

**Returns:** `string` - A 36-character GUID in UUID v4 format

**Example:**
```javascript
const guid = generateSequentialGuid();
// "550e8400-e29b-41d4-a716-446655440000"
```

## Benchmarks

```javascript
const iterations = 100000;
const start = process.hrtime();

for (let i = 0; i < iterations; i++) {
  generateSequentialGuid();
}

const [seconds, nanoseconds] = process.hrtime(start);
const averageTime = (seconds * 1000 + nanoseconds / 1000000) / iterations;
console.log(`Average generation time: ${averageTime.toFixed(3)}ms`);
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run linting
npm run lint

# Build
npm run build
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- Original concept inspired by [this StackOverflow discussion](http://stackoverflow.com/a/8809472/173949)
- Thanks to [@thetinomen](https://twitter.com/thetinomen) for code improvements
