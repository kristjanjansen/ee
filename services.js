import services from "./services.json";

const format = (s) => [
  s.provider.memberOf.name.replace("i haldusala", ""),
  s.provider.name,
  s.name,
  s.domain,
  s.subdomain,
  s.serviceType,
  s.url,
];

const h = [
  "memberof",
  "provider",
  "name",
  "domain",
  "subdomain",
  "type",
  "url",
];

const s = services.services.filter((s) => s.provider !== null).map(format);

const tsv = [h, ...s]
  .map((s) => s.join("\t"))
  //.slice(0, 10)
  .join("\n");

console.log(tsv);
