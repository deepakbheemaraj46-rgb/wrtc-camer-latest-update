# Consent Live Camera demo

## Render deployment
- Repository root should contain `package.json` and `server.js`.
- Put `index.html` and `viewer.html` inside `public/`.
- Render service type: Web Service.
- Root Directory: leave blank if package.json is at the repository root.
- Build Command: `npm install`
- Start Command: `npm start`

## Use
1. Open the deployed HTTPS site for the camera page.
2. Enter a room code and click Connect to room.
3. Click Allow camera & microphone and approve the browser prompt.
4. Click Start sharing.
5. Send the viewer URL and same room code to your intended viewer.
6. To end sharing, press Stop sharing.

## Limitations and safety
This is a learning demo, not a production-secure service. Use a long private room code and share it only with intended viewers. Add authentication, authorization, rate limits, and a TURN server before public use. STUN-only WebRTC may fail on some mobile/carrier networks; TURN can improve connectivity. Mesh streaming uses more bandwidth for every extra viewer, so use an SFU for larger audiences.

Camera access requires HTTPS (except localhost) and explicit browser permission. A site cannot guarantee streaming after the camera owner closes the tab/browser, nor can it force permission or reliably run in every social-media in-app browser. Keep the active sharing indicator and Stop button visible; do not hide active camera use or redirect the user away while streaming.
