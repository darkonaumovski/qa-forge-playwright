# Architecture assessment

## Baseline

The repository started from a strong, deliberately small architecture: domain-grouped tests, typed page-object fixtures, strict TypeScript, isolated browser contexts, stable semantic locators, web-first assertions, virtual-clock coverage for timers, three browser projects, and CI artifact safety checks. The 106 planned scenarios map one-to-one to 318 browser executions.

## Ranked findings

### High

- There was no automated lint or formatting gate. Much of the suite used several statements per line, which made reviews and merge-conflict resolution harder despite correct behavior.
- `PW_WORKERS` was converted with `Number(...)` without validation. Invalid values could fail later with a less actionable Playwright configuration error.

### Medium

- The direct HTTP hosting test created and disposed its own request context. A typed domain client and fixture now own base URL, lifecycle, and the hosting contract.
- CI ran type and coverage checks separately but did not enforce source formatting or static lint findings.
- The private-access browser route relied on context destruction for cleanup. It is now explicitly unregistered during fixture teardown and remains limited to the configured origin.

### Optional / intentionally deferred

- Storage-state reuse is not appropriate for the lab login: every test receives a new context and the application's in-memory data is reset on reload. The outer private-hosting state remains configurable separately.
- No application API exists in this static practice lab, so CRUD API clients, payload builders, schema models, and success/error/slow-response mocks would be speculative. Add them only when the product exposes a real endpoint.
- Separate component, constants, and utility folders would currently contain single-use wrappers. Add them when a second consumer demonstrates reuse.
- Retries remain disabled, including in CI. The release gate deliberately requires each browser execution to pass on its first attempt so flaky behavior remains visible.

## Target structure

```text
.github/workflows/     CI quality and browser gates
docs/                  Strategy, cases, validation, issues, assessment
scripts/               Focused reporting, coverage, cleanup, safety tools
src/api/               Direct HTTP clients by external boundary/domain
src/config/            Validated environment configuration
src/data/              Typed static expectations and small data factory
src/fixtures/          Typed lifecycle and dependency composition
src/pages/             Feature-focused page objects
tests/                 Behavior specifications grouped by product area
```

## Phased plan

1. Enforce linting, formatting, strict types, plan coverage, and secret scanning locally and in CI.
2. Establish the domain-client pattern on the existing hosting access contract and keep network interception scoped and cleaned up.
3. When a real backend appears, add clients and response types per domain plus isolated API and mocked-UI suites; do not retrofit speculative abstractions now.
4. Continue extracting page sections only when pages grow or a component gains a second consumer.
