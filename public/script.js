const add_form = document.getElementById('add-form');
const input = document.getElementById('value-input');
const container = document.getElementById('array-container');
const sizeSpan = document.getElementById('size');
const capacitySpan = document.getElementById('capacity');
const insert_form = document.getElementById('insert-form');
const remove_form = document.getElementById('remove-form');
const clear = document.getElementById('clear-button');
const search_form = document.getElementById('search-form');
const set_form = document.getElementById('set-form');
const shrink_button = document.getElementById('shrink-button');


add_form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const value = input.value;
  if(!value) return;
  await fetch(`/add/${value}`);
  input.value = '';
  await loadData();
});

insert_form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const index = document.getElementById('insert-index').value;
  const value = document.getElementById('insert-value').value;
  if (!value || index < 0) return;

  const res = await fetch(`/insert/${index}/${value}`);
  if (res.ok) {
    await loadData();
  } else {
    alert("Invalid index for insert.");
  }

  index.value = '';
  value.value = '';
});

remove_form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const index = document.getElementById('remove-index').value;
  const res = await fetch(`/remove/${index}`);
  if (res.ok) {
    await loadData();
  } else {
    alert("Invalid index for removal.");
  }
  index.value = '';
});

search_form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const val = document.getElementById('search-value').value;
  const containsRes = await fetch(`/contains/${val}`);
  const indexRes = await fetch(`/indexof/${val}`);
  const contains = await containsRes.text();
  const index = await indexRes.text();
  document.getElementById('search-result').textContent =
    contains == "true"
      ? `Found at index ${index}`
      : "Not found in list";

  val.value = '';
});

set_form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const index = document.getElementById('set-index').value;
  const value = document.getElementById('set-value').value;
  const res = await fetch(`/set/${index}/${value}`);
 
  index.value = '';
  value.value = '';

  if (res.ok) {
    await loadData();
  } else {
    alert("Invalid index");
  }

  
});

shrink_button.addEventListener('click', async (e) => {
  await fetch('/shrink');
  await loadData();
});

clear.addEventListener('click', async (e) => {
  await fetch('/clear');
  await loadData();
});

function updateView(data) {
  container.innerHTML = "";
  const { size, capacity, values } = data;

  for (let i = 0; i < capacity; i++) {
    const div = document.createElement("div");
    div.className = "box";
    if (i < size) {
      div.textContent = values[i];
      div.style.backgroundColor = "#cce5ff";
    } else {
      div.style.backgroundColor = "#eee"
    }
    container.appendChild(div);
  }
}

async function loadData() {
try {  
  const res = await fetch('/data');
  const json = await res.json()

  sizeSpan.textContent = json.size;
  capacitySpan.textContent = json.capacity;

  updateView(json);   
} catch (err) {
    console.error("Error fetching data:", err);
  }
}

loadData();
