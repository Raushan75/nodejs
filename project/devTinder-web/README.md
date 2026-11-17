# 👨‍💻 DevTinder — Web

The frontend for **DevTinder**, a "Tinder for developers". Users sign up or log in, swipe through other developers one card at a time (**right = Interested**, **left = Ignore**), edit their profile, see who they're connected with, accept or reject the requests they've received, and reset a forgotten password by email.

Built with **React 19**, **Vite**, **React Router 7**, **Redux Toolkit**, **Axios**, **Tailwind CSS v4** and **daisyUI v5**.

## Features

- **Signup and login** on one page, with a cookie-based session (JWT in an httpOnly `token` cookie). Pressing Enter submits, and a spinner shows while the request runs.
- **Forgot password:** request a reset link by email, then choose a new password from that link (valid for 15 minutes, works once).
- **Stays logged in** after a page refresh. Every page except login / forgot / reset password needs a login.
- **Swipe feed:** one developer card at a time. Drag it (mouse or touch) **right for Interested** or **left to Ignore**. The card tilts, shows an INTERESTED / IGNORE stamp, and flies off. The ← / → keys and the buttons do the same.
- **Edit profile:** a form next to a live preview card, a gender dropdown, an About box with a character counter, and a success toast.
- **Connections:** a grid of everyone you're connected with.
- **Requests:** developers who are interested in you, with **Accept** and **Reject**.
- **Navbar:** Feed / Connections / Requests links with the current page highlighted, plus an avatar menu (Edit profile, Logout). On small screens the links move into the avatar menu.
- **Friendly states everywhere:** loading spinners, empty-state messages, and server errors shown on screen with a **Try again** button.

## Repository layout

