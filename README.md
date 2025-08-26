# Draggable Iframe with Message Passing

A simple demo showing how to make an iframe draggable using `postMessage`. The iframe expands to full screen while dragging for smooth movement, then shrinks back to its final position.

## Why Use This Pattern

**Problem**: Browser extension content scripts struggle with custom floating UI:

-  Host page CSS conflicts with your styles
-  Site overlays can block pointer events
-  Layout changes break your widget

**Solution**: Use an iframe for UI isolation:

-  Your CSS stays separate from the host page
-  Reliable pointer event handling
-  Still floats via `position: fixed`

**Challenge**: Dragging iframes is hard because pointer events get lost during fast movement.

**This Solution**:

-  Expand iframe to full viewport during drag (no clipped events)
-  Track movement inside the iframe only
-  Commit final position back to parent on drop

## How It Looks

### Initial State (Small Iframe)

<div style="position: relative; width: 400px; height: 200px; background: #f0f0f0; border: 1px solid #ccc;">
  <!-- Parent page viewport -->
  <div style="position: absolute; top: 10px; left: 10px; width: 250px; height: 120px; background: #00f3; border: 1px solid #333;">
    <!-- iframe with semi-transparent blue background -->
    <div style="position: absolute; top: 0; left: 0; width: 250px; height: 120px; background: orange; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; cursor: pointer;">
      iframe
    </div>
  </div>
  <div style="position: absolute; bottom: 5px; right: 5px; font-size: 12px; color: #666;">Parent Page (400×200)</div>
</div>

### Hover State (Expanded)

<div style="position: relative; width: 400px; height: 200px; background: #f0f0f0; border: 1px solid #ccc;">
  <!-- Parent page viewport -->
  <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #00f3; border: 1px solid #333;">
    <!-- iframe expanded to full viewport -->
    <div style="position: absolute; top: 10px; left: 10px; width: 250px; height: 120px; background: orange; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; cursor: pointer;">
      iframe
    </div>
  </div>
  <div style="position: absolute; bottom: 5px; right: 5px; font-size: 12px; color: #666; z-index: 10;">Iframe Expanded (400×200)</div>
</div>

### Drag State (Handle Moving)

<div style="position: relative; width: 400px; height: 200px; background: #f0f0f0; border: 1px solid #ccc;">
  <!-- Parent page viewport -->
  <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #00f3; border: 1px solid #333;">
    <!-- iframe expanded, handle moved -->
    <div style="position: absolute; top: 60px; left: 120px; width: 250px; height: 120px; background: orange; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; cursor: grabbing; box-shadow: 0 4px 8px rgba(0,0,0,0.3);">
      iframe
    </div>
  </div>
  <div style="position: absolute; bottom: 5px; right: 5px; font-size: 12px; color: #666; z-index: 10;">Dragging (expanded iframe)</div>
</div>

### Final State (New Position)

```html
<div
   style="position: relative; width: 400px; height: 200px; background: #f0f0f0; border: 1px solid #ccc;"
>
   <!-- Parent page viewport -->
   <div
      style="position: absolute; top: 60px; left: 120px; width: 250px; height: 120px; background: #00f3; border: 1px solid #333;"
   >
      <!-- iframe shrunk back to small size at new position -->
      <div
         style="position: absolute; top: 0; left: 0; width: 250px; height: 120px; background: orange; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; cursor: pointer;"
      >
         iframe
      </div>
   </div>
   <div
      style="position: absolute; bottom: 5px; right: 5px; font-size: 12px; color: #666;"
   >
      Dropped at new position
   </div>
</div>
```

You never move the iframe directly during drag. You move a box inside the iframe, then commit that position back to the parent on drop.

## Files

-  `index.html` — Parent page that hosts the iframe.
-  `style.css` — Styles for the parent and the iframe element.
-  `script.js` — Parent-side message listener (applies `width/height/left/top`).
-  `iframe.html` — Iframe content variant (has `<div id="dragHandle">iframe</div>`).
-  `iframeMain.html` — Alternative iframe content variant (similar to `iframe.html`).
-  `main.js` — Iframe-side logic to expand/shrink and track drag.

## Technical Details

**Message**: `resize` from iframe to parent  
**Data**: `{ width, height, x, y }`  
**Action**: Parent updates iframe styles

**Drag steps:**

1. pointerenter → expand iframe to full viewport
2. pointerdown → start drag, remember offset
3. pointermove → update handle position
4. pointerup → send final position, shrink iframe

## Getting Started

Open `index.html` in your browser. Hover the orange box, drag it around, and release. The iframe will snap to a small box at the drop position.

## Customization

-  **Iframe size**: Edit values in `main.js` and `#mainIframe` in `style.css`
-  **Handle appearance**: Modify styles in `iframe.html`
-  **Boundaries**: Add position clamping before sending resize messages

## License

MIT — see `LICENSE`.
