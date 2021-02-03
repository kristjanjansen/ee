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
    const fade = ref(0);

    const width = ref(1500);
    const height = ref(27000);

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

    const rihaData = ref([]);
    fetch("./riha.json")
      .then((res) => res.json())
      .then((res) => (rihaData.value = res.content));

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
        const services2 = servicesData.value
          .filter(
            (service) =>
              service.provider.name.toLowerCase() === d.title.toLowerCase()
          )
          .map((service) => {
            return {
              name: service.name,
              color: color(d.title),
              url: service.url,
              service: true,
              stats: service.serviceStatistics[0].availableChannel.reverse()[0]
                .channelStatistics.transaction,
            };
          });

        const systems = rihaData.value
          .filter(
            (system) =>
              system.details.owner.name.toLowerCase() === d.title.toLowerCase()
          )
          .map((system) => {
            return {
              name: system.details.name,
              color: color(d.title),
              system: true,
              url: `https://www.riha.ee/Infos%C3%BCsteemid/Vaata/${system.details.short_name}`,
            };
          });

        const allServices = [...services, ...services2];
        return {
          name: d.title,
          url: d.url,
          color: color(d.title),
          children: [
            allServices.length
              ? {
                  name: "Teenused",
                  color: color(d.title),
                  service: true,
                  children: allServices,
                }
              : null,
            systems.length
              ? {
                  name: "Infosüsteemid",
                  color: color(d.title),
                  system: true,
                  children: systems,
                }
              : null,
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
                        r.title.replace(" (RMK)", "").toLowerCase()
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

                  const systems = rihaData.value
                    .filter(
                      (system) =>
                        system.details.owner.name.toLowerCase() ===
                        r.title.replace(" (RMK)", "").toLowerCase()
                    )
                    .map((system) => {
                      return {
                        name: system.details.name,
                        color: color(d.title),
                        system: true,
                        url: `https://www.riha.ee/Infos%C3%BCsteemid/Vaata/${system.details.short_name}`,
                      };
                    });

                  let children = [];

                  if (services.length) {
                    children.push({
                      name: "Teenused",
                      color: color(d.title),
                      service: true,
                      children: services,
                    });
                  }

                  if (systems.length) {
                    children.push({
                      name: "Infosüsteemid",
                      color: color(d.title),
                      system: true,
                      children: systems,
                    });
                  }

                  return {
                    name: r.title.replace(" (RMK)", ""),
                    url: r.url,
                    color: color(d.title),
                    children,
                  };
                }),
              };
            }),
          ].filter((s) => s),
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

    const area2radius = (area) => Math.sqrt(area / Math.PI);
    return { elements, width, height, zoom, area2radius, fade };
  },
  template: `
  <div :style="{transform: 'scale(' + zoom + ')', transformOrigin: '0 0'}">
  <svg :width="width + 1000" :height="height">
    <path 
      v-for="el in elements"
      :d="el.path"
      :stroke="el.data.color || 'black'"
      stroke-width="2"
      fill="none"
      opacity="0.2"

    />
    <circle 
      v-for="el in elements"
      :cx="el.y + 7"
      :cy="el.x"
      :r="el.data.stats ? Math.min(area2radius(el.data.stats) + 2, 250) : 0"
      :fill="el.data.color"
      :opacity="fade"
      style="mix-blend-mode: multiply"
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
      <div><span :style="{color: el.data.color}">{{ el.data.system ? '⚙️' : el.data.service ? '✋' : el.data.name.endsWith('ministeerium') ? '🕋' : '🏢'}}</span>{{ el.data.name ? el.data.name : el.data }} <span :style="{color: el.data.color, opacity: 0.75}">{{ el.data.stats }}</span></div>
    </component>
  </div>
  </div>
  <input
    style="position: fixed; top: 20px; left: 20px; width: 100px"
    type="range"
    v-model="zoom"
    min="0.05"
    max="1"
    step="0.001"
  />
  <input
    style="position: fixed; top: 20px; right: 20px; width: 100px"
    type="range"
    v-model="fade"
    min="0"
    max="0.2"
    step="0.001"
  />
  `,
};

createApp(App).mount("#app");
