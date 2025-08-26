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

function dragStart(e) {
   e.preventDefault();
   pagePostMessage("start_drag", {
      offsetX: e.clientX,
      offsetY: e.clientY,
   });
}

window.addEventListener("pointerdown", dragStart);
