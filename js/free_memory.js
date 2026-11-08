import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

async function freeMemory(unload, cache) {
  await api.fetchApi("/free", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ unload_models: unload, free_memory: cache }),
  });
}

function makeButton(text, onClick) {
  const b = document.createElement("button");
  b.textContent = text;
  b.style.cssText = `padding:5px 9px; background:#333; color:#fff;
    border:1px solid #666; border-radius:6px; cursor:pointer; font-size:12px;`;
  b.onclick = async () => {
    await onClick();
    const old = b.textContent;
    b.textContent = "✔ Listo";
    setTimeout(() => (b.textContent = old), 1200);
  };
  return b;
}

app.registerExtension({
  name: "Custom.FreeMemoryButtons",
  async setup() {
    const panel = document.createElement("div");
    panel.style.cssText = `position:fixed; z-index:9999; display:flex;
      flex-direction:column; gap:4px; padding:6px; background:rgba(20,20,20,.85);
      border:1px solid #555; border-radius:8px;`;

    // Posición inicial (abajo a la izquierda) o la guardada
    const saved = JSON.parse(localStorage.getItem("freeMemPos") || "null");
    if (saved) {
      panel.style.left = saved.left + "px";
      panel.style.top = saved.top + "px";
    } else {
      panel.style.left = "10px";
      panel.style.bottom = "80px"; // subí/bajá este número para ajustar
    }

    // Barra para arrastrar
    const handle = document.createElement("div");
    handle.textContent = "⠿ Memoria";
    handle.style.cssText = "cursor:move; font-size:11px; color:#aaa; text-align:center; user-select:none;";
    panel.appendChild(handle);

    panel.appendChild(makeButton("🧹 Liberar VRAM", () => freeMemory(true, false)));
    panel.appendChild(makeButton("🧹 Liberar RAM", () => freeMemory(false, true)));
    panel.appendChild(makeButton("🧹 Liberar TODO", () => freeMemory(true, true)));
    document.body.appendChild(panel);

    // Lógica de arrastre
    let dragging = false, ox = 0, oy = 0;
    handle.addEventListener("mousedown", (e) => {
      dragging = true;
      const r = panel.getBoundingClientRect();
      ox = e.clientX - r.left;
      oy = e.clientY - r.top;
      panel.style.bottom = "auto";
      e.preventDefault();
    });
    document.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      panel.style.left = e.clientX - ox + "px";
      panel.style.top = e.clientY - oy + "px";
    });
    document.addEventListener("mouseup", () => {
      if (!dragging) return;
      dragging = false;
      localStorage.setItem("freeMemPos", JSON.stringify({
        left: parseInt(panel.style.left),
        top: parseInt(panel.style.top),
      }));
    });
  },
});
