/**
 * JavaScript functions to set up the layour for a graph.
 */

/**
 * Set the x, y, layer properties for all nodes in the graph.
 *
 * @param {Array[Object]} nodes      An array of objects to which to add x, y locations
 * @param {Array[Object]} edges      An array of objects with source and target properties which are indices for the nodes Array
 * @param {Int}          layerWidth Horizontal separation between nodes
 * @param {Int}          rowHeight  Vertical separation between nodes
 */
function setLocations(nodes, edges, layerWidth = 100, rowHeight = 50) {
    var adjacencyList = new Array(nodes.length);
    var inputAdjacencyList = new Array(nodes.length);
    nodes.forEach((n, i) => {
        adjacencyList[i] = [];
        inputAdjacencyList[i] = [];
    });
    edges.forEach(e => {
        adjacencyList[e.source].push(e.target)
        adjacencyList[e.target].push(e.source)
        inputAdjacencyList[e.target].push(e.source);
    });

    var layers = computeLayersForNode(nodes, inputAdjacencyList);

    layers.forEach((layer, idx) => {
        layer.forEach(i => nodes[i].level = idx);
    });

    // Set initial positions
    locate(nodes, layers, layerWidth, rowHeight);

    // Adjust
    for (var i = 0; i < 10; i++) {
        if (!verticalAdjust(nodes, adjacencyList, layers)) { break; }
    }

    // Settle on final positions
    locate(nodes, layers, layerWidth, rowHeight);
}

/**
 * Compute the layers of the graph.
 *
 * @param  {Array[Object]}     nodes         An array containing all the node objects
 * @param  {Array[Array[Int]]} adjacencyList A map that for each node index, contains an array of input node indices to it
 * @return {Map(Int -> Int)} A map containing the layer # for each node index
 */
function computeLayersForNode(nodes, adjacencyList) {
    var sources = [];
    nodes.forEach((n, i) => {
        if (adjacencyList[i].length == adjacencyList[i].length) {
            sources.push(i);
        }
    });

    var layersForNode = longestPathLength(sources, adjacencyList);
    var maxValue = 0;
    for (var nodeIdx in layersForNode) {
        maxValue = Math.max(maxValue, layersForNode[nodeIdx]);
    }

    var layers = [];
    for (var i = 0; i <= maxValue; i++) {
        layers.push([]);
    }

    nodes.forEach((n, i) => {
        // Makes sure the value is 0 for inputs even though calculation started from outputs
        var layerIdx = maxValue - layersForNode[i];
        layers[layerIdx].push(i);
    });

    return layers;
}

/**
 * Compute the maximum length path for all nodes from the source nodes.
 *
 * @param  {Array[Int]}        sources       The source node indices
 * @param  {Array[Array[Int]]} adjacencyList An array that for each node index, contains an array of input node indices to it
 * @return {Map(Int -> Int)} A map containing the length of the longest path for each node index
 */
function longestPathLength(sources, adjacencyList) {
    var values = {};
    sources.forEach(i => values[i] = 0);

    var currentLevel = new Set(sources);
    while (currentLevel.size > 0) {
        var nextLevel = new Set();
        currentLevel.forEach(n => {
            var value = values[n] + 1;
            adjacencyList[n].forEach(other => {
                values[other] = value;
                nextLevel.add(other);
            });
        });

        currentLevel = nextLevel;
    }

    return values;
}

/**
 * Place the nodes according to their intra-layer ordering.
 * Adjusts their x and y properties.
 *
 * @param  {Array[Object]}     nodes      Array of node objects
 * @param  {Array[Array[Int]]} layers     Map that for every layer has a layout ordered list of nodes
 * @param  {Int}               layerWidth Horizontal separation between nodes
 * @param  {Int}               rowHeight  Vertical separation between nodes
 */
function locate(nodes, layers, layerWidth, rowHeight) {
    for (var i = 0; i < nodes.length; i++) {
        var level = nodes[i].level;
        var nodesSharingLevel = layers[level];
        nodes[i].x = level * layerWidth;
        nodes[i].y = (nodesSharingLevel.length / 2 - nodesSharingLevel.indexOf(i)) * rowHeight;
    }
}

/**
 * Adjust nodes vertically by averaging over connected nodes.
 *
 * @param  {Array[Object]}     nodes         Array of node objects
 * @param  {Array[Array[Int]]} adjacencyList An array that for each node index, contains an array of input node indices to it
 * @param  {Array[Array[Int]]} layers        Map that for every layer has a layout ordered list of nodes
 */
function verticalAdjust(nodes, adjacencyList, layers) {
    var newYCoordinates = {};
    for (var i = 0; i < nodes.length; i++) {
        if (adjacencyList[i].length > 0) {
            var ySum = adjacencyList[i].reduce((prev, curr) => prev + nodes[curr].y, 0);
            var yAvg = ySum / adjacencyList[i].length;
            newYCoordinates[i] = yAvg;
        } else {
            newYCoordinates[i] = nodes[i].y;
        }
    }

    var change = false;
    layers.forEach((layer, idx) => {
        previous_order = layers.slice();
        new_order = layer.sort(function(n1, n2) {
            return newYCoordinates[n2] - newYCoordinates[n1];
        });

        if (!previous_order.every((v,i)=> v === new_order[i])) {
            change = true;
        }
    });

    nodes.forEach((n, i) => n.y = (newYCoordinates[i] + n.y) / 2);

    return change;
}
