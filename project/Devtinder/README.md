# DevTinder — API

The backend for **DevTinder**, a "Tinder for developers": users sign up, browse other developers, send and review connection requests, and reset a forgotten password by email.

Built with **Node.js**, **Express 5**, **MongoDB (Mongoose)**, **JWT** cookie authentication, **bcrypt** and **Nodemailer**.

The frontend is in [`../devTinder-web`](../devTinder-web/README.md).

## Getting started

### 1. Install

```bash
git clone https://github.com/Raushan75/DevTinder.git
cd DevTinder
npm install
```

### 2. Create the `.env` file

Create `DevTinder/.env` (it is git-ignored, never commit it, and `git pull` never brings it):

```env
# required
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/devTinder
JWT_SECRET=a-long-random-secret-string
CLIENT_URL=http://localhost:5173

# optional
PORT=3000

# optional: real password-reset emails (without these, emails are printed in the terminal)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=youraddress@gmail.com
SMTP_PASS=your-16-character-app-password
EMAIL_FROM=DevTinder <youraddress@gmail.com>
```

| Variable | Required | Purpose |
| -------- | -------- | ------- |
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Signs the login token. Changing it logs everyone out |
| `CLIENT_URL` | ✅ | Frontend address: allowed by CORS and used in reset-password links |
| `PORT` | — | Server port (default `3000`) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | — | Email server for reset links. For Gmail, `SMTP_PASS` is an [App Password](https://myaccount.google.com/apppasswords), not your normal password |
| `EMAIL_FROM` | — | Sender shown in emails (default: `SMTP_USER`) |

### 3. Run

```bash
npm run dev     # nodemon: restarts on file changes
# or
npm start       # plain node
```

You should see `database connected successfully` and `server is running on port 3000`.

## Project structure

```
src/
├── app.js                   # Express app, CORS, routers, DELETE /user, server start
├── config/database.js       # MongoDB connection (MONGODB_URI)
├── middleware/auth.js       # userAuth: verifies the JWT in the `token` cookie
├── models/
│   ├── user.js              # User schema (password hash never sent to clients)
│   └── connectionRequest.js # Connection request schema
├── routes/
│   ├── auth.js              # signup, login, logout, forgot / reset password
│   ├── profile.js           # view / edit profile, change password
│   ├── request.js           # send & review connection requests
│   └── user.js              # received requests, connections, feed
└── utils/
    ├── validation.js        # signup, password and profile-edit validation
    └── sendEmail.js         # Nodemailer, or prints to the console without SMTP
```

## Authentication

- `POST /login` and `POST /signup` set an **httpOnly** `token` cookie (JWT, valid for 1 day, `sameSite: lax`).
- Routes marked 🔒 need that cookie. Without a valid one they return **401**.
- Passwords are stored as **bcrypt** hashes. The hash, reset token and `__v` are removed from every JSON response.
- Login replies **"Invalid email or password"** for both a wrong email and a wrong password, so emails can't be probed.
- Emails are matched case-insensitively (`Prince@gmail.com` = `prince@gmail.com`).

**Password rules** (signup, reset and change): at least 8 characters with an uppercase letter, a lowercase letter, a number and a symbol, e.g. `Elon@1234`.

## API

All errors are returned as plain text with a 4xx/5xx status.

### Auth

| Method | Path | Body | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/signup` | `firstName` (2+ chars), `lastName`, `emailId`, `password` | Create an account, sets the cookie, returns `{ message, data: user }` |
| POST | `/login` | `emailId`, `password` | Log in, sets the cookie, returns the user |
| POST | `/logout` | — | Clears the cookie |
| POST | `/forgot-password` | `emailId` | Emails a reset link (valid 15 min). Always the same reply, whether or not the email exists |
| POST | `/reset-password/:token` | `password` | Sets a new password. The link works once |

### Profile 🔒

| Method | Path | Body | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/profile/view` | — | The logged-in user |
| PATCH | `/profile/edit` | Any of `firstName`, `lastName`, `photoUrl`, `about`, `skills`, `gender`, `age` | Update the profile. Other fields are rejected. Empty `age` / `gender` clears them |
| PATCH | `/profile/forgot-password` | `password` | Change the password of the logged-in user |

### Connection requests 🔒

| Method | Path | Description |
| ------ | ---- | ----------- |
| POST | `/request/send/:status/:toUserId` | `status` = `interested` or `ignored`. Rejects yourself, unknown users and duplicates |
| POST | `/request/review/:status/:requestId` | `status` = `accepted` or `rejected`. Only for `interested` requests sent to you |

### User 🔒

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/user/request/received` | Pending requests sent to you; the sender's profile is in `fromUserId` |
| GET | `/user/connections` | The other user of each accepted request |
| GET | `/feed?page=1&limit=10` | Developers you haven't interacted with (not yourself). `limit` max 50 |

Other users' profiles only include `firstName`, `lastName`, `photoUrl`, `about`, `age`, `gender`, `skills` — never their email.

### Account 🔒

| Method | Path | Description |
| ------ | ---- | ----------- |
| DELETE | `/user` | Deletes **your own** account and all your connection requests, and clears the cookie |

## Example (curl)

```bash
# log in and save the cookie
curl -c cookies.txt -H "Content-Type: application/json" \
  -d '{"emailId":"you@example.com","password":"YourStr0ng!Pass"}' \
  http://localhost:3000/login

# call a protected route with the cookie
curl -b cookies.txt http://localhost:3000/feed

# request a password reset (link appears in the server terminal without SMTP)
curl -H "Content-Type: application/json" \
  -d '{"emailId":"you@example.com"}' \
  http://localhost:3000/forgot-password
```

## Deployment (AWS EC2 · Red Hat Enterprise Linux)

The app runs on an **AWS EC2** instance with **Red Hat Enterprise Linux (RHEL)**, using `dnf` as the package manager.

### 1. Launch the instance

1. AWS Console → **EC2 → Launch instance**.
2. AMI: **Red Hat Enterprise Linux**. Instance type: `t2.micro` / `t3.micro` (free tier).
3. Create (or pick) a **key pair** and download the `.pem` file.
4. **Security group** inbound rules:

   | Type | Port | Source | Why |
   | ---- | ---- | ------ | --- |
   | SSH | 22 | My IP | Log in to the server |
   | HTTP | 80 | Anywhere | Frontend (nginx) |
   | Custom TCP | 3000 | Anywhere | Not needed when nginx proxies `/api` to the backend (the default setup) |

### 2. Connect over SSH

```bash
# the key must be readable only by you, or ssh refuses it
chmod 400 devtinder-key.pem

# RHEL's default user is ec2-user
ssh -i devtinder-key.pem ec2-user@<EC2-PUBLIC-IP>
```

On Windows, run these in Git Bash or WSL (or use PuTTY with a `.ppk` key).

### 3. Install Node.js and Git

```bash
sudo dnf update -y
sudo dnf install -y git nodejs     # nodejs includes npm
node -v && npm -v && git --version
```

If `node -v` is older than you need (the frontend's Vite needs 20.19+), install Node 20.19.0 with NVM or the official binary — see [DevTinder-web → Deployment, step 2](../devTinder-web/README.md#2-install-nodejs-2019).

### 4. Get the code

```bash
cd ~
git clone https://github.com/Raushan75/DevTinder.git
cd DevTinder
npm install
```

### 5. Create the `.env` on the server

`.env` is git-ignored, so it is **not** in the repo: create it once on the server. Without it you get `MONGODB_URI is missing in the .env file`.

`nano` is not installed by default on EC2. Install it, or use `vi`:

```bash
sudo dnf install -y nano
nano .env           # save: Ctrl+O, Enter · exit: Ctrl+X
# or
vi .env             # i = type, Esc then :wq + Enter = save and quit
```

Or write it without an editor (replace the values first):

```bash
cat > .env << 'EOF'
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/devTinder
JWT_SECRET=a-long-random-secret-string
CLIENT_URL=http://<EC2-PUBLIC-IP>
PORT=3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=youraddress@gmail.com
SMTP_PASS=your-16-character-app-password
EMAIL_FROM=DevTinder <youraddress@gmail.com>
EOF
```

Then protect and check it:

```bash
chmod 600 .env      # only your user can read it
cat .env
```

In **MongoDB Atlas → Network Access**, allow the EC2 instance's public IP, otherwise you get `database connection failed`.

### 6. Start the backend with PM2

[PM2](https://pm2.keymetrics.io/) keeps the API running after you close SSH, restarts it if it crashes, and starts it again after a reboot.

```bash
# install once (globally)
sudo npm install -g pm2
pm2 -v

# start — run this from inside DevTinder/, because .env is read from the current folder
cd ~/DevTinder
pm2 start src/app.js --name devtinder-api

# keep it alive after a reboot
pm2 save
pm2 startup          # copy and run the `sudo env PATH=...` command it prints
pm2 save
```

Check it: `curl http://localhost:3000/feed` should reply `401` (it needs a login), which means the server is up.

#### PM2 commands

| Command | What it does |
| ------- | ------------ |
| `pm2 list` | Show all apps and their status (`online`, `errored`, `stopped`) |
| `pm2 logs devtinder-api` | Live logs (`Ctrl+C` to exit) |
| `pm2 logs devtinder-api --lines 100` | Last 100 log lines |
| `pm2 flush` | Clear all log files |
| `pm2 restart devtinder-api` | Restart (after `git pull`) |
| `pm2 restart devtinder-api --update-env` | Restart and reload changed environment variables |
| `pm2 stop devtinder-api` | Stop the app (stays in the list) |
| `pm2 start devtinder-api` | Start a stopped app again |
| `pm2 delete devtinder-api` | Stop and remove it from PM2 |
| `pm2 describe devtinder-api` | Details: script path, working folder, restarts, uptime |
| `pm2 monit` | Live CPU / memory dashboard |
| `pm2 save` | Remember the current app list for reboots |
| `pm2 unstartup` | Turn off start-on-boot |

If you changed `.env`, run `pm2 restart devtinder-api` so the app reads the new values.

### 7. Deploy the frontend

The frontend is deployed on the same server with Nginx — the full, tested steps are in [DevTinder-web → Deployment](../devTinder-web/README.md#deployment-aws-ec2--red-hat-linux--nginx).

Nginx forwards `/api/*` to this backend and strips the prefix (`/api/feed` → `http://localhost:3000/feed`), so the routes here stay unchanged. The config is in [DevTinder-web → step 6](../devTinder-web/README.md#6-configure-nginx-react-routes--api-proxy). Before building the frontend, set `BASE_URL` in `src/libs/utils/constants.js` to `"/api"`, and in this `.env` set `CLIENT_URL=http://<EC2-PUBLIC-IP>`.

Check the proxy from the server:

```bash
curl http://localhost:3000/feed     # backend directly
curl http://localhost/api/feed      # through nginx: same response = proxy works
```

### RHEL specifics

| Topic | Command / note |
| ----- | -------------- |
| SELinux blocks nginx → Node (`502 Bad Gateway`) | `sudo setsebool -P httpd_can_network_connect 1` |
| `firewalld` (if enabled) | `sudo firewall-cmd --permanent --add-service=http && sudo firewall-cmd --reload` |
| Package manager | `dnf` (not `apt`) |

### Updating after a new commit

```bash
cd ~/DevTinder
git pull
npm install
pm2 restart devtinder-api
pm2 logs devtinder-api --lines 20    # check it started without errors
```

`git pull` never touches `.env`, so you don't need to recreate it.

For the frontend, see [DevTinder-web → Redeploy after a change](../devTinder-web/README.md#redeploy-after-a-change).

## Troubleshooting

| Problem | Fix |
| ------- | --- |
| `MONGODB_URI is missing in the .env file` | Create `.env` as shown above. With PM2, the app must be started from inside `DevTinder/` (check with `pm2 describe devtinder-api` → `exec cwd`); if not, `pm2 delete devtinder-api`, `cd ~/DevTinder`, and start it again |
| `nano: command not found` | `sudo dnf install -y nano`, or use `vi .env` |
| `pm2: command not found` | `sudo npm install -g pm2` |
| App shows `errored` in `pm2 list` | `pm2 logs devtinder-api --lines 50` to see the error |
| API not running after reboot | Run `pm2 startup` (and the command it prints), then `pm2 save` |
| `database connection failed` | Check `MONGODB_URI`, and that your IP is allowed in MongoDB Atlas → Network Access |
| Frontend shows "Cannot reach the server" | The server isn't running, or the frontend's `BASE_URL` is wrong (`"/api"` behind nginx, `http://localhost:3000` locally) |
| `http://<EC2-IP>/api/...` gives `502 Bad Gateway` | Nginx can't reach Node. Check `pm2 list` and `curl http://localhost:3000/feed`. If the app shows `errored`, read `pm2 logs devtinder-api` (often `database connection failed`, which means the Atlas IP isn't allowed). If Node is up, run `sudo setsebool -P httpd_can_network_connect 1` |
| CORS error in the browser | `CLIENT_URL` must exactly match the frontend address |
| Everyone got logged out | `JWT_SECRET` changed, or the 1-day token expired |
| `Cannot GET /<route>` after adding a route | An old server is still on port 3000 — stop it and restart |
| Reset email not sent | Without SMTP settings the email is printed in the terminal. With Gmail, use an App Password and port 465 |

## Security notes

- Keep `.env` out of git. The MongoDB connection string used to be written in `src/config/database.js`, so it is still in the git history: **change that database user's password** in MongoDB Atlas and update `MONGODB_URI`.
- Use a long random `JWT_SECRET` in production, and serve over HTTPS (then add `secure: true` to the cookie options in `routes/auth.js`).
