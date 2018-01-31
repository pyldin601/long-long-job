# node-flowtype-boilerplate

## Quick start

This project requires [Node.js][nodejs] v8.9 (LTS Carbon) or later and [Yarn][yarn]. Make sure you have those installed. Then just type following commands:

```
git clone https://github.com/jsynowiec/node-flowtype-boilerplate
cd node-flowtype-boilerplate
yarn
```

## Available scripts

Run using `yarn run <script>` comand.

+ `clean` - remove coverage data, Jest cache and transpiled files,
+ `lint` - lint source files and tests,
+ `typecheck` - check type annotations,
+ `test` - lint, typecheck and run tests with coverage,
+ `test-only` - run tests with coverage,
+ `test:watch` - interactive watch mode to automatically re-run tests, 
+ `build` - compile source files,
+ `build:watch` - interactive watch mode, compile sources on change.
