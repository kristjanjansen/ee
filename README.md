## About

Estonian goverment structure analyzer and visualizer, based on open data.

## Demo

https://kristjanjansen.github.io/ee/

## Getting the data

### Ministries structure

```sh
npm i
node structure.js > structure.json
node --experimental-json-modules structure2.js # tsv to stdout
```

### Public services

```sh
curl https://www.riigiteenused.ee/api/et/all > services.json
node --experimental-json-modules services.js # tsv to stdout
```

### RIHA catalogue

```sh
curl https://www.riha.ee/api/v1/systems?size=2000 > riha.json
node --experimental-json-modules riha.js # tsv to stdout
```
