# nodejs

My notes and practice code from learning Node.js: modules, sync vs async code, the event loop, the libuv thread pool, a basic HTTP server and connecting to MongoDB Atlas.

## Setup

```bash
npm install
```

Requires Node.js (tested on v20). Run any file with:

```bash
node <file>.js
```

## What's in here

### Modules
| File | Topic |
| --- | --- |
| `app.js` | `require()`, destructuring exports, importing a JSON file (`data.json`) |
| `calculate/` | A folder module: `sum.js` and `multiple.js` re-exported through `index.js` |
| `xyz.js` | How Node wraps every module in a function (IIFE) to keep its scope private |

### Sync vs async
| File | Topic |
| --- | --- |
| `sync.js` | Plain synchronous code |
| `async.js` | Async APIs: `https.get`, `setTimeout`, `fs.readFile` |
| `setTimeout.js` | Why `setTimeout(fn, 0)` waits until the call stack is empty |
| `blocking.js` | `crypto.pbkdf2Sync` blocks the main thread; `crypto.pbkdf2` doesn't |

### Event loop
| File | Topic |
| --- | --- |
| `event-loop-1.js` | Order of `setImmediate`, `setTimeout` and `fs.readFile` callbacks |
| `event-loop-2.js` | Adds `process.nextTick` and Promises (microtasks run first) |
| `event-loop-3.js` | Callbacks scheduled from inside an I/O callback |
| `event-loop-4.js` | Nested `process.nextTick` calls |
| `threadpool.js` | libuv thread pool and `UV_THREADPOOL_SIZE` |

Event loop phases, in order: **timers → poll (I/O) → check (`setImmediate`) → close**. Between each phase, `process.nextTick` callbacks run, then Promise callbacks.

### HTTP server
`server.js` starts a server on port 9999:

```bash
node server.js
# open http://localhost:9999 or http://localhost:9999/getScreteData
```

### MongoDB
`database.js` connects to a MongoDB Atlas cluster and practices CRUD on the `Helloworld` database, `user` collection. It reads the connection string from a `.env` file in the repo root (`.env` is git-ignored):

```
BACKEND_URL=mongodb+srv://<user>:<password>@<cluster>/
```

What it practices:

- `insertOne` / `insertMany`: add documents
- `find(filter).toArray()`: read documents (`find()` returns a cursor, so call `.toArray()`)
- `countDocuments(filter)`: count matching documents (`cursor.count()` is deprecated)

Things I learned while setting it up:
- **`SSL alert number 80` / `ReplicaSetNoPrimary`** usually means your IP isn't allowed in Atlas → *Security → Network Access → Add Current IP Address*.
- **Database and collection names are case-sensitive.** A wrong name returns `[]` instead of an error, because MongoDB creates databases and collections on first write.
- **Close the connection with `client.close()`.**
- **Running an insert script again inserts duplicates.** Comment the insert out after it runs, or check with `findOne` first.

## Project: DevTinder

`project/Devtinder/` is a "Tinder for developers" backend built with **Express 5** and **Mongoose**.

```bash
cd project/Devtinder
npm install
npm run dev     # nodemon, restarts on file changes
npm start       # plain node
```

The server connects to MongoDB first and only starts listening on **port 3000** once the connection succeeds.

### Packages
| Package | Used for |
| --- | --- |
| `express` | Server and routing |
| `mongoose` | MongoDB models and schema validation |
| `validator` | Checking emails, strong passwords and URLs |
| `bcrypt` | Hashing passwords before saving them |
| `jsonwebtoken` | Creating and verifying the JWT login token |
| `cookie-parser` | Reading the `token` cookie from `req.cookies` |

### Structure
| Path | What it does |
| --- | --- |
| `src/app.js` | Express app: mounts the routers, defines the remaining `/user` and `/feed` routes, connects to the database, then starts the server |
| `src/routes/auth.js` | `authRouter`: `/signup`, `/login`, `/logout` |
| `src/routes/profile.js` | `profileRouter`: `/profile/view`, `/profile/edit`, `/profile/password` |
| `src/routes/request.js` | `requestsRouter`: `/sendConnectionRequest` |
| `src/config/database.js` | `connectionDB()`: connects Mongoose to the `devTinder` database on Atlas |
| `src/models/user.js` | `User` model with schema validation and the `getJWT()` / `validatePassword()` methods (see below) |
| `src/utils/validation.js` | `validateSingupData(req)` checks the signup body; `validateEditProfileData(req)` returns `false` if the edit body has a field that isn't allowed |
| `src/middleware/auth.js` | `userAuth` middleware: verifies the JWT from the `token` cookie, loads the user into `req.user` and calls `next()` |
| `src/homework.md` | Notes on routing: `app.use` vs `app.get`, route params, and Express 4 → Express 5 path syntax |

