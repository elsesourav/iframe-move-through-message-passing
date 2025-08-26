// Parent page messaging utilities
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

// The iframe element we move around the parent page
const mainIframeEl = document.getElementById("mainIframe");
 
// The iframe page asks the parent to resize/reposition the iframe
pageOnMessage("resize", (data) => {
   if (!mainIframeEl) return;
   mainIframeEl.style.width = data.width;
   mainIframeEl.style.height = data.height;
   mainIframeEl.style.left = data.x;
   mainIframeEl.style.top = data.y;
});
