import {
  createApp,
  ref,
  watchEffect,
  computed,
} from "https://unpkg.com/vue@3.0.0/dist/vue.esm-browser.prod.js";

import * as d3 from "https://cdn.skypack.dev/d3";
import flattenTree from "https://cdn.skypack.dev/tree-flatten";
console.log(flattenTree);

const App = {
  setup() {
    const sourceData = ref([]);
    fetch("./structure.json")
      .then((res) => res.json())
      .then((res) => (sourceData.value = res));

    const tree = d3.tree().size([5000, 1000]);
    const data = computed(() => {
      const children = sourceData.value.map((d) => ({
        name: d.title,
        children: d.related.map((c) => c.title),
      }));

      return d3.hierarchy({
        name: "Ministeeriumid",
        children,
      });
    });

    const elements = computed(() => flattenTree(tree(data.value), "children"));

    watchEffect(() => console.log(elements.value));

    //const root = d3.hierarchy(data);
    //  console.log(root.descendants());
    // const t = root.descendants().map((d) => ({
    //   node: tree(d),
    //   d,
    //   //children: d.descendants().map((d) => ({ node: tree(d) })),
    // }));

    return { elements };
  },
  template: `
  <div 
    v-for="el in elements"
    :style="{
      border: '1px solid red',
      position: 'absolute',
      left: el.y + 'px',
      top: el.x + 'px',
    }"
  >
    {{ el.data.name ? el.data.name : el.data }}
  </div>
  `,
};

createApp(App).mount("#app");

/*


    <!-- <div 
      v-for="l in root"
      :style="{
        border: '1px solid red',
        position: 'fixed',
        right: tree(l).x + 'px',
        top: tree(l).y + 'px',
        width: '100px',
        height: '100px'
      }"
    >
      {{ tree(l).name }}
    </div> -->
    <!-- <div 
      v-for="(l,i) in root.descendants()"
      :style="{
        border: '1px solid red',
        position: 'fixed',
        right: tree(l).x + 'px',
        top: tree(l).y + 'px',
        width: '100px',
        height: '100px'
      }"
    >
      a{{ i }}
    </div> -->
  `,
  */

/*

import { createApp } from "https://unpkg.com/vue@3.0.0/dist/vue.esm-browser.prod.js";
import * as d3 from "https://cdn.skypack.dev/d3";
//import * as vue3tree from "https://cdn.skypack.dev/vued3tree";
//const { tree: Tree } = vue3tree.default;

const App = {
  //components: { Tree },
  async setup() {
    const sourceData = await fetch("./structure.json").then((res) =>
      res.json()
    );
    const data = sourceData.map((d) => ({
      name: d.title,
      children: d.related.map((c) => c.title),
    }));
    //return { data };
  },
  template: `Hello`,
};

createApp(App).mount("#app");

*/
