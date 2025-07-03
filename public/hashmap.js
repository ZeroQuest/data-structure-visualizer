import { updateCodeSnippet, sidebarToggle } from './utils.js';
import { snippets_hashmap } from './snippets_hashmap.js';

const insertForm = document.getElementById('insert-form');
const removeForm = document.getElementById('remove-form');
const searchForm = document.getElementById('search-form');
const setForm = document.getElementById('set-form');
const clearBtn = document.getElementById('clear-btn');
const container = document.getElementById('hashmap-container');
const sizeSpan = document.getElementById('size-value');
const toggleBtn = document.getElementById('toggle-btn');

// Sidebar functionality
sidebarToggle();

// Insert a key-value pair
insertForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const key = parseInt(document.getElementById('insert-key').value);
  const value = document.getElementById('insert-value').value;

  try {
    const res = await fetch(`/hashmap/insert/${key}/${value}`);
    if (!res.ok) throw new Error("Insert failed");

    //console.log()

    await loadData();
    updateCodeSnippet(['insert', 'hash', 'resize'], snippets_hashmap);
  } catch (err) {
    alert("Error inserting into the hash map.");
  }
  e.target.reset();
});

removeForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const key = parseInt(document.getElementById('remove-key').value);

  try {
    const res = await fetch(`/hashmap/remove/${key}`);
    if (!res.ok) throw new Error("Remove failed");

    await loadData();
    updateCodeSnippet(['remove', 'hash'], snippets_hashmap);
  } catch (err) {
    alert("Error removing from the hash map.");
    console.error(err);
  }
  e.target.reset();
});

searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const key = parseInt(document.getElementById('search-key').value);

  try {
    const res = await fetch(`/hashmap/has/${key}`);
    if (!res.ok) throw new Error("Search request failed");

    const found = await res.json();
    console.log(found, found.value);

    if (found === true) {
      const infoRes = await fetch(`/hashmap/get/${key}`);
      if (!infoRes.ok) throw new Error("Failed to fetch key info.");

      const info = await infoRes.json();

      document.getElementById('search-result').textContent = `Found key ${info.key} with value ${info.value}`;
    } else {
      document.getElementById('search-result').textContent = `Key ${key} not found.`;
    }

    updateCodeSnippet(['search', 'get', 'hash'], snippets_hashmap);
  } catch (err) {
    alert("Error searching for key in hashmap.");
  }
  e.target.reset();
});

setForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const key = parseInt(document.getElementById('set-key').value);
  const value = parseInt(document.getElementById('set-value').value);

  try {
    const res = await fetch(`/hashmap/set/${key}/${value}`);
    if (!res.ok) throw new Error("Server rejected set");

    await loadData();
    updateCodeSnippet(['set', 'getPointer', 'hash'], snippets_hashmap);
  } catch (err) {
    alert("Invalid key for set.");
  }
  e.target.reset();
});

clearBtn.addEventListener('click', async () => {
  try {
    const res = await fetch(`/hashmap/clear`);
    if (!res.ok) throw new Error("Failed to clear the tree");

    await loadData();
    updateCodeSnippet(['clear'], snippets_hashmap);
  } catch (err) {
    console.error(err);
    alert("Error clearing the hashmap.");
  }
});

function initializeHashmapSVG(containerId = "hashmap-container") {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Clear any existing contents
  container.innerHTML = "";

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.style.border = "1px solid #555";
  svg.style.background = "#222";
  container.appendChild(svg);

  // Zoom/pan transform group
  const g = document.createElementNS(svgNS, "g");
  svg.appendChild(g);

  // Set up arrow marker
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

  // Zoom & pan setup
  setupZoomPan(svg, g);

  return { svg, g };
}

function setupZoomPan(svg, viewport) {
  let isPanning = false;
  let startX, startY;
  let transform = { x: 0, y: 0, scale: 1 };

  function setTransform() {
    viewport.setAttribute("transform", `translate(${transform.x},${transform.y}) scale(${transform.scale})`);
  }

  svg.addEventListener("wheel", (e) => {
    e.preventDefault();
    const scaleAmount = -e.deltaY * 0.001;
    let newScale = transform.scale + scaleAmount;
    newScale = Math.min(Math.max(newScale, 0.2), 5);

    const rect = svg.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const dx = (mx - transform.x) / transform.scale;
    const dy = (my - transform.y) / transform.scale;

    transform.x -= dx * (newScale - transform.scale);
    transform.y -= dy * (newScale - transform.scale);
    transform.scale = newScale;

    setTransform();
  });

  svg.addEventListener("mousedown", (e) => {
    isPanning = true;
    startX = e.clientX - transform.x;
    startY = e.clientY - transform.y;
  });

  svg.addEventListener("mousemove", (e) => {
    if (!isPanning) return;
    transform.x = e.clientX - startX;
    transform.y = e.clientY - startY;
    setTransform();
  });

  svg.addEventListener("mouseup", () => { isPanning = false; });
  svg.addEventListener("mouseleave", () => { isPanning = false; });

  setTransform();
}


