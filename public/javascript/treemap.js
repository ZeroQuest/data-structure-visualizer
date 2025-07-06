
import { updateCodeSnippet, sidebarToggle } from './utils.js';
import { snippets_treemap } from './snippets_treemap.js';

const insertForm = document.getElementById('insert-form');
const removeForm = document.getElementById('remove-form');
const searchForm = document.getElementById('search-form');
const setForm = document.getElementById('set-form');
const sizeSpan = document.getElementById('size-value');
const inorder = document.getElementById('inorder-btn');
const preorder = document.getElementById('preorder-btn');
const postorder = document.getElementById('postorder-btn');
const clear = document.getElementById('clear-btn');
const searchResult = document.getElementById('search-result');
const toggleBtn = document.getElementById('toggle-btn');
const container = document.getElementById("treemap-container");

sidebarToggle();

insertForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const key = parseInt(document.getElementById("insert-key").value);
  const value = parseInt(document.getElementById("insert-value").value);

  try {
    const res = await fetch(`/treemap/insert/${key}/${value}`);
    //console.log("Insert status: ", res.status);
    if (!res.ok) throw new Error();

    await loadData();
    await loadSize();
    updateCodeSnippet(['insert', 'fixInsert', 'rotateLeft', 'rotateRight'], snippets_treemap);
  } catch (err) {
    console.error("Insertion succeeded but update failed:", err);
    alert("Error inserting node into the treemap.");
  }
  e.target.reset();
});

removeForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const key = parseInt(document.getElementById("remove-key").value);
  try {
    const res = await fetch(`/treemap/remove/${key}`);
    if (!res.ok) throw new Error();

    await loadData();
    await loadSize();
    updateCodeSnippet(['remove', 'fixRemove', 'transplant', 'minimum', 'rotateLeft', 'rotateRight'], snippets_treemap);
  } catch (err) {
    alert("Error removing node from the treemap.")
  }
  e.target.reset();
});

searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const key = parseInt(document.getElementById("search-key").value);

  try {
    const res = await fetch(`/treemap/search/${key}`);
    if (!res.ok) throw new Error("Search request failed.");

    const found = await res.json();

    if (found === true) { 
      const infoRes = await fetch(`/treemap/nodeinfo/${key}`);
      if (!infoRes.ok) throw new Error("Failed to fetch node info.");
      
      const nodeInfo = await infoRes.json();
      console.log(nodeInfo);

      document.getElementById('search-result').textContent = `Found key ${nodeInfo.key} at address ${nodeInfo.address} with value ${nodeInfo.value}`;
    } else {
      document.getElementById('search-result').textContent = `Key ${key} not found.`;
    }

    searchForm.reset();
    updateCodeSnippet(['contains', 'search', 'getNodeInfo'], snippets_treemap);
  } catch (err) {
    alert("Error searching for key in treemap.");
  }
  //e.target.reset();
});

setForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const key = parseInt(document.getElementById('set-key').value);
  const value = parseInt(document.getElementById('set-value').value);

  try {
    const res = await fetch(`/treemap/setvalue/${key}/${value}`);
    if (!res.ok) throw new Error("Server rejected setvalue.");

    await loadData();
    updateCodeSnippet(['getValue', 'setValue'], snippets_treemap);
  } catch (err) {
    alert("Invalid key for set.");
  }
  e.target.reset();
});

inorder.addEventListener("click", () => {
  loadTraversal("inorder");
  updateCodeSnippet(['getInorder','inorder'], snippets_treemap);
});

preorder.addEventListener("click", () => {
  loadTraversal("preorder");
  updateCodeSnippet(['getPreorder','preorder'], snippets_treemap);
});

postorder.addEventListener("click", () => {
  loadTraversal("postorder");
  updateCodeSnippet(['getPostorder','postorder'], snippets_treemap);
});

