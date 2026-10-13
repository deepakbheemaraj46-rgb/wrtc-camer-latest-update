# Multi-camera live sharing (consent-based)

## Included files
- `camera.html` — camera owner page with visible preview, Start/Stop, and a confirmation prompt for each viewer.
- `viewer.html` — dashboard automatically discovers all currently sharing cameras; no manual camera ID or share link is required.
- `server.js` — WebSocket signaling server.
- `package.json` — Render install/start configuration.

## Local run
1. Install Node.js 18 or newer.
2. In this folder run `npm install`, then `npm start`.
3. Open `http://localhost:10000/` for the camera page and `http://localhost:10000/viewer` for the viewer dashboard.
4. On each camera device, press **Start Camera** and grant camera/microphone permission. Keep the page open.
5. On the viewer dashboard, available cameras appear automatically. Each camera owner must approve the viewer prompt.

## Render
- Upload these five files directly into the repository root (not an extra nested folder).
- Build Command: `npm install`
- Start Command: `npm start`
- Use the Render HTTPS URL. Browsers require HTTPS for camera access outside localhost.

## Important limitations
- This is a prototype, not production-secure. Anyone who can access the viewer page may discover active camera sessions and request access; owners must approve each request. Add authentication and per-user authorization before public deployment.
- It uses a public STUN server only. For reliable connections across restrictive/mobile networks, configure a reputable TURN service and add its credentials to both pages.
- Audio playback may require the viewer to press **Enable Audio** because browsers block autoplay with sound.
- A camera stops sharing when its owner presses Stop or closes the page.
