import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

async function freeMemory(unload, cache) {
  await api.fetchApi("/free", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ unload_models: unload, free_memory: cache }),
  });
}

function makeButton(text, onClick, top) {
  const b = document.createElement("button");
  b.textContent = text;
  b.style.cssText = `position:fixed; right:10px; top:${top}px; z-index:9999;
    padding:6px 10px; background:#333; color:#fff; border:1px solid #666;
    border-radius:6px; cursor:pointer; font-size:12px;`;
  b.onclick = async () => {
    await onClick();
    const old = b.textContent;
    b.textContent = "✔ Listo";
    setTimeout(() => (b.textContent = old), 1200);
  };
  document.body.appendChild(b);
}

app.registerExtension({
  name: "Custom.FreeMemoryButtons",
  async setup() {
    makeButton("🧹 Liberar VRAM", () => freeMemory(true, false), 60);
    makeButton("🧹 Liberar RAM", () => freeMemory(false, true), 95);
    makeButton("🧹 Liberar TODO", () => freeMemory(true, true), 130);

    // OPCIONAL: liberar automáticamente cuando termina la cola
    // (descomentá las líneas de abajo)
    // api.addEventListener("status", ({ detail }) => {
    //   if (detail?.exec_info?.queue_remaining === 0) freeMemory(true, true);
    // });
  },
});
