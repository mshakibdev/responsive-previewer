// ➊ Default breakpoints (with height for placeholder labels)
const defaultBreakpoints = [
  { name: "Mobile", width: 360, height: 640 },
  { name: "Tablet", width: 1024, height: 768 },
  { name: "Desktop", width: 1280, height: 800 },
];

const bpList = document.getElementById("bpList");
const addBpButton = document.getElementById("addBp");
const resetButton = document.getElementById("resetBp");
const previewForm = document.getElementById("previewForm");
const urlInput = document.getElementById("urlInput");
const sortSelect = document.getElementById("sortOrder");
const previewGrid = document.querySelector(".preview-grid");

function createBpItem(bp) {
  const li = document.createElement("li");
  li.className = "bp-item";
  li.innerHTML = `
    <input type="text"  class="bp-name"  value="${bp.name}"  placeholder="Label">
    <input type="number" class="bp-width" value="${bp.width}" placeholder="Width">
    <button class="remove-bp" title="Remove">&times;</button>
  `;
  return li;
}

// ➋ In renderBreakpointEditor(), append each default item *and* tag it with .default-bp:

function renderBreakpointEditor() {
  bpList.innerHTML = "";
  defaultBreakpoints.forEach((bp) => {
    const li = createBpItem(bp);
    li.classList.add("default-bp"); // mark it
    bpList.appendChild(li);
  });
  sortBreakpointEditor();
}

// ➌ Sort the editor list
function sortBreakpointEditor() {
  const order = sortSelect.value;
  Array.from(bpList.children)
    .sort((a, b) => {
      const aw = +a.querySelector(".bp-width").value;
      const bw = +b.querySelector(".bp-width").value;
      return order === "asc" ? aw - bw : bw - aw;
    })
    .forEach((li) => bpList.appendChild(li));
}

// ➍ Show placeholder panels
function renderPlaceholderGrid() {
  previewGrid.innerHTML = "";
  defaultBreakpoints.forEach((bp) => {
    const box = document.createElement("div");
    box.className = "preview-box placeholder";
    // ① Set the actual width & height
    box.style.width = bp.width + "px";
    box.style.height = bp.height + "px";

    const label = document.createElement("h3");
    label.textContent = `${bp.name} ${bp.width}×${bp.height}`;
    box.appendChild(label);
    previewGrid.appendChild(box);
  });
}

// ➎ Show real iframes
function renderPreviewGrid(url, breakpoints) {
  previewGrid.innerHTML = "";
  breakpoints.forEach((bp) => {
    const box = document.createElement("div");
    box.className = "preview-box";
    const title = document.createElement("h3");
    title.textContent = `${bp.name} (${bp.width}px)`;
    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.width = bp.width;
    iframe.height = bp.height || 600;
    box.appendChild(title);
    box.appendChild(iframe);
    previewGrid.appendChild(box);
  });
}

// ➏ Wire up the editor controls
addBpButton.addEventListener("click", () => {
  const li = document.createElement("li");
  li.className = "bp-item";
  li.innerHTML = `
    <input type="text"  class="bp-name"  placeholder="Label">
    <input type="number" class="bp-width" placeholder="Width">
    <button class="remove-bp">&times;</button>
  `;
  bpList.appendChild(li);
  sortBreakpointEditor();
});

bpList.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-bp")) {
    e.target.closest("li").remove();
    sortBreakpointEditor();
  }
});

bpList.addEventListener("change", (e) => {
  if (e.target.classList.contains("bp-width")) {
    sortBreakpointEditor();
  }
});

sortSelect.addEventListener("change", sortBreakpointEditor);

// ➐ Form submit → preview
previewForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const url = urlInput.value.trim();
  if (!url) return;

  const items = document.querySelectorAll(".bp-item");
  const bps = Array.from(items)
    .map((li) => ({
      name: li.querySelector(".bp-name").value || "BP",
      width: +li.querySelector(".bp-width").value,
    }))
    .filter((bp) => bp.width > 0)
    .sort((a, b) => {
      return sortSelect.value === "asc" ? a.width - b.width : b.width - a.width;
    });

  renderPreviewGrid(url, bps);
});

resetButton.addEventListener("click", () => {
  // Remove only the custom ones:
  document
    .querySelectorAll("#bpList li:not(.default-bp)")
    .forEach((li) => li.remove());

  // Re‑sort the remaining defaults:
  sortBreakpointEditor();

  // Refresh the preview area:
  const url = urlInput.value.trim();
  if (url) {
    // trigger the same logic as form submit
    previewForm.dispatchEvent(new Event("submit", { cancelable: true }));
  } else {
    renderPlaceholderGrid();
  }
});
// ➑ On load or when the URL field is cleared, show placeholders
window.addEventListener("DOMContentLoaded", () => {
  renderBreakpointEditor();
  renderPlaceholderGrid();
});

urlInput.addEventListener("blur", () => {
  if (!urlInput.value.trim()) renderPlaceholderGrid();
});
