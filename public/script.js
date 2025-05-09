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
    const contains = await containsRes.text();
    const index = await indexRes.text();

    document.getElementById('search-result').textContent =
      contains === "true" ? `Found at index ${index}` : "Not found in list";

    form.reset();
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
  } catch (err) {
    alert("Invalid index for set.");
  }
});

shrink_button.addEventListener('click', async () => {
  try {
    const res = await fetch('/arraylist/shrink');
    if (!res.ok) throw new Error("Server rejected shrink");

    await loadData();
  } catch (err) {
    alert("Error during shrink operation.");
  }
});

clear.addEventListener('click', async () => {
  try {
    const res = await fetch('/arraylist/clear');
    if (!res.ok) throw new Error("Server rejected clear");

    await loadData();
  } catch (err) {
    alert("Error clearing the list.");
  }
});


const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggle-btn');

toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
  toggleBtn.textContent = sidebar.classList.contains('collapsed') ? '⮞' : '⮜';
});

function updateView(data) {
  container.innerHTML = "";
  const { size, capacity, values } = data;

  const baseAddress = 0x1000;
  const addressStride = 4;

  for (let i = 0; i < capacity; i++) {
    const div = document.createElement("div");
    div.className = "box";

    // Address 
    const address = document.createElement("div");
    address.className = "address";
    address.textContent = `0x${(baseAddress + i * addressStride).toString(16)}`;

    // Value (empty if not in use)
    const valueElem = document.createElement("div");
    valueElem.className = "value";
    if (i < size) {
      valueElem.textContent = values[i];
      div.style.backgroundColor = "#66aaff";
    } else {
      valueElem.textContent = "";
      div.style.backgroundColor = "#eee";
    }

    // Index 
    const indexElem = document.createElement("div");
    indexElem.className = "index";
    indexElem.textContent = `Index: ${i}`;

    // Append to box
    div.appendChild(address);
    div.appendChild(valueElem);
    div.appendChild(indexElem);

    container.appendChild(div);
  }

}

async function loadData() {
try {  
  const res = await fetch('/arraylist/data');
  const json = await res.json()

  sizeSpan.textContent = json.size;
  capacitySpan.textContent = json.capacity;

  updateView(json);   
} catch (err) {
    console.error("Error fetching data:", err);
  }
}

loadData();
