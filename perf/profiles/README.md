# Performance Profiling with clinic.js

This directory stores flamegraphs and profiles for backend performance analysis.

## Usage

- **Doctor:**
  npm run clinic:doctor -- -- node backend/index.js
- **Flame:**
  npm run clinic:flame -- -- node backend/index.js
- **Heap Profile:**
  npm run clinic:heap -- -- node backend/index.js

Artifacts will be saved here. Interpret flamegraphs to find bottlenecks, memory leaks, and optimize hot paths.

## Tips
- Run under production-like load (see k6 scripts)
- Compare before/after optimizations
- Use with OpenTelemetry traces for full-stack insight
