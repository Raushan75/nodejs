# DevTinder

A "Tinder for developers" backend: users sign up, browse other developers, and send or review connection requests.

Built with **Node.js**, **Express 5**, **MongoDB (Mongoose)**, and **JWT** cookie authentication.

## Getting started

```bash
npm install
npm run dev     # starts with nodemon (auto-restarts on file changes)
# or
npm start       # plain node, does NOT reload on changes
```

The server runs on **http://localhost:3000** once the database connects.

> **Note:** `npm run dev` needs `nodemon` (`npm i -D nodemon` or install it globally).
> If you add a route and get `Cannot GET /<route>` (404), an old server process is probably
> still holding port 3000. Stop it and restart.

## Project structure

```
src/
├── app.js                  # Express app, router mounting, server start
├── config/database.js      # MongoDB connection
├── middleware/auth.js      # userAuth: verifies JWT from the `token` cookie
├── models/
│   ├── user.js             # User schema
│   └── connectionRequest.js# Connection request schema
├── routes/
│   ├── auth.js             # signup / login / logout
│   ├── profile.js          # view / edit profile, change password
│   ├── request.js          # send & review connection requests
│   └── user.js             # received requests, connections, feed
└── utils/validation.js     # signup & profile-edit validation
```

## Authentication

`POST /login` sets an httpOnly `token` cookie. Routes marked 🔒 below require that cookie.
Without it they return `401 unauthorized`.

## API

### Auth

| Method | Path      | Body                                          | Description          |
| ------ | --------- | --------------------------------------------- | -------------------- |
| POST   | `/signup` | `firstName`, `lastName`, `emailId`, `password` | Create an account (password must be strong) |
| POST   | `/login`  | `emailId`, `password`                          | Log in, sets `token` cookie |
| POST   | `/logout` | none                                           | Clear the `token` cookie |

### Profile 🔒

| Method | Path                | Body | Description |
| ------ | ------------------- | ---- | ----------- |
| GET    | `/profile/view`     | none | Get the logged-in user's profile |
| PATCH  | `/profile/edit`     | Any of `firstName`, `lastName`, `photoUrl`, `about`, `skills`, `gender`, `age` | Update profile (other fields are rejected) |
| PATCH  | `/profile/password` | `password` | Change password |

### Connection requests 🔒

| Method | Path | Description |
| ------ | ---- | ----------- |
| POST | `/request/send/:status/:touserId` | Send a request. `status` is `interested` or `ignored` |
| POST | `/request/review/:status/:requestId` | Review a received request. `status` is `accepted` or `rejected` |

### User 🔒

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/user/request/received` | Pending (`interested`) requests sent to you |
| GET | `/user/connections` | Your accepted connections |
| GET | `/feed` | Feed for the logged-in user (work in progress) |

### Other

| Method | Path    | Body     | Description |
| ------ | ------- | -------- | ----------- |
| DELETE | `/user` | `userId` | Delete a user by ID (defined in `app.js`) |

## Example (curl)

```bash
# log in and save the cookie
curl -c cookies.txt -H "Content-Type: application/json" \
  -d '{"emailId":"you@example.com","password":"YourStr0ng!Pass"}' \
  http://localhost:3000/login

# call a protected route with the cookie
curl -b cookies.txt http://localhost:3000/feed
```

## TODO

- Move the MongoDB connection string and JWT secret out of the source code into environment variables (`.env`).
- Make `/feed` return other users to browse instead of your own connection requests.
