# ClearView — consent-based camera streaming

A basic WebRTC demo with a camera-sharing page and a remote viewer page.

## Requirements
- Node.js 18 or newer
- A modern browser
- HTTPS for remote deployment (localhost works for local testing)
- A TURN server for reliable connections across restrictive networks

## Run locally
1. Extract the ZIP.
2. Open a terminal in the extracted `camera-stream` folder.
3. Run `npm install`
4. Run `npm start`
5. Open http://localhost:3000 on the sharing computer.
6. Click **Allow camera & microphone**, then **Start sharing**.
7. Open the viewer link shown on the sharing page in another browser/device and use the room code.

For a second device on your Wi-Fi, use the computer's LAN IP address, but camera access usually requires HTTPS on non-localhost devices. Use an HTTPS deployment for real testing across devices.

## Important deployment notes
- The included STUN server is not sufficient for every network. Configure an authenticated TURN server in both `public/index.html` and `public/viewer.html` by adding it to the `iceServers` array. Do not expose permanent TURN credentials in public client code; use short-lived credentials from your backend.
- Deploy behind HTTPS and secure the room with a hard-to-guess code. This demo does not include user accounts, room passwords, rate limiting, or production security controls.
- This demo is intended for visible, permission-based sharing. It does not bypass browser permissions or keep a camera active after permission is revoked.
- Browsers and mobile operating systems may suspend camera/audio capture in background tabs or when the device locks. A web app cannot guarantee continuous background streaming.
- Video resolution and latency depend on device capability, network quality, and TURN routing.