async function loadTraversal(type) {
  try {
    const res = await fetch(`/treemap/${type}`);
    if (!res.ok) throw new Error(`Failed to fetch ${type} traversal`);

    const data = await res.json();

    console.log("Traversal data:", data.values);
    showTraversal(data.values);
  } catch (err) {
    console.error("Traversal error:", err);
    alert("Invalid traversal.");
  }
}

clear.addEventListener('click', async () => {
  try {
    const res = await fetch(`/treemap/clear`);
    if (!res.ok) throw new Error("Failed to clear the tree");

    // Clear the SVG Visualization
    g.innerHTML = "";
    sizeSpan.textContent = "0";
    updateCodeSnippet(['clear', 'privateClear'], snippets_treemap);

  } catch (err) {
    console.error(err);
    alert("Error clearing the tree.");
  }
});

async function loadSize() {
  try {
    const res = await fetch('/treemap/size');
    if (!res.ok) throw new Error("Failed to fetch treemap size");

    const data = await res.json();

    //console.log("Fetched size data:", data);

    sizeSpan.textContent = data ?? "0";
    //console.log("Updated sizeSpan to:", sizeSpan.textContent);
  } catch (err) {
    console.error(err);
    sizeSpan.textContent = "?";
  }
}

// Initialize size display on page load
loadSize();

const svgNS = "http://www.w3.org/2000/svg";
const svg = document.createElementNS(svgNS, "svg");
svg.setAttribute("width", "100%");
svg.setAttribute("height", "100%")
svg.style.border = "1px solid #555";
svg.style.background = "#222";
container.appendChild(svg);

// Group for zoom and pan
const g = document.createElementNS(svgNS, "g");
svg.appendChild(g);

let zoomScale = 1;
let panX = 0, panY = 0;
let isDragging = false;
let dragStart = { x: 0, y: 0 };

svg.addEventListener("wheel", (e) => {
  e.preventDefault();
  const delta = e.deltaY < 0 ? 1.1 : 0.9;
  zoomScale *= delta;
  zoomScale = Math.min(Math.max(zoomScale, 0.1), 5);
  updateTransform();
});

svg.addEventListener("mousedown", (e) => {
  isDragging = true;
  dragStart = { x: e.clientX - panX, y: e.clientY - panY };
});

svg.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  panX = e.clientX - dragStart.x;
  panY = e.clientY - dragStart.y;
  updateTransform();
});

svg.addEventListener("mouseup", () => isDragging = false);
svg.addEventListener("mouseleave", () => isDragging = false);

function updateTransform() {
  g.setAttribute("transform", `translate(${panX},${panY}) scale(${zoomScale})`);
}

// Arrow marker for edges
const defs = document.createElementNS(svgNS, "defs");
const marker = document.createElementNS(svgNS, "marker");
marker.setAttribute("id", "arrowhead");
marker.setAttribute("markerWidth", "10");
marker.setAttribute("markerHeight", "7");
marker.setAttribute("refX", "10");
marker.setAttribute("refY", "3.5");
marker.setAttribute("orient", "auto");
marker.setAttribute("markerUnits", "strokeWidth");

const path = document.createElementNS(svgNS, "path");
path.setAttribute("d", "M0,0 L10,3.5 L0,7");
path.setAttribute("fill", "white");

marker.appendChild(path);
defs.appendChild(marker);
svg.appendChild(defs);

const NODE_RADIUS = 100;
const LEVEL_HEIGHT = 300;
const HORIZONTAL_SPACING = 100;

let traversalMap = new Map();
let traversalMode = false;

