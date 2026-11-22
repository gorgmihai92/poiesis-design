# poiesis-ui

How an interface looks: text sizes, hierarchy, spacing, color and shape, derived from a few values a theme sets
(atoms → cells). The `ui` skill holds the tokens and rules; the `ui-auditor` agent checks your code; a hook holds back
publishing until the audit passes, in projects that turn it on.

One of the five plugins of [Poiesis Design](https://github.com/gorgmihai92/poiesis-design), with poiesis-ux,
poiesis-copy, poiesis-components and poiesis-studio; it installs on its own. Poiesis Design is one of the five
products in the Poiesis Toolkit: Research collects, Insight connects, Foresight anticipates, Frontier explores,
Design creates ([Poiesis Research](https://github.com/gorgmihai92/poiesis-research), [Poiesis
Insight](https://github.com/gorgmihai92/poiesis-insight), [Poiesis
Foresight](https://github.com/gorgmihai92/poiesis-foresight), [Poiesis
Frontier](https://github.com/gorgmihai92/poiesis-frontier)).

```
/plugin marketplace add gorgmihai92/poiesis-design
/plugin install poiesis-ui@poiesis-design
```

Full guide: https://github.com/gorgmihai92/poiesis-design#readme
