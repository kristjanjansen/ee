import riha from "./riha.json";

const format = (s) => [
  s.details.owner.name,
  s.details.name,
  s.details.meta.system_status?.status,
  s.details.homepage,
];

const h = ["owner", "name", "system_status", "url"];

const s = riha.content.map(format);

const tsv = [h, ...s].map((s) => s.join("\t")).join("\n");

console.log(tsv);