### User model
`timestamps: true` adds `createdAt` and `updatedAt` to every user.

| Field | Rules |
| --- | --- |
| `firstName` | Required, 5–50 characters, trimmed |
| `lastName` | Optional |
| `emailId` | Required, unique, lowercased, trimmed, must be a valid email |
| `password` | Required; stored as a bcrypt hash, never plain text |
| `age` | At least 18 |
| `gender` | `male`, `female` or `other` |
| `photoUrl` | Must be a valid URL; has a default profile picture |
| `abbout` | Has a default description |
| `skills` | Array of strings; defaults to `[]` until you set it through `/profile/edit` |

Schema methods (instance methods, so `this` is the user document; use a normal `function`, not an arrow function):

| Method | What it does |
| --- | --- |
| `user.getJWT()` | Signs a JWT with `{ _id: user._id }` that expires in 1 day |
| `user.validatePassword(password)` | Compares the plain password with the stored hash using `bcrypt.compare` |

### Authentication (JWT + cookies)
1. `POST /login` checks the password with `user.validatePassword()`, creates a token with `user.getJWT()` and sends it back as an `httpOnly` cookie named `token`.
2. The browser (or Postman) sends that cookie automatically on later requests.
3. `cookie-parser` puts it in `req.cookies.token`.
4. `userAuth` verifies it with `jwt.verify`, finds the user by the `_id` inside the token and sets `req.user`. With no token it replies `401`; with an invalid or expired token it replies `400`.
5. `POST /logout` overwrites the `token` cookie with `null` and an expiry of now, so the browser drops it.

Protect a route by adding the middleware before the handler:

```js
profileRouter.get("/profile/view", userAuth, (req, res) => res.send(req.user));
```

### Routers
Routes are grouped with `express.Router()` and mounted in `app.js`:

```js
const authRouter = express.Router();
authRouter.post("/login", handler);
module.exports = authRouter;

// app.js
app.use("/", authRouter);
```

Express checks the routers in the order they're mounted, and the first matching route handles the request.

### Routes
`express.json()` parses JSON request bodies, so every route reads its input from `req.body`. In Postman, send bodies as **raw → JSON**.

| Method | Path | Body | What it does |
| --- | --- | --- | --- |
| `POST` | `/signup` | `{ firstName, lastName, emailId, password }` | Validates the data, hashes the password with bcrypt and saves the user |
| `POST` | `/login` | `{ emailId, password }` | Checks the password and sets the `token` cookie; `404` if the email doesn't exist |
| `POST` | `/logout` | none | Clears the `token` cookie |
| `GET` | `/profile/view` | none (needs login) | Returns the logged-in user from `req.user` |
| `PATCH` | `/profile/edit` | Any of `firstName`, `lastName`, `photoUrl`, `about`, `skills`, `gender`, `age` (needs login) | Copies the fields onto the user and calls `save()`; any other field gives `400 data is not valid` |
| `PATCH` | `/profile/password` | `{ "password": "..." }` (needs login) | Hashes the new password with bcrypt and saves it |
| `POST` | `/sendConnectionRequest` | none (needs login) | Placeholder: replies `<firstName> request sent successfully` |
| `GET` | `/user` | `{ "emailId": "..." }` | Finds one user by email; `400` if `emailId` is missing, `404` if not found |
| `GET` | `/feed` | none | Returns every user |
| `DELETE` | `/user` | `{ "userId": "..." }` | Deletes a user by `_id`; `404` if not found |

Routes marked *needs login* use the `userAuth` middleware. Call `/login` first; Postman stores the cookie and sends it on the next requests.

Every route catches errors and replies `400` with the message, so the error shows in Postman.

Signup example:

```bash
curl -X POST http://localhost:3000/signup   -H "Content-Type: application/json"   -d '{"firstName":"Raushan","lastName":"Kumar","emailId":"raushan@example.com","password":"Strong@123"}'
```

Login and profile example (`-c` saves the cookie, `-b` sends it):

