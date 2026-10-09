# The Last Checkout — multiplayer server

This folder is the whole game plus a tiny server. The server does two jobs:
1. Serves the game page (`public/index.html`).
2. Relays multiplayer messages between everyone who joins the same room code.

It runs free on Render (render.com).

## Put it online (about 15 minutes, one time)

### 1. Put the files on GitHub
1. Make a free account at https://github.com (skip if you have one).
2. Click **+** (top right) → **New repository**. Name it `the-last-checkout`. Public or private both work. Click **Create repository**.
3. On the new repo page, click **uploading an existing file**.
4. Drag in everything from this folder: `server.js`, `package.json`, `package-lock.json`, `render.yaml`, `README.md`, and the whole `public` folder.
5. Click **Commit changes**.

### 2. Deploy on Render
1. Go to https://render.com and sign up with your GitHub account. No credit card needed.
2. Click **New** → **Blueprint**, pick the `the-last-checkout` repo, and click **Apply**. Render reads `render.yaml` and sets everything up on the Free plan.
   - If you'd rather click through it: **New** → **Web Service** → pick the repo. Then set Runtime **Node**, Build command `npm install`, Start command `npm start`, Instance type **Free** → **Create Web Service**.
3. Wait for the log to say **Your service is live**. Your game address is at the top of the page and looks like `https://the-last-checkout-xxxx.onrender.com`.

### 3. Play together
1. Everyone opens the game address in Chrome, Edge, or Firefox on a computer.
2. Everyone types the **same room code** (for example `HOTEL`) and clicks **Join hotel**.
3. The first player in the room is the host. The host clicks **Open the doors**, or the round starts on its own once everyone clicks **Ready**.

Rooms hold up to 8 people. Different room codes are separate games.

## Use your own domain (optional, still free)
1. In Render, open the service → **Settings** → **Custom Domains** → **Add Custom Domain**. Enter something like `hotel.yourdomain.com`.
2. Render shows a **CNAME** record. At your domain registrar's DNS settings, add that CNAME: host `hotel`, pointing to your `....onrender.com` address.
3. Back in Render, click **Verify**. Render adds the HTTPS certificate on its own. It can take anywhere from a few minutes to an hour.

## Things to know about the free plan
- After 15 minutes with nobody playing, the server goes to sleep. The next person to open the game waits about a minute while it wakes up. After that it's normal speed.
- 750 free hours a month is far more than one game needs.
- Rooms reset if the server restarts or redeploys. Just rejoin with the same code.

## Updating the game later
Replace `public/index.html` in the GitHub repo (**Add file** → **Upload files**, then commit). Render redeploys on its own within a minute or two.

## Run it on your own computer instead (same Wi-Fi only)
1. Install Node.js 18 or newer from https://nodejs.org.
2. In this folder, run `npm install` and then `npm start`.
3. Open http://localhost:3000. Others on the same Wi-Fi open `http://YOUR-COMPUTER-IP:3000`. Find your IP with `ipconfig` on Windows or in System Settings → Network on Mac.
