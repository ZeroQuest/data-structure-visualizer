/*
This software includes SVG markup derived from W3C documents.
Copyright © [Year] World Wide Web Consortium.
https://www.w3.org/copyright/software-license-2023/

Permission is hereby granted to copy, modify, and distribute this work, provided that this notice appears in all copies.
*/

import { updateCodeSnippet, sidebarToggle } from './utils.js';
import { snippets_linkedlist } from './snippets_linkedlist.js';

const addForm = document.getElementById('add-form');
const insertForm = document.getElementById('insert-form');
const removeForm = document.getElementById('remove-form');
const searchForm = document.getElementById('search-form');
const insertHeadForm = document.getElementById('insert-head-form');
const setForm = document.getElementById('set-form');
const clear = document.getElementById('clear-button');
const removeHeadForm = document.getElementById('remove-head-form');
const removeTailFrom = document.getElementById('remove-tail-form');
const container = document.getElementById('linkedlist-container');
const sizeSpan = document.getElementById('size-value');
const toggleBtn = document.getElementById('toggle-btn');

// Sidebar functionality
sidebarToggle();

// Faux base address & stride
const BASE_ADDR = 0x1000;
const STRIDE = 4;

addForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const value = e.target['value-input'].value;

  try {
    const res = await fetch(`/linkedlist/add/${value}`);
    if (!res.ok) throw new Error();

    await loadData();
    updateCodeSnippet(['add'], snippets_linkedlist);
  } catch (err) {
    alert("Error adding value to the linked list.");
  }
  e.target.reset();
});

insertHeadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const value = parseInt(document.getElementById("insert-head-value").value);

  try {
    const res = await fetch(`/linkedlist/inserthead/${value}`);
    if (!res.ok) throw new Error();

    await loadData();
    updateCodeSnippet(['insertHead'], snippets_linkedlist);
  } catch (err) {
    alert("Error inserting node at the head of the linked list.");
  }
  e.target.reset();
});

insertForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const index = parseInt(document.getElementById("insert-index").value);
  const value = parseInt(document.getElementById("insert-value").value);

  try {
    const res = await fetch(`/linkedlist/insert/${value}/${index}`);
    if (!res.ok) throw new Error();

    await loadData();
    updateCodeSnippet(['insert'], snippets_linkedlist);
  } catch (err) {
    alert("Error inserting node into the linked list.");
  }  
  e.target.reset();
});

removeHeadForm.addEventListener('submit', async(e) => {
  e.preventDefault();
  try {
    const res = await fetch('/linkedlist/removehead');
    if (!res.ok) throw new Error("Server rejected removing the head");

    await loadData();
    updateCodeSnippet(['removeHead'], snippets_linkedlist);
  } catch (err) {
    alert("Error removing the head.");
  }
  e.target.reset();
});

removeTailFrom.addEventListener('submit', async(e) => {
  e.preventDefault();
  try {
    const res = await fetch(`/linkedlist/removetail`);
    if (!res.ok) throw new Error("Server rejected removing the tail");

    await loadData();
    updateCodeSnippet(['removeTail'], snippets_linkedlist);
  } catch (err) {
    alert("Error removing the tail.");
  }
  e.target.reset();
});

removeForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const index = parseInt(document.getElementById("remove-index").value);

  try {
    const res = await fetch(`/linkedlist/remove/${index}`);
    if (!res.ok) throw new Error();

    await loadData();
    updateCodeSnippet(['remove'], snippets_linkedlist);
  } catch (err) {
    alert("Error removing node from the linked list.")
  }
  e.target.reset();
});

searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const value = parseInt(document.getElementById("search-value").value);
  
  try {
    const containsRes = await fetch(`/linkedlist/contains/${value}`);
    const indexRes = await fetch(`/linkedlist/indexof/${value}`);

    if (!containsRes.ok || !indexRes.ok) {
      throw new Error(`Server returned ${containsRes.status} / ${indexRes.status}`);
    }

    const contains = (await containsRes.text()).trim().toLowerCase();
    const index = await indexRes.text();

    document.getElementById('search-result').textContent = 
      contains === "true" ? `Found at index ${index}` : "Not found in list";

    searchForm.reset();
    updateCodeSnippet(['contains', 'indexOf'], snippets_linkedlist);
  } catch (err) {
    alert("Error while searching.");
    console.error(err);
  }
});

setForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const index = form['set-index'].value;
  const value = form['set-value'].value;

  try {
    const res = await fetch(`/linkedlist/setAt/${index}/${value}`);
    if (!res.ok) throw new Error("Server rejected set");

    form.reset();
    await loadData();
    updateCodeSnippet(['set'], snippets_linkedlist);
  } catch (err) {
    alert("Invalid index for set.");
  }
});

clear.addEventListener('click', async () => {
  try {
    const res = await fetch('/linkedlist/clear');
    if (!res.ok) throw new Error("Server rejected clear");

    await loadData();
    updateCodeSnippet(['clear'], snippets_linkedlist);
  } catch (err) {
    alert("Error clearing the linked list.");
  }
});

// Helper function for faux addresses
function generateAddress(index) {
  return `0x${(BASE_ADDR + index * STRIDE).toString(16)}`;
}

// SVG Creation
export function createSVGArrow() {
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", "60");
  svg.setAttribute("height", "20");

  const arrow = document.createElementNS(svgNS, "line");
  arrow.setAttribute("x1", "0");
  arrow.setAttribute("y1", "10");
  arrow.setAttribute("x2", "60");
  arrow.setAttribute("y2", "10");
  arrow.setAttribute("stroke", "white");
  arrow.setAttribute("stroke-width", "2");
  arrow.setAttribute("marker-end", "url(#arrowhead)");

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
  svg.appendChild(arrow);

  return svg;
}

function updateLinkedListView(data) {
  container.innerHTML = "";
  const { size, values } = data;

  sizeSpan.textContent = size;

  for (let i = 0; i < size; i++) {
    const node = values[i];
    const address = node.address;
    const value = node.data;
    const nextAddress = node.nextAddress;

    // Node box
    const nodeDiv = document.createElement("div");
    nodeDiv.className = "ll-node";

    nodeDiv.innerHTML = `
      <div class="ll-address">${address}</div>
      <div class="ll-box">
        <div class="ll-field-data">
          <div class="ll-label">Data:</div>
          <div class="ll-value">${value}</div>
        </div>
        <div class="ll-field-pointer">
          <div class="ll-label">Pointer:</div>
          <div class="ll-value">${nextAddress}</div>
        </div>
      </div>
      <div class="ll-index">Index: ${i}</div>
    `;
    container.appendChild(nodeDiv);

    // SVG arrow (between nodes only)
    const arrowWrapper = document.createElement("div");
    arrowWrapper.className = "svg-arrow-wrapper";

    if (i < size - 1) {
      arrowWrapper.innerHTML = `
        <div class="pointer-label">${nextAddress}</div>
        <svg class="ll-pointer-arrow" width="50" height="20">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="white" />
            </marker>
          </defs>
          <line x1="0" y1="10" x2="50" y2="10" marker-end="url(#arrowhead)" />
        </svg>
      `;
    } else {
      // Final node (nullptr)
      arrowWrapper.innerHTML = `
        <div class="pointer-label">nullptr</div>
        <svg class="ll-pointer-arrow" width="40" height="20">
          <line x1="0" y1="10" x2="40" y2="10" stroke="white" stroke-dasharray="4 2" />
          <circle cx="40" cy="10" r="3" fill="white" />
        </svg>
      `;
    }

    container.appendChild(arrowWrapper);
  }
}


async function loadData() {
  try {
    const res = await fetch('/linkedlist/data');
    const data = await res.json();
    updateLinkedListView(data);

    const resultElem = document.getElementById('search-result');
    if (resultElem) resultElem.textContent = '';
  } catch (err) {
    console.error("Failed to fetch linked list data:", err);
  }
}

loadData();

