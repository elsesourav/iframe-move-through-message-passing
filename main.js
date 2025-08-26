// Page messaging utilities
function pagePostMessage(type, data, contentWindow = window.parent) {
   contentWindow.postMessage({ type, data }, "*");
}

function pageOnMessage(type, callback) {
   window.addEventListener("message", (event) => {
      if (event.data?.type === type) {
         callback(event.data.data, event);
      }
   });
}

// Draggable element
const move = document.getElementById("move");

let entered = false;
let dragging = false;
let framePos = { x: 0, y: 0 };
let dragOffset = { x: 0, y: 0 };

const resizeWindowStart = () => {
   // Expand iframe to full viewport
   pagePostMessage("resize", {
      width: "100svw",
      height: "100svh",
      x: "0px",
      y: "0px",
   });
   move.style.left = `${framePos.x}px`;
   move.style.top = `${framePos.y}px`;
};

const resizeWindowEnd = () => {
   // Shrink iframe back to original size
   const left = Number.parseFloat(move.style.left) || 0;
   const top = Number.parseFloat(move.style.top) || 0;
   framePos = { x: Math.round(left), y: Math.round(top) };

   move.style.opacity = "0";
   pagePostMessage("resize", {
      width: "250px",
      height: "120px",
      x: `${framePos.x}px`,
      y: `${framePos.y}px`,
   });
   move.style.left = "0px";
   move.style.top = "0px";
   setTimeout(() => {
      move.style.opacity = "1";
   }, 10);
   move.style.pointerEvents = "auto";
};

// Expand on hover
move.addEventListener("pointerenter", () => {
   if (entered) return;
   entered = true;
   resizeWindowStart();
});

// Collapse when leaving
move.addEventListener("pointerleave", () => {
   if (!entered || dragging) return;
   entered = false;
   resizeWindowEnd();
});

// Start drag
move.addEventListener("pointerdown", (e) => {
   if (!entered) {
      entered = true;
      resizeWindowStart();
   }
   dragging = true;
   const rect = move.getBoundingClientRect();
   dragOffset.x = e.clientX - rect.left;
   dragOffset.y = e.clientY - rect.top;
   move.style.pointerEvents = "none";
   if (move.setPointerCapture) move.setPointerCapture(e.pointerId);
});

// Handle dragging
window.addEventListener("pointermove", (e) => {
   if (!dragging) return;
   const newLeft = e.clientX - dragOffset.x;
   const newTop = e.clientY - dragOffset.y;
   move.style.left = `${newLeft}px`;
   move.style.top = `${newTop}px`;
});

// End drag
window.addEventListener("pointerup", (e) => {
   if (!dragging) return;
   dragging = false;
   entered = false;
   if (move.releasePointerCapture) move.releasePointerCapture(e.pointerId);
   resizeWindowEnd();
});
