import {
  createApp,
  ref,
  watchEffect,
  computed,
} from "https://unpkg.com/vue@3.0.0/dist/vue.esm-browser.prod.js";

import * as d3 from "https://cdn.skypack.dev/d3";
import flattenTree from "https://cdn.skypack.dev/tree-flatten";

export const unique = (arr) => [...new Set(arr)];

const App = {
  setup() {
    const width = ref(1500);
    const height = ref(10000);

    const sourceData = ref([]);
    fetch("./structure.json")
      .then((res) => res.json())
      .then((res) => (sourceData.value = res));

    const servicesData = ref([]);
    fetch("./services.json")
      .then((res) => res.json())
      .then(
        (res) =>
          (servicesData.value = res.services.filter((s) => s.provider !== null))
      );

    const tree = d3.tree().size([height.value, width.value]);

    const data = computed(() => {
      const children = sourceData.value.map((d) => {
        const domains = unique(d.related.map((r) => r.subdomain));
        return {
          name: d.title,
          url: d.url,
          children: domains.map((domain) => {
            const relatedDomains = d.related.filter(
              (r) => r.subdomain === domain
            );
            return {
              name: domain,
              children: relatedDomains.map((r) => {
                const services = servicesData.value
                  .filter(
                    (service) =>
                      service.provider.name.toLowerCase() ===
                      r.title.toLowerCase()
                  )
                  .map((service) => {
                    return { name: service.name, url: service.url };
                  });
                return {
                  name: r.title,
                  url: r.url,
                  children: services,
                };
              }),
            };
          }),
        };
      });

      return d3.hierarchy({
        name: "Ministeeriumid",
        children,
      });
    });

    const elements = computed(() =>
      flattenTree(tree(data.value), "children").map((el) => {
        return {
          ...el,
          path: el.parent
            ? d3.linkHorizontal()({
                source: [el.parent.y, el.parent.x],
                target: [el.y, el.x],
              })
            : null,
        };
      })
    );

    watchEffect(() => console.log(elements.value));

    return { elements, width, height };
  },
  template: `
  <svg :width="width" :height="height">
    <path 
      v-for="el in elements"
      :d="el.path"
      stroke="#ddd"
      fill="none"
    />
  </svg>
  <div
    v-for="el in elements"
    :style="{
      position: 'absolute',
      left: el.y + 'px',
      top: el.x + 'px',
      whiteSpace: 'nowrap',
      textShadow: '1px white',
      transform: 'translateY(-0.6em)'
    }"
  >
    <component :is="el.data.url ? 'a' : 'div'" :href="el.data.url" target="_blank">
    {{ el.data.name ? el.data.name : el.data }}
    </component>
  </div>
  `,
};

createApp(App).mount("#app");