function renderHashmapVisualization(hashmapArray) {
  const { svg, g } = initializeHashmapSVG("hashmap-container");
  const svgNS = "http://www.w3.org/2000/svg";

  const indexBoxWidth = 140;
  const indexBoxHeight = 50;
  const indexSpacing = 40;
  const nodeWidth = 140;
  const nodeHeight = 100;
  const verticalSpacing = 10;
  const pointerLength = nodeHeight;
  const columnSpacing = 60;

  const font = {
    family: "monospace",
    fill: "white",
    size: 14,
  };

  const boxFill = "#222";
  const boxStroke = "#999";

  hashmapArray.forEach((chain, index) => {
    const x = index * (indexBoxWidth + columnSpacing);
    const y = 0;

    const startX = x + indexBoxWidth / 2;
    const startY = indexBoxHeight;

    //console.log(index, chain);

    // Bucket box
    const indexGroup = document.createElementNS(svgNS, "g");
    indexGroup.setAttribute("transform", `translate(${x}, ${y})`);

    const indexRect = document.createElementNS(svgNS, "rect");
    indexRect.setAttribute("width", indexBoxWidth);
    indexRect.setAttribute("height", indexBoxHeight);
    indexRect.setAttribute("fill", boxFill);
    indexRect.setAttribute("stroke", boxStroke);
    indexRect.setAttribute("rx", 4);
    indexGroup.appendChild(indexRect);

    const indexText = document.createElementNS(svgNS, "text");
    indexText.setAttribute("x", indexBoxWidth / 2);
    indexText.setAttribute("y", indexBoxHeight / 2 + 5);
    indexText.setAttribute("fill", font.fill);
    indexText.setAttribute("font-family", font.family);
    indexText.setAttribute("font-size", font.size);
    indexText.setAttribute("text-anchor", "middle");
    indexText.textContent = index;
    indexGroup.appendChild(indexText);
    g.appendChild(indexGroup);

    // Vertical arrow from bucket to chain
    const downArrow = document.createElementNS(svgNS, "line");
    downArrow.setAttribute("x1", startX);
    downArrow.setAttribute("y1", startY);
    downArrow.setAttribute("x2", startX);
    downArrow.setAttribute("y2", startY + pointerLength);
    downArrow.setAttribute("stroke", "white");
    downArrow.setAttribute("stroke-width", "2");
    downArrow.setAttribute("marker-end", "url(#arrowhead)");
    g.appendChild(downArrow);

    let parentY = startY + pointerLength;
    if (!chain || chain.length === 0) {
      drawNullptrBox(g, svgNS, startX, parentY + verticalSpacing, nodeWidth, nodeHeight, font);
      return;
    }

    for (let i = 0; i < chain.length; i++) {
      const node = chain[i];
      const group = document.createElementNS(svgNS, "g");
      const boxX = startX - nodeWidth / 2;
      const boxY = parentY + verticalSpacing;

      group.setAttribute("transform", `translate(${boxX}, ${boxY})`);

      const rect = document.createElementNS(svgNS, "rect");
      rect.setAttribute("width", nodeWidth);
      rect.setAttribute("height", nodeHeight);
      rect.setAttribute("fill", "none");
      rect.setAttribute("stroke", "white");
      rect.setAttribute("rx", 8);
      group.appendChild(rect);

      const addressText = document.createElementNS(svgNS, "text");
      addressText.setAttribute("x", nodeWidth / 2);
      addressText.setAttribute("y", 16);
      addressText.setAttribute("fill", font.fill);
      addressText.setAttribute("font-family", font.family);
      addressText.setAttribute("font-size", "12");
      addressText.setAttribute("text-anchor", "middle");
      addressText.textContent = node.address;
      group.appendChild(addressText);

      const keyText = document.createElementNS(svgNS, "text");
      keyText.setAttribute("x", nodeWidth / 2);
      keyText.setAttribute("y", nodeHeight / 2 - 5);
      keyText.setAttribute("fill", font.fill);
      keyText.setAttribute("font-size", "16");
      keyText.setAttribute("font-family", font.family);
      keyText.setAttribute("text-anchor", "middle");
      keyText.textContent = `Key: ${node.key}`;
      group.appendChild(keyText);

      const valueText = document.createElementNS(svgNS, "text");
      valueText.setAttribute("x", nodeWidth / 2);
      valueText.setAttribute("y", nodeHeight / 2 + 20);
      valueText.setAttribute("fill", font.fill);
      valueText.setAttribute("font-size", "16");
      valueText.setAttribute("font-family", font.family);
      valueText.setAttribute("text-anchor", "middle");
      valueText.textContent = `Value: ${node.value}`;
      group.appendChild(valueText);

      const nextText = document.createElementNS(svgNS, "text");
      nextText.setAttribute("x", nodeWidth / 2);
      nextText.setAttribute("y", nodeHeight - 5);
      nextText.setAttribute("fill", font.fill);
      nextText.setAttribute("font-size", "12");
      nextText.setAttribute("font-family", font.family);
      nextText.setAttribute("text-anchor", "middle");
      nextText.textContent = node.next || "nullptr";
      group.appendChild(nextText);

      g.appendChild(group);

      const nextY = boxY + nodeHeight;

      if (node.next !== "nullptr") {
        // Draw arrow to next node
        const line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", startX);
        line.setAttribute("y1", nextY);
        line.setAttribute("x2", startX);
        line.setAttribute("y2", nextY + pointerLength);
        line.setAttribute("stroke", "white");
        line.setAttribute("stroke-width", "2");
        line.setAttribute("marker-end", "url(#arrowhead)");
        g.appendChild(line);

        parentY = nextY + pointerLength;
      } else {
        // Draw arrow and nullptr box
        const line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", startX);
        line.setAttribute("y1", nextY);
        line.setAttribute("x2", startX);
        line.setAttribute("y2", nextY + pointerLength);
        line.setAttribute("stroke", "white");
        line.setAttribute("stroke-width", "2");
        line.setAttribute("marker-end", "url(#arrowhead)");
        g.appendChild(line);

        parentY = nextY + pointerLength;
        drawNullptrBox(g, svgNS, startX, parentY + verticalSpacing, nodeWidth, nodeHeight, font);
      }
    }
  });
}

