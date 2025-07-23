const defaultBps = [
  { name: "Desktop", width: 1200 },
  { name: "Tablet", width: 768 },
  { name: "Mobile", width: 375 },
];

const bpList = document.getElementById("bpList");
const addBpBtn = document.getElementById("addBp");
const form = document.getElementById("previewForm");
const urlInput = document.getElementById("urlInput");

// Breakpoint Editor render
function renderBpEditor() {
  bpList.innerHTML = "";
  defaultBps.forEach((bp) => createBpItem(bp));
}

// Li creation with inputs and remove button
function createBpItem(bp) {
  const li = document.createElement("li");
  li.className = "bp-item";
  li.innerHTML = `
    <input type="text"  class="bp-name"  value="${bp.name}"  placeholder="Label" />
    <input type="number" class="bp-width" value="${bp.width}" placeholder="Width" />
    <button class="remove-bp" title="Remove">&times;</button>
  `;
  bpList.appendChild(li);
}

// Sort editor items ascending by width
function sortBpEditor() {
  const items = Array.from(bpList.children);
  items.sort((a, b) => {
    const aw = parseInt(a.querySelector(".bp-width").value, 10) || 0;
    const bw = parseInt(b.querySelector(".bp-width").value, 10) || 0;
    return aw - bw;
  });
  items.forEach((li) => bpList.appendChild(li));
}

// Add new breakpoint
addBpBtn.addEventListener("click", () => {
  createBpItem({ name: "New", width: 100 });
  sortBpEditor();
});

// Remove breakpoint & resort
bpList.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-bp")) {
    e.target.closest("li").remove();
    sortBpEditor();
  }
});

// Resort on width change
bpList.addEventListener("change", (e) => {
  if (e.target.classList.contains("bp-width")) {
    sortBpEditor();
  }
});

// Form submit → collect breakpoints & render previews
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const url = urlInput.value.trim();
  if (!url) return;

  // Gather & sort breakpoints
  const items = document.querySelectorAll(".bp-item");
  const bps = Array.from(items)
    .map((li) => ({
      name: li.querySelector(".bp-name").value || "BP",
      width: parseInt(li.querySelector(".bp-width").value, 10) || 0,
    }))
    .filter((bp) => bp.width > 0)
    .sort((a, b) => a.width - b.width);

  renderPreviewGrid(url, bps);
});

// Generate the preview if URL was present on load (optional)
// renderPreviewGrid("https://example.com", defaultBps);

// Renders iframes in the grid
function renderPreviewGrid(url, bps) {
  const grid = document.querySelector(".preview-grid");
  grid.innerHTML = "";
  bps.forEach((bp) => {
    const box = document.createElement("div");
    box.className = "preview-box";

    const title = document.createElement("h2");
    title.textContent = `${bp.name} (${bp.width}px)`;
    box.appendChild(title);

    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.width = bp.width;
    iframe.height = 600;
    box.appendChild(iframe);

    grid.appendChild(box);
  });
}

renderBpEditor();
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const q = params.get("url");
  if (!q) return;

  urlInput.value = decodeURIComponent(q);

  form.dispatchEvent(new Event("submit", { cancelable: true }));
});