function createNodeGroup(node, x, y) {
  const group = document.createElementNS(svgNS, "g");
  group.setAttribute("transform", `translate(${x},${y})`);

  const radius = NODE_RADIUS;

  // Draw the node circle
  const circle = document.createElementNS(svgNS, "circle");
  circle.setAttribute("r", radius);
  circle.setAttribute("cx", 0);
  circle.setAttribute("cy", 0);
  circle.setAttribute("fill", node.color.toUpperCase() === "RED" ? "red" : "black");
  circle.setAttribute("stroke", "#fff");
  circle.setAttribute("stroke-width", 2);
  group.appendChild(circle);

  // Determine text color (black text for red nodes, white otherwise)
  const textFill = node.color.toUpperCase() === "RED" ? "black" : "white";

  const baseFontFamily = "monospace";

  // Helper function to add text lines inside the node
  const addText = (text, yPos, options = {}) => {
    const t = document.createElementNS(svgNS, "text");
    t.setAttribute("x", options.x ?? 0);
    t.setAttribute("y", yPos);
    t.setAttribute("fill", options.fill ?? textFill);
    t.setAttribute("font-family", baseFontFamily);
    t.setAttribute("font-size", options.fontSize ?? 12);
    t.setAttribute("text-anchor", options.anchor ?? "middle");
    if (options.fontWeight) t.style.fontWeight = options.fontWeight;
    if (options.textDecoration) t.style.textDecoration = options.textDecoration;
    t.textContent = text;
    group.appendChild(t);
  };

  // Place address at the top center inside the circle
  addText(node.address || "nullptr", -40);

  // Key and Value centered, bigger and bold
  addText(`Key: ${node.key}`, -10, { fontSize: 16, fontWeight: "bold" });
  addText(`Value: ${node.value}`, 20, { fontSize: 16, fontWeight: "bold" });

  // Left and Right addresses near bottom, positioned relative to center
  addText(node.leftAddress || "nullptr", radius - 30, { x: -60, anchor: "start" });
  addText(node.rightAddress || "nullptr", radius - 30, { x: 60, anchor: "end" }); 

  // Traversal Order Numbers
  if (traversalMode && traversalMap.has(node.address)) {
    const order = traversalMap.get(node.address);
    addText(`#${order + 1}`, -radius - 40, {
      fill: "yellow",
      fontSize: 30,
      fontWeight: "bold",
    });
  }

  return group;
}

function createArrow(fromNode, toNode, isLeft) {
  const angleOffset = isLeft ? -1 : 1;
  const fromX = fromNode.x + angleOffset * NODE_RADIUS * 0.8;
  const fromY = fromNode.y + NODE_RADIUS * 0.6;

  const toX = toNode.x;
  const toY = toNode.y - NODE_RADIUS;

  // Line
  const line = document.createElementNS(svgNS, "line");
  line.setAttribute("x1", fromX);
  line.setAttribute("y1", fromY);
  line.setAttribute("x2", toX);
  line.setAttribute("y2", toY);
  line.setAttribute("stroke", "white");
  line.setAttribute("stroke-width", "2");
  line.setAttribute("marker-end", "url(#arrowhead)");

  // Label (midpoint of line)
  const label = document.createElementNS(svgNS, "text");
  const labelX = (fromX + toX) / 2;
  const labelY = (fromY + toY) / 2 - 5;
  label.setAttribute("x", labelX);
  label.setAttribute("y", labelY);
  label.setAttribute("fill", "white");
  label.setAttribute("font-size", "20");
  label.setAttribute("text-anchor", "middle");
  label.setAttribute("font-family", "monospace");
  label.textContent = toNode.address;

  return { line, label };
}

let nextX = 0;

function layoutTree(node, depth = 0) {
  if (!node) return;

  // Traverse left subtree first
  layoutTree(node.left, depth + 1);

  // Assign current node's x position and increment nextX
  node.x = nextX;
  nextX += NODE_RADIUS * 2 + HORIZONTAL_SPACING;

  // Assign y position by depth
  node.y = depth * LEVEL_HEIGHT;

  // Traverse right subtree
  layoutTree(node.right, depth + 1);
}


