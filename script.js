// Page messaging utilities (for injected scripts)
function pagePostMessage(type, data, contentWindow = window) {
   contentWindow.postMessage({ type, data }, "*");
}

function pageOnMessage(type, callback) {
   window.addEventListener("message", (event) => {
      if (event.data.type === type) {
         callback(event.data.data, event);
      }
   });
}

const mainIframeEl = document.getElementById("mainIframe");
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

pageOnMessage("start_drag", (data) => {
   if (!mainIframeEl) return;
   isDragging = true;
   dragOffset.x = Number(data?.offsetX) || 0;
   dragOffset.y = Number(data?.offsetY) || 0;
   mainIframeEl.style.pointerEvents = "none";
});

function endDrag() {
   if (!isDragging) return;
   isDragging = false;
   if (mainIframeEl) mainIframeEl.style.pointerEvents = "auto";
   pagePostMessage("drag_end");
}

addEventListener("pointermove", (e) => {
   if (!isDragging || !mainIframeEl) return;
   e.preventDefault();
   const left = e.clientX - dragOffset.x;
   const top = e.clientY - dragOffset.y;
   mainIframeEl.style.left = `${left}px`;
   mainIframeEl.style.top = `${top}px`;
});

addEventListener("pointerup", endDrag);
addEventListener("pointercancel", endDrag);
addEventListener("blur", endDrag);
