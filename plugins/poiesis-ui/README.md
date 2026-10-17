# poiesis-ui

How an interface looks: text sizes, hierarchy, spacing, color and shape, derived from a few values a theme sets
(atoms → cells). The `ui` skill holds the tokens and rules; the `ui-auditor` agent checks your code; a hook holds back
publishing until the audit passes, in projects that turn it on.

One of the four plugins of [Poiesis Design](https://github.com/gorgmihai92/poiesis-design), with poiesis-ux,
poiesis-copy and poiesis-components; it installs on its own. Poiesis Design is one of the four products in the
Poiesis Toolkit: Research collects, Insight connects, Frontier explores, Design creates ([Poiesis
Research](https://github.com/gorgmihai92/poiesis-research), [Poiesis
Insight](https://github.com/gorgmihai92/poiesis-insight), [Poiesis
Frontier](https://github.com/gorgmihai92/poiesis-frontier)).

```
/plugin marketplace add gorgmihai92/poiesis-design
/plugin install poiesis-ui@poiesis-design
```

Full guide: https://github.com/gorgmihai92/poiesis-design#readme
