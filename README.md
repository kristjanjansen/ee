## About

Estonian goverment structure analyzer, based on open data.

## Usage

### Ministries structure

```sh
npm i
node structure.js > structure.json
node --experimental-json-modules structure2.js | pbcopy
```

### Public services

```sh
curl https://www.riigiteenused.ee/api/et/all > services.json
node --experimental-json-modules services.js | pbcopy
```

### RIHA catalogue

```sh
curl https://www.riha.ee/api/v1/systems?size=2000 > riha.json
node --experimental-json-modules riha.js | pbcopy
```