```bash
curl -c cookies.txt -X POST http://localhost:3000/login   -H "Content-Type: application/json"   -d '{"emailId":"raushan@example.com","password":"Strong@123"}'
curl -b cookies.txt http://localhost:3000/profile/view
```

Edit profile example (`skill` instead of `skills`, or `emailId`, gets `400 data is not valid`):

```bash
curl -b cookies.txt -X PATCH http://localhost:3000/profile/edit   -H "Content-Type: application/json"   -d '{"skills":["nextjs","react"],"age":25,"gender":"male"}'
```

Change password and log out:

```bash
curl -b cookies.txt -X PATCH http://localhost:3000/profile/password   -H "Content-Type: application/json"   -d '{"password":"NewStrong@123"}'
curl -b cookies.txt -c cookies.txt -X POST http://localhost:3000/logout
```

### Data validation and sanitization
Three layers check incoming data:

1. **API level, signup:** `validateSingupData` requires a first and last name, a valid email and a strong password (8+ characters with an uppercase letter, a lowercase letter, a number and a symbol). It throws an error, and the route's `catch` sends it back.
2. **API level, edit profile:** `validateEditProfileData` only allows `firstName`, `lastName`, `photoUrl`, `about`, `skills`, `gender` and `age`, so nobody can change their email or password through `/profile/edit`.
3. **Schema level:** Mongoose checks the rules in the model on `save()`, so `/profile/edit` rejects a bad `gender`, an `age` under 18 or an invalid `photoUrl`. `findByIdAndUpdate` only runs them when you pass `{ runValidators: true }`.

Known gaps:
- The edit allow-list says `about`, but the schema field is `abbout`, so `about` passes the check but isn't saved. Use one spelling in both places.
- `/profile/password` doesn't check password strength or ask for the old password. The schema validator runs on the bcrypt hash, which always looks "strong".
- `/login` sets the cookie with `expiresIn`, which `res.cookie` ignores (the option is `expires`), so the cookie lasts only until the browser closes.

Signup also builds the user from named fields instead of `new User(req.body)`, so extra fields in the body are never saved.

### Things I learned
- **`find()` returns an array, `findOne()` returns a document or `null`.** Check `users.length === 0` for the first, `!user` for the second.
- **`findByIdAndUpdate` / `findByIdAndDelete` return `null` for an id that doesn't exist**; they don't throw. Check the result and send `404` yourself.
- **`findOne({ emailId: undefined })` matches any user**, because Mongoose drops `undefined` fields and runs `findOne({})`. Check the input first.
- **Never store plain passwords.** `await bcrypt.hash(password, 10)` on signup, `await bcrypt.compare(password, user.password)` on login.
- **Put user-specific logic in schema methods.** `getJWT()` and `validatePassword()` live on the model, so routes stay short. They must be `function () {}`, because an arrow function has no `this`.
- **Store the JWT in an `httpOnly` cookie** so page JavaScript can't read it. Without `cookie-parser`, `req.cookies` is `undefined`.
- **Keep secrets out of code.** The JWT secret and database URL belong in a `.env` file, not in the source.
- **Match exports and imports:** `module.exports = { fn }` goes with `const { fn } = require(...)`; `module.exports = fn` goes with `const fn = require(...)`. Mixing them gives "fn is not a function".
- **Use the same name in `catch (err)` and inside it.** `catch (error)` followed by `err.message` crashes with `err is not defined` and hides the real error.
- **Always send a response in `catch`.** If you only `console.log`, Postman waits forever.
- **`Cannot POST /signup` means no route matched** the method and path. Check for typos (`/singup`), the HTTP method, and that the router is mounted with `app.use`.
- **`argument callback is required`** comes from calling the router itself, `authRouter("/logout", ...)`. Use a method: `authRouter.post("/logout", ...)`.
- **`data and salt arguments required`** means `bcrypt.hash` got `undefined`; the body key didn't match what the route reads.
- **Every route must send a response.** An empty handler like `(req, res) => {}` leaves Postman waiting.
- **A `GET` request with a body** works in Postman, but query params (`/user?emailId=...`) are the usual way to send filters.

### Express 5 route syntax (from `homework.md`)
| Express 4 | Express 5 |
| --- | --- |
| `/ab?c` | `/a{b}c` |
| `/user/:id?` | `/user{/:id}` |
| `*` | `/*splat` or `/{*splat}` |
| `/ab+c` | regex: `/ab+c/` |
