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
    const zoom = ref(0.6);

    const width = ref(1500);
    const height = ref(13000);

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
      const color = d3
        .scaleOrdinal(d3.schemeCategory10)
        .domain(sourceData.value.map((min) => min.title));

      const children = sourceData.value.map((d) => {
        const domains = unique(d.related.map((r) => r.subdomain)).filter(
          (d) => d !== "riigikantselei"
        );
        const services = d.services.map((s) => {
          return {
            name: s.title,
            url: s.url,
            color: color(d.title),
            service: true,
          };
        });
        return {
          name: d.title,
          url: d.url,
          color: color(d.title),
          children: [
            {
              name: "Teenused",
              color: color(d.title),
              service: true,
              children: services,
            },
            ...domains.map((domain) => {
              const relatedDomains = d.related.filter(
                (r) =>
                  r.subdomain === domain &&
                  d.title !== "Kaitseliit" &&
                  d.title !== "Patendivolinike Koda" &&
                  d.title !== "SA Keskkonnainvesteeringute Keskus"
              );
              return {
                name: domain,
                color: color(d.title),
                children: relatedDomains.map((r) => {
                  const services = servicesData.value
                    .filter(
                      (service) =>
                        service.provider.name.toLowerCase() ===
                        r.title.toLowerCase()
                    )
                    .map((service) => {
                      return {
                        name: service.name,
                        color: color(d.title),
                        url: service.url,
                        service: true,
                        stats:
                          service.serviceStatistics[0].availableChannel[0]
                            .channelStatistics.transaction,
                      };
                    });
                  return {
                    name: r.title,
                    url: r.url,
                    color: color(d.title),
                    children: services.length
                      ? [
                          {
                            name: "Teenused",
                            color: color(d.title),
                            service: true,
                            children: services,
                          },
                        ]
                      : [],
                  };
                }),
              };
            }),
          ],
        };
      });

      return d3.hierarchy({
        name: "Eesti riik",
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

    //watchEffect(() => console.log(elements.value));

    return { elements, width, height, zoom };
  },
  template: `
  <div :style="{transform: 'scale(' + zoom + ')', transformOrigin: '0 0'}">
  <svg :width="width" :height="height">
    <path 
      v-for="el in elements"
      :d="el.path"
      :stroke="el.data.color || 'black'"
      stroke-width="2"
      fill="none"
      opacity="0.2"

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
      transform: 'translateY(-12px)',
    }"
  >
    <component :is="el.data.url ? 'a' : 'div'" :href="el.data.url" target="_blank">
    <span :style="{color: el.data.color}">{{ el.data.service ? '✋' : el.data.name.endsWith('ministeerium') ? '🕋' : '🏢'}}</span> {{ el.data.name ? el.data.name : el.data }} {{ el.data.stats}}
    </component>
  </div>
  </div>
  <input
    style="position: fixed; top: 10px; left: 10px"
    type="range"
    v-model="zoom"
    min="0.2"
    max="1"
    step="0.001"
  />
  `,
};

createApp(App).mount("#app");