This app lives in the [`Raushan75/nodejs`](https://github.com/Raushan75/nodejs) repository, next to its backend:

```
project/
├── Devtinder/        # Backend API — Node.js, Express 5, MongoDB, JWT cookies
└── devTinder-web/    # Frontend — this app
```

See [`../Devtinder/README.md`](../Devtinder/README.md) for the backend setup and the full API reference.

## Tech stack

| Tool | Purpose |
| ---- | ------- |
| [React 19](https://react.dev/) | UI library |
| [Vite](https://vite.dev/) | Dev server and build tool |
| [React Router 7](https://reactrouter.com/) (`react-router-dom`) | Client-side routing |
| [Redux Toolkit](https://redux-toolkit.js.org/) + `react-redux` | Global state: the logged-in user, feed, connections and requests |
| [Axios](https://axios-http.com/) | HTTP requests to the backend, sent with cookies (`withCredentials: true`) |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first styling, via `@tailwindcss/vite` |
| [daisyUI v5](https://daisyui.com/) | Component classes (`card`, `btn`, `badge`, `alert`, `toast`, …) |
| ESLint 10 | Linting, with the React Hooks and React Refresh plugins |

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS) and npm
- The [backend](../Devtinder/README.md) set up with its `.env` file

### Run both apps

Use two terminals:

```bash
# Terminal 1 — backend on http://localhost:3000
cd project/Devtinder
npm install
npm run dev

# Terminal 2 — frontend on http://localhost:5173
cd project/devTinder-web
npm install
npm run dev
```

Open http://localhost:5173.

## How the frontend connects to the backend

| Where | What | Must match |
| ----- | ---- | ---------- |
| `src/libs/utils/constants.js` | `BASE_URL = "http://localhost:3000"`, the backend address every request uses | The backend's `PORT` |
| Every axios call | `{ withCredentials: true }` so the browser sends and receives the `token` cookie | — |
| `Devtinder/src/app.js` | `cors({ origin: CLIENT_URL, credentials: true })` | The address the frontend runs on |
| `Devtinder/.env` | `CLIENT_URL=http://localhost:5173` | Same as above (`localhost` ≠ `127.0.0.1`) |

To deploy, change `BASE_URL` to the deployed backend and `CLIENT_URL` to the deployed frontend.

### Which page calls which endpoint

| Component (`src/components/`) | Request | Backend file (`Devtinder/src/`) |
| --- | --- | --- |
| `Login.jsx` | `POST /login`, `POST /signup` | `routes/auth.js` |
| `Navbar.jsx` | `POST /logout` | `routes/auth.js` |
| `ForgotPassword.jsx` | `POST /forgot-password` | `routes/auth.js` |
| `ResetPassword.jsx` | `POST /reset-password/:token` | `routes/auth.js` |
| `Body.jsx` | `GET /profile/view` (who is logged in?) | `routes/profile.js` |
| `EditProfile.jsx` | `PATCH /profile/edit` | `routes/profile.js` |
| `Feed.jsx` | `GET /feed` | `routes/user.js` |
| `UserCard.jsx` | `POST /request/send/:status/:userId` | `routes/request.js` |
| `Requests.jsx` | `GET /user/request/received`, `POST /request/review/:status/:requestId` | `routes/user.js`, `routes/request.js` |
| `Connections.jsx` | `GET /user/connections` | `routes/user.js` |

## Available scripts

| Command           | Description                                     |
| ----------------- | ----------------------------------------------- |
| `npm run dev`     | Start the Vite dev server with hot reload       |
| `npm run build`   | Build for production into `dist/` (git-ignored) |
| `npm run preview` | Serve the production build locally              |
| `npm run lint`    | Run ESLint                                      |

## Project structure

```
devTinder-web/
├── src/
│   ├── main.jsx                # Entry point: renders <App /> in StrictMode
│   ├── App.jsx                 # Redux <Provider>, BrowserRouter and routes
│   ├── index.css               # Tailwind import + daisyUI plugin
│   ├── components/
│   │   ├── Body.jsx            # Layout (Navbar, page, Footer) + login check and route protection
│   │   ├── Navbar.jsx          # Logo, page links, avatar menu, logout
│   │   ├── Footer.jsx          # Footer at the bottom of the page
│   │   ├── Login.jsx           # Login / signup form (toggle), link to forgot password
│   │   ├── ForgotPassword.jsx  # Enter email → reset link is emailed
│   │   ├── ResetPassword.jsx   # Opened from the email link → choose a new password
│   │   ├── Feed.jsx            # Loads GET /feed, shows one swipeable UserCard
│   │   ├── UserCard.jsx        # Developer card: swipe, keyboard, buttons; also the profile preview
│   │   ├── Profile.jsx         # Waits for the user, then renders EditProfile
│   │   ├── EditProfile.jsx     # Edit form + live preview, PATCH /profile/edit
│   │   ├── Connections.jsx     # Grid of your connections
│   │   └── Requests.jsx        # Grid of received requests with Accept / Reject
│   └── libs/utils/
│       ├── appStore.js         # Redux store: user, feed, connections, request
│       ├── userSlice.js        # addUser / removeUser
│       ├── feedSlice.js        # addFeed / removeUserFromFeed / clearFeed
│       ├── connectionsSlice.js # addConnections / removeConnections
│       ├── requestSlice.js     # addRequest / removeRequest
│       └── constants.js        # BASE_URL, FALLBACK_PHOTO, getErrorMessage, handleImageError
├── index.html
├── vite.config.js
├── eslint.config.js
└── package.json
```

## Routes

All pages render inside the `Body` layout, so the Navbar and Footer appear on every page.

| Path | Component | Access | What it does |
| ---- | --------- | ------ | ------------ |
| `/` | `Feed` | 🔒 Login | Swipe through developers |
| `/login` | `Login` | Logged out only | Log in or sign up |
| `/forgot-password` | `ForgotPassword` | Public | Request a password reset email |
| `/reset-password/:token` | `ResetPassword` | Public | Set a new password from the emailed link |
| `/profile` | `Profile` | 🔒 Login | Edit your profile with a live preview |
| `/connections` | `Connections` | 🔒 Login | See everyone you're connected with |
| `/requests` | `Requests` | 🔒 Login | Accept or reject requests sent to you |

## Pages

### Login / Sign up (`/login`)

- One form that switches between **Login** and **Sign up** with the link at the bottom.
- Sign up asks for first name (2+ characters), last name, email and a strong password (8+ characters with uppercase, lowercase, a number and a symbol). After signing up you land on `/profile` to fill in your details.
- A wrong email or password shows **"Invalid email or password"** (the same message for both, on purpose).
- **Forgot password?** next to the Password label opens `/forgot-password`.

### Forgot / reset password

1. `/forgot-password`: enter your email → `POST /forgot-password`. The reply is always "If an account exists for this email, a reset link has been sent", so nobody can find out which emails are registered.
2. The email contains `http://localhost:5173/reset-password/<token>`. Until SMTP is set up in the backend `.env`, the email is **printed in the backend terminal** instead.
3. `/reset-password/:token`: type the new password twice → `POST /reset-password/:token`. The link expires after 15 minutes and works only once.

### Feed (`/`)

1. On first visit `Feed` calls `GET /feed` and saves the list in the `feed` slice.
2. The first developer is shown with `UserCard`. Each card gets `key={user._id}`, so the next card starts in the middle.
3. Deciding on a card:

   | Action | Interested | Ignore |
   | ------ | ---------- | ------ |
   | Swipe (mouse drag or touch) | Right, more than 100px | Left, more than 100px |
   | Keyboard | → | ← |
   | Button | ♥ Interested | ✕ Ignore |

   A shorter drag snaps the card back and sends nothing. Otherwise the card flies off while `POST /request/send/<interested|ignored>/:userId` runs, and the developer is removed from the feed. If the request fails, the card comes back and the error shows on it.
4. When the feed is empty, "You're all caught up" is shown with a **Refresh feed** button.

### Profile (`/profile`)

- Shows a spinner until the user has loaded, then the form and a live preview card (the preview has no swipe or buttons).
- **Gender** is a dropdown (`male` / `female` / `other`, or "Prefer not to say"). Age must be 18–100.
- **Save Profile** calls `PATCH /profile/edit`, updates the user in Redux (so the Navbar changes too) and shows a toast.

### Connections (`/connections`) and Requests (`/requests`)

- Both load fresh data on every visit and show a spinner, an empty-state message, or an error with **Try again**.
- A request item looks like `{ _id: "<request id>", fromUserId: { firstName, lastName, photoUrl, age, gender, about, skills }, status: "interested" }`. Accept / Reject send `request._id`, not the sender's id.
- Accepting a request clears the cached connections, so the new connection shows up next time.
- Missing or broken photos fall back to a default picture.

## Authentication and protected routes

`src/components/Body.jsx` wraps every page:

1. On app load it calls `GET /profile/view` with the cookie. Success → the user is saved in Redux, so a refresh keeps you logged in.
2. While that runs, a spinner is shown instead of the page.
3. Then:

| You are… | You open… | Result |
| -------- | --------- | ------ |
| Not logged in | a protected page | Redirect to `/login` |
| Not logged in | `/login`, `/forgot-password`, `/reset-password/…` | Page shows |
| Logged in | `/login` | Redirect to `/` |
| Logged in | any other page (including reset password) | Page shows |

Public pages are listed in `PUBLIC_ROUTES` at the top of `Body.jsx` (matched by path prefix).

**Logout** calls `POST /logout` and dispatches `removeUser()`. The `feed`, `connections` and `request` slices also reset on `removeUser`, so the next person to log in never sees the previous user's data.

## State management

| Slice | Actions | Notes |
| ----- | ------- | ----- |
| `user` | `addUser`, `removeUser` | Set by login, signup, `GET /profile/view` and profile saves |
| `feed` | `addFeed`, `removeUserFromFeed`, `clearFeed` | Reset on logout |
| `connections` | `addConnections`, `removeConnections` | Reset on logout and after accepting a request |
| `request` | `addRequest`, `removeRequest` | Reset on logout |

Shared helpers in `constants.js`:

- `getErrorMessage(err)` turns any axios error into readable text, including "Cannot reach the server" when the backend is down.
- `handleImageError` swaps a broken image for `FALLBACK_PHOTO`.

## Troubleshooting

| Problem | Cause / fix |
| ------- | ----------- |
| "Cannot reach the server. Is the backend running on port 3000?" | Start the backend (`npm run dev` in `../Devtinder`), or fix `BASE_URL` |
| CORS error in the browser console | `CLIENT_URL` in `Devtinder/.env` must exactly match the frontend address |
| Logged out on every refresh / always sent to `/login` | A request is missing `withCredentials: true`, or the cookie expired (1 day) — log in again |
| "Invalid email or password" | Wrong email or password. Use **Forgot password?** if needed |
| "Password must be at least 8 characters…" | Signup and reset need uppercase, lowercase, a number and a symbol, e.g. `Elon@1234` |
| No reset email arrives | SMTP isn't set up in `Devtinder/.env` — copy the link from the backend terminal instead. With Gmail, use an App Password |
| "This reset link is invalid or has expired" | The link is older than 15 minutes or was already used — request a new one |
| "Connection request already exists" | You already acted on that developer; use **Refresh feed** |
| Save fails with "Invalid photo URL" | Use a full address starting with `https://` |
| Blank page, `X is not defined` | A missing `import` at the top of the file |
| "Objects are not valid as a React child" | You're rendering a whole object; render its fields instead |

## Roadmap

- [x] Vite + React, Tailwind CSS, daisyUI
- [x] React Router layout with Navbar and Footer
- [x] Redux store (user, feed, connections, requests)
- [x] Login, signup and logout
- [x] Stay logged in after refresh, protected routes
- [x] Edit profile with live preview
- [x] Feed with swipe (mouse, touch, keyboard) and buttons
- [x] Connections and Requests pages with Accept / Reject
- [x] Clear all user data on logout
- [x] Forgot / reset password by email
- [ ] Edit skills on the profile page
- [ ] Change password from the profile page (backend `PATCH /profile/forgot-password` exists)
- [ ] Load the next page of the feed when it runs out (`?page=`)
- [ ] Chat between connections
