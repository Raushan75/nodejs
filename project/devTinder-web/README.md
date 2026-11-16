# 👨‍💻 DevTinder — Web

The frontend for **DevTinder**, a "Tinder for developers": users log in, browse other developers one card at a time, mark them as **Interested** or **Ignore**, and edit their own profile.

Built with **React 19**, **Vite**, **React Router**, **Redux Toolkit**, **Axios**, **Tailwind CSS v4** and **daisyUI v5**.

> 🚧 **Work in progress.** Login, logout, the developer feed and profile editing are connected to the backend. Signup, connections and connection-request pages are still to come.

## Features

- **Login and logout** with a cookie-based session (JWT in a `token` cookie)
- **Stays logged in** after a page refresh, and every page except `/login` is protected
- **Developer feed:** one card at a time with photo, name, age, gender, About and skills. **Interested** and **Ignore** send a connection request and move on to the next developer. Shows a loading spinner, an "all caught up" message when the feed is empty, and server errors under the card
- **Edit profile:** a form next to a live preview card of the same size that updates as you type, a gender dropdown, an About box with a 250-character counter, a saving spinner, error alerts and a success toast
- **Navbar** with the user's name and photo, and a dropdown for Profile and Logout

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
| [Redux Toolkit](https://redux-toolkit.js.org/) + `react-redux` | Global state: the logged-in user and the feed |
| [Axios](https://axios-http.com/) | HTTP requests to the backend, sent with cookies (`withCredentials: true`) |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first styling, via the `@tailwindcss/vite` plugin |
| [daisyUI v5](https://daisyui.com/) | Tailwind component classes (`card`, `btn`, `badge`, `alert`, `toast`, …) |
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
│   │   ├── Body.jsx          # Shared layout + auth check and route protection
│   │   ├── Navbar.jsx        # Logo, "Welcome, name", user photo and dropdown (Profile, Settings, Logout)
│   │   ├── Footer.jsx        # Fixed footer with the current year
│   │   ├── Login.jsx         # Login form: calls POST /login, saves the user, shows server errors
│   │   ├── Feed.jsx          # Feed page: loads GET /feed, shows one UserCard, Interested / Ignore
│   │   ├── UserCard.jsx      # Developer card used in the feed and as the profile preview
│   │   ├── Profile.jsx       # Profile page: waits for the user, then renders EditProfile
│   │   └── EditProfile.jsx   # Edit form + live preview card, calls PATCH /profile/edit
│   └── libs/utils/
│       ├── appStore.js       # Redux store (configureStore) with `user` and `feed`
│       ├── userSlice.js      # `user` slice: addUser / removeUser
│       ├── feedSlice.js      # `feed` slice: addFeed / removeUserFromFeed / removeFeed
│       └── constants.js      # BASE_URL of the backend
├── index.html                # HTML shell with the #root element
├── vite.config.js            # React + Tailwind Vite plugins
├── eslint.config.js          # ESLint flat config
└── package.json
```

## Routes

All pages render inside the `Body` layout through React Router's `<Outlet />`, so the Navbar and Footer appear on every page.

| Path       | Component | Access    | What it does                                             |
| ---------- | --------- | --------- | -------------------------------------------------------- |
| `/`        | `Feed`    | 🔒 Login  | Browse developers and send Interested / Ignore           |
| `/login`   | `Login`   | Public    | Log in and redirect to `/`                               |
| `/profile` | `Profile` | 🔒 Login  | Edit your profile with a live preview (Navbar dropdown)  |

## Pages

### Feed (`/`)

1. On first visit, `Feed` calls `GET /feed` and saves the list in the `feed` slice. Going to another page and back reuses it without a new request.
2. The first developer in the list is shown with `UserCard`, along with a count of how many are left.
3. **Interested** or **Ignore** calls `POST /request/send/interested/:userId` or `POST /request/send/ignored/:userId`. On success that developer is removed from the feed and the next one appears. Both buttons are disabled while the request runs.
4. When nobody is left, an "You're all caught up" message is shown.

The backend leaves out yourself and anyone you already have a request with, so people you've acted on don't come back after a refresh.

### Profile (`/profile`)

- `Profile` shows a spinner until the logged-in user has loaded (after a page refresh), then renders `EditProfile` with the saved data.
- The form and the preview card sit in two equal columns with the same height, and stack on small screens.
- **Gender** is a dropdown, because the backend only accepts `male`, `female` or `other`. If none is picked, it isn't sent.
- **Save Profile** calls `PATCH /profile/edit`, updates the user in Redux (so the Navbar name and photo change too) and shows a success toast. Backend errors appear in a red alert.

### UserCard

One card component is used in both places:

| Prop | Meaning |
| ---- | ------- |
| `user` | `{ firstName, lastName, photoUrl, age, gender, about, skills }` |
| `onIgnore`, `onInterested` | Button handlers. Without them the buttons are disabled (the profile preview) |
| `disabled` | Disable both buttons, e.g. while a request is running |
| `stretch` | Fill the parent's width and height (used on the Profile page) instead of the fixed feed size |
| `label` | Small badge on the photo, e.g. `"Preview"` |

A missing or broken photo falls back to a default profile picture.

## Authentication and protected routes

Route protection lives in `src/components/Body.jsx`, which wraps every page:

1. **On app load**, `Body` calls `GET /profile/view` with the `token` cookie. If it succeeds, the user is saved in Redux, so a page refresh keeps you logged in.
2. **While that request is running**, a loading spinner is shown instead of the page, so a logged-in user never sees a flash of the login page.
3. **Then it redirects** with `<Navigate replace />` (the Back button can't return to a blocked page):

| You are…      | You open…                | Result               |
| ------------- | ------------------------ | -------------------- |
| Not logged in | any protected page       | Redirect to `/login` |
| Not logged in | `/login`                 | Login form           |
| Logged in     | `/login`                 | Redirect to `/`      |
| Logged in     | any other page           | Page shows           |

Public pages are listed at the top of `Body.jsx`. To add one (for example signup):

```js
const PUBLIC_ROUTES = ["/login", "/signup"];
```

Logging in (`Login.jsx`) saves the user and navigates to `/`. Logging out (Navbar dropdown) calls `POST /logout`, clears the user and the feed, and navigates to `/login`.

## State management

The Redux store has two slices:

| Slice | Action | Used in | Effect |
| ----- | ------ | ------- | ------ |
| `user` | `addUser` | `Login.jsx`, `Body.jsx`, `EditProfile.jsx` | Saves the user from login, `GET /profile/view` or a profile save |
| `user` | `removeUser` | `Navbar.jsx` | Clears the user on logout |
| `feed` | `addFeed` | `Feed.jsx` | Saves the list from `GET /feed` |
| `feed` | `removeUserFromFeed` | `Feed.jsx` | Removes a developer after Interested / Ignore |
| `feed` | `removeFeed` | `Navbar.jsx` | Clears the feed on logout, so the next user gets a fresh one |

## Backend API

From the [backend](../Devtinder/README.md). 🔒 = needs the `token` cookie set by `/login`. ✅ = already used by the frontend.

| Method | Path | Description |
| ------ | ---- | ----------- |
| POST | `/signup` | Create an account |
| POST ✅ | `/login` | Log in, sets the `token` cookie, returns the user |
| POST ✅ | `/logout` | Clear the `token` cookie |
| GET 🔒 ✅ | `/profile/view` | Logged-in user's profile (used on app load) |
| PATCH 🔒 ✅ | `/profile/edit` | Update `firstName`, `lastName`, `photoUrl`, `age`, `gender`, `about`, `skills` |
| PATCH 🔒 | `/profile/password` | Change password |
| POST 🔒 ✅ | `/request/send/:status/:touserId` | Send a request (`interested` / `ignored`) |
| POST 🔒 | `/request/review/:status/:requestId` | Review a request (`accepted` / `rejected`) |
| GET 🔒 | `/user/request/received` | Pending requests sent to you |
| GET 🔒 | `/user/connections` | Accepted connections |
| GET 🔒 ✅ | `/feed` | Developers to browse (supports `?page=` and `?limit=`, max 50) |

## Troubleshooting

| Problem | Cause / fix |
| ------- | ----------- |
| Blank page, console shows `require is not defined` | Use ES `import`, not `require()`, in files under `src/` |
| Blank page, `X is not defined` (`useEffect`, `axios`, `useSelector`, …) | Add the missing `import` at the top of the file |
| "Something went wrong" with no server message | The request never reached the backend, often a missing import. Add `console.error(err)` in the `catch` to see the real error |
| "Invalid hook call" / rules-of-hooks error | Call hooks (`useDispatch`, `useSelector`, `useNavigate`, …) at the top of the component, never inside another function |
| Login returns **404** "Email is not valid" | No user with that email — sign up first |
| Login returns **400** "Password is not valid" | Wrong password; the message is shown under the form |
| Save fails with "Invalid gender" | Gender must be `male`, `female` or `other` (lowercase); use the dropdown |
| Save fails with "Invalid url" | Photo URL must be a full web address, e.g. `https://…` |
| About saves but doesn't stick | The backend `User` model must have an `about` field (Mongoose silently drops unknown fields). Restart the backend after model changes |
| Feed cards show no age, gender or About | The backend's `USER_SAFE_DATA` list in `routes/user.js` must include those fields |
| "connection request already sent" | You already acted on that developer; refresh to get an up-to-date feed |
| CORS error in the console | Backend `cors()` must use the frontend's exact origin and `credentials: true` |
| Always redirected to `/login` | The `token` cookie is missing or expired — log in again; check that the backend is running on port 3000 |
| Redirected to `/login` and login fails with a network error | The backend is not running — start it with `npm run dev` in `../Devtinder` |

## Roadmap

- [x] Set up Vite + React
- [x] Add Tailwind CSS and daisyUI
- [x] Add React Router with a shared layout (Navbar, Footer)
- [x] Add Redux Toolkit store with a `user` slice
- [x] Build the login form and connect it to `POST /login`
- [x] Show the user's name and photo in the Navbar
- [x] Wire up the Navbar dropdown (Profile link, Logout)
- [x] Keep the user logged in after refresh (`GET /profile/view` on load)
- [x] Protect routes: redirect logged-out users to `/login`
- [x] Use `BASE_URL` in the Navbar logout call
- [x] Show and edit the user's profile, with a live preview
- [x] Build the feed of developer cards with Interested / Ignore
- [ ] Add signup
- [ ] Edit skills on the profile page
- [ ] Connections and connection requests pages
- [ ] Load the next page of the feed when it runs out (`?page=`)
- [ ] Replace the placeholder footer text and page title
