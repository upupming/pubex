# pubex

Quickly publish an experimental version of your npm package in one command:

```bash
npx pubex
```

or:

```bash
npm i -g pubex
pubex
```

If it is a git repository, it will use HEAD hash (eg. `0.0.0-experimental-caf5d3`) as the version number, else it will use current time (eg. `0.0.0-experimental-2022-02-16-00-02-40-utc-plus-8`) as the version number.
