export function sidebarToggle(sidebarId = 'sidebar', toggleBtnId = 'toggle-btn') {
  const sidebar = document.getElementById(sidebarId);
  const toggleBtn = document.getElementById(toggleBtnId);

  if (!sidebar || !toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    toggleBtn.textContent = sidebar.classList.contains('collapsed') ? '⮞' : '⮜'; 
  });
}

export function updateCodeSnippet(keys, snippets = {}) {
  const codeBlock = document.getElementById('code-snippet');
  if (!codeBlock) return;

  const combinedCode = keys?.length
    ? keys.map(k => snippets[k] || `Snippet for "${k}" not found.`).join('\n\n')
    : "// No code snippet available."

  codeBlock.textContent = combinedCode;
  delete codeBlock.dataset.highlighted;
  hljs.highlightElement(codeBlock);
}

export function clearSearchResult() {
  const resultElem = document.getElementById('search-result');
  if (resultElem) resultElem.textContent = '';
}


export async function fetchData(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return await res.json();
}
