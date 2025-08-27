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

// Handle element inside iframe used to drag
const dragHandle = document.getElementById("dragHandle");

// State flags
let isExpanded = false; // whether iframe is currently expanded to full viewport
let isDragging = false; // whether a drag gesture is active
let iframePosition = { x: 0, y: 0 }; // last committed iframe left/top in parent
let pointerOffset = { x: 0, y: 0 }; // pointer offset from handle's top-left during drag
let collapsePending = false; // set true on pointerup; collapse on subsequent pointerleave
let expandTimer = null;



// Collision detection function to keep drag within viewport bounds
const applyCollisionDetection = (left, top) => {
   const dragRect = dragHandle.getBoundingClientRect();
   const dragWidth = dragRect.width || 250; // fallback to default width
   const dragHeight = dragRect.height || 120; // fallback to default height

   // Get viewport dimensions
   const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
   const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
   
   // Constrain position to viewport bounds
   const constrainedLeft = Math.max(0, Math.min(left, viewportWidth - dragWidth));
   const constrainedTop = Math.max(0, Math.min(top, viewportHeight - dragHeight));

   return { x: constrainedLeft, y: constrainedTop };
};

// Expand iframe to full viewport so pointer events aren't clipped
const expandIframeToViewport = () => {
   clearTimeout(expandTimer);

   dragHandle.style.opacity = "0";
   pagePostMessage("resize", {
      width: "100svw",
      height: "100svh",
      x: "0px",
      y: "0px",
   });
   dragHandle.style.left = `${iframePosition.x}px`;
   dragHandle.style.top = `${iframePosition.y}px`;
   setTimeout(() => {
      dragHandle.style.opacity = "1";
   }, 10);
};

// Shrink iframe back to fixed size at the committed position
const shrinkIframeToBox = () => {
   clearTimeout(expandTimer);

   expandTimer = setTimeout(() => {
      dragHandle.style.opacity = "0";
      const left = Number.parseFloat(dragHandle.style.left) || 0;
      const top = Number.parseFloat(dragHandle.style.top) || 0;
      iframePosition = { x: Math.round(left), y: Math.round(top) };
      pagePostMessage("resize", {
         width: "250px",
         height: "120px",
         x: `${iframePosition.x}px`,
         y: `${iframePosition.y}px`,
      });
      dragHandle.style.left = "0px";
      dragHandle.style.top = "0px";
      setTimeout(() => {
         dragHandle.style.opacity = "1";
      }, 10);
   }, 300);
};

// Expand on hover
dragHandle.addEventListener("pointerenter", () => {
   if (isExpanded) return;
   isExpanded = true;
   expandIframeToViewport();
});

// Collapse when leaving (only if not dragging)
dragHandle.addEventListener("pointerleave", () => {
   if (!isExpanded || isDragging) return;
   isExpanded = false;
   shrinkIframeToBox();
});

// Start drag on press
dragHandle.addEventListener("pointerdown", (e) => {
   if (!isExpanded) {
      isExpanded = true;
      expandIframeToViewport();
   }
   isDragging = true;
   const rect = dragHandle.getBoundingClientRect();
   pointerOffset.x = e.clientX - rect.left;
   pointerOffset.y = e.clientY - rect.top;
   if (dragHandle.setPointerCapture) dragHandle.setPointerCapture(e.pointerId);
});

// Move handle with pointer
window.addEventListener("pointermove", (e) => {
   if (!isDragging) return;
   const newLeft = e.clientX - pointerOffset.x;
   const newTop = e.clientY - pointerOffset.y;

   // Apply collision detection to keep menu within viewport
   const constrainedPosition = applyCollisionDetection(newLeft, newTop);

   dragHandle.style.left = `${constrainedPosition.x}px`;
   dragHandle.style.top = `${constrainedPosition.y}px`;
});

// End drag on release; collapse after subsequent leave
dragHandle.addEventListener("pointerup", (e) => {
   if (!isDragging) return;
   isDragging = false;
   isExpanded = false;
   collapsePending = true;
   if (dragHandle.releasePointerCapture)
      dragHandle.releasePointerCapture(e.pointerId);

   const left = Number.parseFloat(dragHandle.style.left) || 0;
   const top = Number.parseFloat(dragHandle.style.top) || 0;

   // Apply collision detection to final position
   const constrainedPosition = applyCollisionDetection(left, top);
   dragHandle.style.left = `${constrainedPosition.x}px`;
   dragHandle.style.top = `${constrainedPosition.y}px`;

   iframePosition = {
      x: Math.round(constrainedPosition.x),
      y: Math.round(constrainedPosition.y),
   };
});

// After pointerup, wait for pointer to leave handle, then shrink iframe
dragHandle.addEventListener("pointerleave", () => {
   if (!collapsePending) return;
   collapsePending = false;
   shrinkIframeToBox();
});
