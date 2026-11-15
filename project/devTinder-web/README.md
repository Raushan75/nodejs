# 👨‍💻 DevTinder — Web

The frontend for **DevTinder**, a "Tinder for developers": users sign up, browse other developers, and send or review connection requests.

Built with **React 19**, **Vite**, **React Router**, **Redux Toolkit**, **Axios**, **Tailwind CSS v4** and **daisyUI v5**.

> 🚧 **Work in progress.** Login is connected to the backend: a successful login stores the user in Redux, shows their photo and name in the Navbar, and redirects to the feed. Logout works from the avatar dropdown. The Feed and Profile pages are still placeholders.

## Repository layout

This app lives in the [`Raushan75/nodejs`](https://github.com/Raushan75/nodejs) repository, next to its backend:

```
project/
├── Devtinder/        # Backend API — Node.js, Express 5, MongoDB, JWT cookies
└── devTinder-web/    # Frontend — this app
```

See [`../Devtinder/README.md`](../Devtinder/README.md) for the backend setup and full API reference.

## Tech stack

| Tool | Purpose |
| ---- | ------- |
| [React 19](https://react.dev/) | UI library |
| [Vite](https://vite.dev/) | Dev server and build tool (`@vitejs/plugin-react`) |
| [React Router 7](https://reactrouter.com/) (`react-router-dom`) | Client-side routing |
| [Redux Toolkit](https://redux-toolkit.js.org/) + `react-redux` | Global state (the logged-in user) |
| [Axios](https://axios-http.com/) | HTTP requests to the backend, sent with cookies (`withCredentials: true`) |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first styling, via the `@tailwindcss/vite` plugin |
| [daisyUI v5](https://daisyui.com/) | Tailwind component classes (`navbar`, `dropdown`, `card`, `btn`, …) |
| ESLint 10 | Linting, with the React Hooks and React Refresh plugins |

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended) and npm
- The [backend](../Devtinder/README.md) running with a MongoDB connection

### Install and run

```bash
git clone https://github.com/Raushan75/nodejs.git
cd nodejs/project/devTinder-web
npm install
npm run dev
```

Open the URL shown in the terminal (usually http://localhost:5173).

### Running with the backend

The backend runs separately on **http://localhost:3000**:

```bash
cd ../Devtinder
npm install
npm run dev
```

The backend allows requests from `http://localhost:5173` with credentials (CORS), which the cookie-based login needs. If the frontend runs on a different port, update the `origin` in `Devtinder/src/app.js`.

The backend URL is set in `src/libs/utils/constants.js`:

```js
export const BASE_URL = "http://localhost:3000";
```

## Available scripts

| Command           | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `npm run dev`     | Start the Vite dev server with hot reload            |
| `npm run build`   | Build for production into `dist/` (git-ignored)      |
| `npm run preview` | Serve the production build locally                   |
| `npm run lint`    | Run ESLint on the project (`dist/` is ignored)       |

## Project structure

```
devTinder-web/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── main.jsx              # Entry point: renders <App /> in StrictMode
│   ├── App.jsx               # Redux <Provider>, BrowserRouter and routes
│   ├── index.css             # Tailwind import + daisyUI plugin
│   ├── components/
│   │   ├── Body.jsx          # Shared layout: <Navbar />, <Outlet />, <Footer />
│   │   ├── Navbar.jsx        # Logo, "Welcome, name", user photo and dropdown (Profile, Settings, Logout)
│   │   ├── Footer.jsx        # Fixed footer with the current year
│   │   ├── Login.jsx         # Login form: calls POST /login, saves the user, shows server errors
│   │   ├── Feed.jsx          # Feed page (placeholder)
│   │   └── Profile.jsx       # Profile page (placeholder)
│   └── libs/utils/
│       ├── appStore.js       # Redux store (configureStore)
│       ├── userSlice.js      # `user` slice: addUser / removeUser
│       └── constants.js      # BASE_URL of the backend
├── index.html                # HTML shell with the #root element
├── vite.config.js            # React + Tailwind Vite plugins
├── eslint.config.js          # ESLint flat config
└── package.json
```

## Routes

All pages render inside the `Body` layout through React Router's `<Outlet />`, so the Navbar and Footer appear on every page.

| Path       | Component | Status                                              |
| ---------- | --------- | --------------------------------------------------- |
| `/`        | `Feed`    | Placeholder                                         |
| `/login`   | `Login`   | Working: logs in and redirects to `/`               |
| `/profile` | `Profile` | Placeholder (linked from the Navbar dropdown)       |

## State management

The Redux store has one slice, `user`:

| Action         | Used in      | Effect                                      |
| -------------- | ------------ | ------------------------------------------- |
| `addUser`      | `Login.jsx`  | Saves the user returned by `POST /login`    |
| `removeUser`   | `Navbar.jsx` | Clears the user on logout                   |

The Navbar reads `store.user`: when it is set, it shows `Welcome, {firstName}` and the user's `photoUrl` with the dropdown menu.

> ⚠️ The user is only kept in Redux memory, so a page refresh logs you out on the frontend (the `token` cookie is still set). Fetching `GET /profile/view` on app load would fix this — see the roadmap.

## Backend API

From the [backend](../Devtinder/README.md). 🔒 = needs the `token` cookie set by `/login`. ✅ = already used by the frontend.

| Method | Path | Description |
| ------ | ---- | ----------- |
| POST | `/signup` | Create an account |
| POST ✅ | `/login` | Log in, sets the `token` cookie, returns the user |
| POST ✅ | `/logout` | Clear the `token` cookie |
| GET 🔒 | `/profile/view` | Logged-in user's profile |
| PATCH 🔒 | `/profile/edit` | Update profile fields |
| PATCH 🔒 | `/profile/password` | Change password |
| POST 🔒 | `/request/send/:status/:touserId` | Send a request (`interested` / `ignored`) |
| POST 🔒 | `/request/review/:status/:requestId` | Review a request (`accepted` / `rejected`) |
| GET 🔒 | `/user/request/received` | Pending requests sent to you |
| GET 🔒 | `/user/connections` | Accepted connections |
| GET 🔒 | `/feed` | Developers to browse |

## Troubleshooting

| Problem | Cause / fix |
| ------- | ----------- |
| Blank page, console shows `require is not defined` | Use ES `import`, not `require()`, in files under `src/` |
| Login returns **404** "Email is not valid" | No user with that email — sign up first |
| Login returns **400** "Password is not valid" | Wrong password; the message is shown under the form |
| CORS error in the console | Backend `cors()` must use the frontend's exact origin and `credentials: true` |
| Photo disappears after refresh | Expected for now — see the state management note above |

## Roadmap

- [x] Set up Vite + React
- [x] Add Tailwind CSS and daisyUI
- [x] Add React Router with a shared layout (Navbar, Footer)
- [x] Add Redux Toolkit store with a `user` slice
- [x] Build the login form and connect it to `POST /login`
- [x] Show the user's name and photo in the Navbar
- [x] Wire up the Navbar dropdown (Profile link, Logout)
- [ ] Keep the user logged in after refresh (`GET /profile/view` on load)
- [ ] Redirect logged-out users to `/login`
- [ ] Add signup
- [ ] Show and edit the user's profile
- [ ] Build the feed of developer cards
- [ ] Connections and connection requests pages
- [ ] Use `BASE_URL` in the Navbar logout call
- [ ] Replace the placeholder footer text and page title