function drawNullptrBox(g, svgNS, xCenter, yTop, width, height, font) {
  const group = document.createElementNS(svgNS, "g");
  group.setAttribute("transform", `translate(${xCenter - width / 2}, ${yTop})`);

  const rect = document.createElementNS(svgNS, "rect");
  rect.setAttribute("width", width);
  rect.setAttribute("height", height);
  rect.setAttribute("fill", "none");
  rect.setAttribute("stroke", "white");
  rect.setAttribute("rx", 8);
  group.appendChild(rect);

  const text = document.createElementNS(svgNS, "text");
  text.setAttribute("x", width / 2);
  text.setAttribute("y", height / 2 + 5);
  text.setAttribute("fill", font.fill);
  text.setAttribute("font-size", "16");
  text.setAttribute("font-family", font.family);
  text.setAttribute("text-anchor", "middle");
  text.textContent = "nullptr";
  group.appendChild(text);

  g.appendChild(group);
}

function groupEntriesByBucket(entries, totalBuckets) {
  const hashmapArray = new Array(totalBuckets).fill(null).map(() => ({}));

  // Build address-indexed maps per bucket
  for (const { key, value, address, bucket, next } of entries) {
    const node = { key, value, address, next, nextRef: null };
    hashmapArray[bucket][address] = node;
  }

  // Resolve nextRef pointers
  for (const bucketMap of hashmapArray) {
    for (const node of Object.values(bucketMap)) {
      if (node.next && bucketMap[node.next]) {
        node.nextRef = bucketMap[node.next];
      }
    }
  }

  // Build ordered chains per bucket
  return hashmapArray.map(bucketMap => {
    const nodes = Object.values(bucketMap);
    if (nodes.length === 0) return [];

    const head = nodes.find(n => !nodes.some(m => m.next === n.address));
    const chain = [];

    let current = head;
    while (current) {
      chain.push(current);
      current = current.nextRef;
    }

    return chain;
  });
}

async function fetchHashmapInfo() {
  try {
    const res = await fetch("/hashmap/info");
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    //console.log("Hashmap Info:", res); 
    
    return res.json();
  } catch (err) {
    console.error("Failed to fetch hashmap info:", err);
    return null;
  }
}

async function updateHashmapInfo() {
  const info = await fetchHashmapInfo();
  if (info) {
    document.getElementById("size-value").textContent = info.size ?? "0";
    document.getElementById("capacity-value").textContent = info.buckets ?? "0";
  }
}

async function loadData() {
  try {
    const [res, info] = await Promise.all([
      fetch("/hashmap/data"),
      fetchHashmapInfo(),
    ]);
    if (!res.ok || !info) throw new Error(`HTTP error: ${res.status}`);

    const data = await res.json();
    //console.log(data);
    //console.log(info.buckets);
    const entries = Array.isArray(data) ? data : []; // Instantiates an empty array if entries is null
    
    const grouped = groupEntriesByBucket(entries, info.buckets);
    renderHashmapVisualization(grouped);
    updateHashmapInfo();
    //console.log(entries);
    const resultElem = document.getElementById('search-result');
    if (resultElem) resultElem.textContent = '';
  } catch (err) {
    console.error("Failed to fetch hash map data:", err);
  }
}

loadData();
