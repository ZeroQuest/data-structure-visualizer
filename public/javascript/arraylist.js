import { sidebarToggle, updateCodeSnippet } from './utils.js';
import { snippets_arraylist } from './snippets_arraylist.js';

// Constants for easier code readablity/coding
const add_form = document.getElementById('add-form');
const input = document.getElementById('value-input');
const container = document.getElementById('array-container');
const sizeSpan = document.getElementById('size-value');
const capacitySpan = document.getElementById('capacity-value');
const insert_form = document.getElementById('insert-form');
const remove_form = document.getElementById('remove-form');
const clear = document.getElementById('clear-button');
const search_form = document.getElementById('search-form');
const set_form = document.getElementById('set-form');
const shrink_button = document.getElementById('shrink-button');

// Arraylist toolbox functions

add_form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const value = form['value-input'].value;
  if (!value) return;

  try {
    const res = await fetch(`/arraylist/add/${value}`);
    if (!res.ok) throw new Error("Server rejected add");

    form.reset();
    await loadData();
    updateCodeSnippet(['resize','ensureCapacity','add'], snippets_arraylist);
  } catch (err) {
    alert("Error adding value.");
  }
});

insert_form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const index = form['insert-index'].value;
  const value = form['insert-value'].value;

  try {
    const res = await fetch(`/arraylist/insert/${index}/${value}`);
    if (!res.ok) throw new Error("Server rejected insert");

    form.reset();
    await loadData();
    updateCodeSnippet(['resize','ensureCapacity','insert'], snippets_arraylist);
  } catch (err) {
    alert("Invalid index for insert.");
  }
});

remove_form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const index = form['remove-index'].value;

  try {
    const res = await fetch(`/arraylist/remove/${index}`);
    if (!res.ok) throw new Error("Server rejected removal");

    form.reset();
    await loadData();
    updateCodeSnippet(['remove'], snippets_arraylist);
  } catch (err) {
    alert("Invalid index for removal.");
  }
});

search_form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const value = form['search-value'].value;

  try {
    const containsRes = await fetch(`/arraylist/contains/${value}`);
    const indexRes = await fetch(`/arraylist/indexof/${value}`);

    if (!containsRes.ok || !indexRes.ok) {
      throw new Error(`Server returned ${containsRes.status} / ${indexRes.status}`);
    }

    const contains = await containsRes.text();
    const index = await indexRes.text();

    document.getElementById('search-result').textContent =
      contains === "true" ? `Found at index ${index}` : "Not found in list";

    form.reset();
    updateCodeSnippet(['contains', 'indexOf'], snippets_arraylist);
  } catch (err) {
    alert("Error while searching.");
  }
});

set_form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const index = form['set-index'].value;
  const value = form['set-value'].value;

  try {
    const res = await fetch(`/arraylist/set/${index}/${value}`);
    if (!res.ok) throw new Error("Server rejected set");

    form.reset();
    await loadData();
    updateCodeSnippet(['set'], snippets_arraylist);
  } catch (err) {
    alert("Invalid index for set.");
  }
});

shrink_button.addEventListener('click', async () => {
  try {
    const res = await fetch('/arraylist/shrink');
    if (!res.ok) throw new Error("Server rejected shrink");

    await loadData();
    updateCodeSnippet(['resize','shrink'], snippets_arraylist);
  } catch (err) {
    alert("Error during shrink operation.");
  }
});

clear.addEventListener('click', async () => {
  try {
    const res = await fetch('/arraylist/clear');
    if (!res.ok) throw new Error("Server rejected clear");

    await loadData();
    updateCodeSnippet(['clear'], snippets_arraylist);
  } catch (err) {
    alert("Error clearing the list.");
  }
});

// Sidebar functionality

sidebarToggle();

// Display functions

function updateView(data) {
  const container = document.getElementById('array-container');
  const sizeSpan = document.getElementById('size-value');
  const capacitySpan = document.getElementById('capacity-value');
  container.innerHTML = "";

  const { size, capacity, values } = data;
  const baseAddress = 0x1000;
  const addressStride = 4;

  sizeSpan.textContent = size;
  capacitySpan.textContent = capacity;

  for (let i = 0; i < capacity; i++) {
    const div = document.createElement("div");
    div.className = "box";

    const address = document.createElement("div");
    address.className = "address";
    address.textContent = `0x${(baseAddress + i * addressStride).toString(16)}`;

    const valueElem = document.createElement("div");
    valueElem.className = "value";
    valueElem.textContent = i < size ? values[i] : "";
    div.style.backgroundColor = i < size ? "#66aaff" : "#eee";

    const indexElem = document.createElement("div");
    indexElem.className = "index";
    indexElem.textContent = `Index: ${i}`;

    div.appendChild(address);
    div.appendChild(valueElem);
    div.appendChild(indexElem);
    container.appendChild(div);
  }
}

async function loadData() {
  try {
    const res = await fetch('/arraylist/data');
    const json = await res.json();

    updateView(json);

    // Clear search result
    const resultElem = document.getElementById('search-result');
    if (resultElem) resultElem.textContent = '';
  } catch (err) {
    console.error("Error fetching data:", err);
  }
}

loadData();
