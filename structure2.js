import structure from "./structure.json";

const h = ["name", "area", "domain", "subdomain"];

const s = structure
  .map((min) =>
    min.related.map((r) => [r.title, min.title, r.domain, r.subdomain])
  )
  .flat();

const tsv = [h, ...s].map((s) => s.join("\t")).join("\n");

console.log(tsv);
