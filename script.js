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

pageOnMessage("resize", (data) => {
   if (!mainIframeEl) return;
   mainIframeEl.style.width = data.width;
   mainIframeEl.style.height = data.height;
   mainIframeEl.style.left = data.x;
   mainIframeEl.style.top = data.y;
});
