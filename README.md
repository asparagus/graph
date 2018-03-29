# Graph
Layout algorithm for Directed Acyclic Graph

```
var nodes = [{}, {}, {}, {}, {}, {}, {}];
var edges = [
    { source: 0, target: 1 },
    { source: 0, target: 2 },
    { source: 1, target: 3 },
    { source: 1, target: 4 },
    { source: 2, target: 6 },
    { source: 3, target: 6 },
    { source: 5, target: 6 }
];

setLocations(nodes, edges, layerWidth = 100, rowHeight = 75);
```
![Example](example.png) "Example"
