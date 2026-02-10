# Load Testing Files

This directory contains load testing configuration and scripts for testing concurrent booking scenarios.

## Files

- **artillery.yml** - Artillery load testing configuration
- **artillery-processor.js** - Custom processor for test validation
- **setup-load-test.ts** - Helper script to prepare database for testing
- **LOAD_TESTING.md** - Comprehensive testing guide
- **report.json** - Generated test results (created after running tests)
- **report.json.html** - HTML report (created after running tests)

## Quick Start

1. Run setup: `npm run load:setup`
2. Update `artillery.yml` with the provided configuration
3. Start backend: `npm run dev`
4. Run tests: `npm run load:test`

See LOAD_TESTING.md for detailed instructions.
