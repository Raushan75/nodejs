# DevTinder — API

The backend for **DevTinder**, a "Tinder for developers": users sign up, browse other developers, send and review connection requests, and reset a forgotten password by email.

Built with **Node.js**, **Express 5**, **MongoDB (Mongoose)**, **JWT** cookie authentication, **bcrypt** and **Nodemailer**.

The frontend is in [`../devTinder-web`](../devTinder-web/README.md).

## Getting started

### 1. Install

```bash
cd project/Devtinder
npm install
```

### 2. Create the `.env` file

Create `Devtinder/.env` (it is git-ignored, never commit it):

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

## Troubleshooting

| Problem | Fix |
| ------- | --- |
| `MONGODB_URI is missing in the .env file` | Create `.env` as shown above |
| `database connection failed` | Check `MONGODB_URI`, and that your IP is allowed in MongoDB Atlas → Network Access |
| Frontend shows "Cannot reach the server" | The server isn't running, or isn't on the port in the frontend's `BASE_URL` |
| CORS error in the browser | `CLIENT_URL` must exactly match the frontend address |
| Everyone got logged out | `JWT_SECRET` changed, or the 1-day token expired |
| `Cannot GET /<route>` after adding a route | An old server is still on port 3000 — stop it and restart |
| Reset email not sent | Without SMTP settings the email is printed in the terminal. With Gmail, use an App Password and port 465 |

## Security notes

- Keep `.env` out of git. The MongoDB connection string used to be written in `src/config/database.js`, so it is still in the git history: **change that database user's password** in MongoDB Atlas and update `MONGODB_URI`.
- Use a long random `JWT_SECRET` in production, and serve over HTTPS (then add `secure: true` to the cookie options in `routes/auth.js`).
