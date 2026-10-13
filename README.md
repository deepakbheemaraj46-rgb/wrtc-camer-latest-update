# Consent-based camera sharing demo

## Files
- `server.js` — HTTP + WebSocket signaling server
- `camera.html` — visible camera preview, explicit Start/Stop controls
- `viewer.html` — viewer page; enter the camera ID shared by the camera owner
- `package.json` — Render/npm configuration

## Run locally
1. Install Node.js.
2. In this folder run `npm install`.
3. Run `npm start`.
4. Open `http://localhost:10000/` for the camera page.
5. Open `http://localhost:10000/viewer` in another browser/device and enter the camera ID.

Camera access requires a secure context: HTTPS on deployed sites, or localhost for local testing. Both camera and viewer need network connectivity. This demo uses STUN only; some networks require a properly configured TURN server. Do not expose it publicly without adding authentication, authorization, rate limiting, and private room access.

The camera page visibly shows the local preview and has a Stop Camera button. Browser/device settings can stop camera access when a page is closed or suspended; this project does not bypass those controls.