function renderTree(node) {
  if (!node) return;

  if (node.left) {
    const { line, label } = createArrow(node, node.left, true);
    g.appendChild(line);
    g.appendChild(label);
    renderTree(node.left);
  }
  if (node.right) {
    const { line, label } = createArrow(node, node.right, false);
    g.appendChild(line);
    g.appendChild(label);
    renderTree(node.right);
  }

  g.appendChild(createNodeGroup(node, node.x, node.y));
}

function centerTreeHorizontally(nodes, svgWidth) {
  const treeMinX = Math.min(...nodes.map(n => n.x));
  const treeMaxX = Math.max(...nodes.map(n => n.x));
  const treeWidth = treeMaxX - treeMinX;

  const offsetX = (svgWidth - treeWidth) / 2 - treeMinX;

  nodes.forEach(n => {
    n.x += offsetX;
  });
}

export function updateTreeMapView(data) {
  g.innerHTML = "";
  traversalMap.clear();
  traversalMode = false;

  const nodesByAddress = {};
  for (const node of data.nodes) {
    nodesByAddress[node.address] = node;
  }

  for (const node of data.nodes) {
    const n = nodesByAddress[node.address];
    n.left = node.left !== "nullptr" ? nodesByAddress[node.left] : null;
    n.right = node.right !== "nullptr" ? nodesByAddress[node.right] : null;
    n.parentAddress = node.parent !== "nullptr" ? node.parent : null;
    n.leftAddress = typeof node.left === "string" ? node.left : node.left?.address ?? "nullptr";
    n.rightAddress = typeof node.right === "string" ? node.right : node.right?.address ?? "nullptr";
  }

  const rootNode = data.nodes.find(n => n.parent === "nullptr");
  if (!rootNode) {
    const emptyText = document.createElementNS(svgNS, "text");
    emptyText.setAttribute("x", 10);
    emptyText.setAttribute("y", 20);
    emptyText.setAttribute("fill", "white");
    emptyText.textContent = "Tree is empty";
    g.appendChild(emptyText);
    return;
  }

  const root = nodesByAddress[rootNode.address];

  nextX = 0;
  layoutTree(root);
  centerTreeHorizontally(data.nodes, svg.clientWidth || container.clientWidth || 800);
  renderTree(root);
  updateTransform();
}

export function showTraversal(traversalNodes) {
  traversalMap.clear();
  traversalMode = true;
 
  if (!traversalNodes || traversalNodes.length === 0) return;

  const nodesByAddress = {};
  for (const node of traversalNodes) {
    nodesByAddress[node.address] = node;
  }

  for (const node of traversalNodes) {
    node.left = node.left !== "nullptr" ? nodesByAddress[node.left] : null;
    node.right = node.right !== "nullptr" ? nodesByAddress[node.right] : null;

    node.leftAddress = node.left ? node.left.address : "nullptr";
    node.rightAddress = node.right ? node.right.address : "nullptr";

    node.parentAddress = node.parent !== "nullptr" ? node.parent : null;
  };

  const rootNode = traversalNodes.find(n => n.parent === "nullptr" || !nodesByAddress[n.parent]);

  if (!rootNode) {
    const emptyText = document.createElementNS(svgNs, "text");
    emptyText.setAttribute("x", 10);
    emptyText.setAttribute("y", 20);
    emptyText.setAttribute("fill", "white");
    emptyText.textContent = "Tree is empty";
    g.appendChild(emptyText);
    return;
  }

  traversalNodes.forEach((node, i) => {
    traversalMap.set(node.address, i);
  });

  nextX = 0;
  layoutTree(rootNode);
  centerTreeHorizontally(traversalNodes, svg.clientWidth || container.clientWidth || 800);
  g.innerHTML = "";
  renderTree(rootNode);
  updateTransform();
}


async function loadData() {
  try {
    const res = await fetch('/treemap/data');
    const data = await res.json();
    updateTreeMapView(data);

    const resultElem = document.getElementById('search-result');
    if (resultElem) resultElem.textContent = '';
  } catch (err) {
    console.error("Failed to load treemap data:", err);
  }
}

loadData();

