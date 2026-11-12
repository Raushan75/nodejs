# 👨‍💻 DevTinder — Web

The frontend for **DevTinder**, a "Tinder for developers": users sign up, browse other developers, and send or review connection requests.

Built with **React 19**, **Vite**, **React Router**, **Tailwind CSS v4** and **daisyUI v5**.

> 🚧 **Work in progress.** The app layout (Navbar + Footer) and routing are in place. The Login and Profile pages are placeholders, and the frontend does not call the backend API yet.

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
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first styling, via the `@tailwindcss/vite` plugin |
| [daisyUI v5](https://daisyui.com/) | Tailwind component classes (`navbar`, `dropdown`, `footer`, `btn`, …) |
| ESLint 10 | Linting, with the React Hooks and React Refresh plugins |

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended) and npm

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
│   ├── main.jsx       # Entry point: renders <App /> in StrictMode
│   ├── App.jsx        # BrowserRouter and route definitions
│   ├── Body.jsx       # Shared layout: <Navbar />, <Outlet />, <Footer />
│   ├── Navbar.jsx     # Top bar with logo and avatar dropdown (Profile, Settings, Logout)
│   ├── Footer.jsx     # Fixed footer with the current year
│   ├── Login.jsx      # Login page (placeholder)
│   ├── Profile.jsx    # Profile page (placeholder)
│   └── index.css      # Tailwind import + daisyUI plugin
├── index.html         # HTML shell with the #root element
├── vite.config.js     # React + Tailwind Vite plugins
├── eslint.config.js   # ESLint flat config
└── package.json
```

## Routes

All pages render inside the `Body` layout through React Router's `<Outlet />`, so the Navbar and Footer appear on every page.

| Path       | Component | Status                          |
| ---------- | --------- | ------------------------------- |
| `/`        | `Body`    | Layout only (Navbar + Footer)   |
| `/login`   | `Login`   | Placeholder                     |
| `/profile` | `Profile` | Placeholder                     |

## Backend API (what the frontend will use)

From the [backend](../Devtinder/README.md). 🔒 = needs the `token` cookie set by `/login`.

| Method | Path | Description |
| ------ | ---- | ----------- |
| POST | `/signup` | Create an account |
| POST | `/login` | Log in, sets the `token` cookie |
| POST | `/logout` | Clear the `token` cookie |
| GET 🔒 | `/profile/view` | Logged-in user's profile |
| PATCH 🔒 | `/profile/edit` | Update profile fields |
| PATCH 🔒 | `/profile/password` | Change password |
| POST 🔒 | `/request/send/:status/:touserId` | Send a request (`interested` / `ignored`) |
| POST 🔒 | `/request/review/:status/:requestId` | Review a request (`accepted` / `rejected`) |
| GET 🔒 | `/user/request/received` | Pending requests sent to you |
| GET 🔒 | `/user/connections` | Accepted connections |
| GET 🔒 | `/feed` | Developers to browse |

> Because the API uses cookie auth on a different port, the frontend will need to send requests with credentials (e.g. `axios` with `withCredentials: true`), and the backend will need CORS enabled for `http://localhost:5173` with `credentials: true`.

## Roadmap

- [x] Set up Vite + React
- [x] Add Tailwind CSS and daisyUI
- [x] Add React Router with a shared layout (Navbar, Footer)
- [ ] Build the login form and connect it to `POST /login`
- [ ] Add signup
- [ ] Wire up the Navbar dropdown links (Profile, Settings, Logout)
- [ ] Show and edit the user's profile
- [ ] Build the feed of developer cards
- [ ] Connections and connection requests pages
- [ ] Replace the placeholder avatar, footer text and page title
