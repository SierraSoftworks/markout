/** @type {import('jest').Config} */
module.exports = {
  // TypeScript is transpiled by babel-jest using the Babel config in
  // package.json (the same one webpack uses). Type checking is performed
  // separately by `npm run typecheck` (tsc --noEmit), which `npm test` runs
  // first, since TypeScript 7 no longer exposes the compiler API ts-jest needs.
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  setupFiles: ['<rootDir>/spec/jest.setup.js'],
};
