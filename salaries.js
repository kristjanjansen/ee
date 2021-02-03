import xlsx from "node-xlsx";

const file = xlsx.parse(`./salaries.xlsx`);

const main = file[2].data.splice(6);

export const unique = (arr) => [...new Set(arr)];

const inst = unique(main.map((m) => m[0]));

const deps = inst.map((name) => {
  const dep = main.filter((m) => name === m[0]);
  const subdeps = unique(dep.map((d) => d[1]));
  const children = subdeps.map((s) => {
    return { name: s, count: dep.filter((d) => d[1] === s).length };
  });
  return { name, count: dep?.length, children };
});

console.log(JSON.stringify(deps, null, 2));
