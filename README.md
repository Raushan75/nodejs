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

### Structure
| Path | What it does |
| --- | --- |
| `src/app.js` | Express app: connects to the database, then starts the server and defines routes |
| `src/config/database.js` | `connectionDB()`: connects Mongoose to the `devTinder` database on Atlas |
| `src/models/user.js` | `User` model with schema validation (see below) |
| `src/utils/validation.js` | `validateSingupData(req)`: checks the signup body before anything touches the database |
| `src/middleware/auth.js` | `adminAuth` and `userAuth` middleware: check a (dummy) token, reply `401` or call `next()` |
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
| `skills` | Array of strings, at most 10 (checked in the `PATCH` route) |

### Routes
`express.json()` parses JSON request bodies, so every route reads its input from `req.body`. In Postman, send bodies as **raw → JSON**.

| Method | Path | Body | What it does |
| --- | --- | --- | --- |
| `POST` | `/singup` | `{ firstName, lastName, emailId, password }` | Validates the data, hashes the password with bcrypt and saves the user |
| `POST` | `/login` | `{ emailId, password }` | Finds the user by email and checks the password with `bcrypt.compare` |
| `GET` | `/user` | `{ "emailId": "..." }` | Finds one user by email; `400` if `emailId` is missing, `404` if not found |
| `GET` | `/feed` | none | Returns every user |
| `PATCH` | `/user/:userId` | Fields to update | Updates only allowed fields, with schema validators on; `404` if the user doesn't exist |
| `DELETE` | `/user` | `{ "userId": "..." }` | Deletes a user by `_id`; `404` if not found |

Every route catches errors, logs them with `console.error` and replies `400` with the message, so errors show in both the terminal and Postman.

Signup example:

```bash
curl -X POST http://localhost:3000/singup   -H "Content-Type: application/json"   -d '{"firstName":"Raushan","lastName":"Kumar","emailId":"raushan@example.com","password":"Strong@123"}'
```

Update example (`skill` instead of `skills` gets `400 invalid update` with the list of allowed fields):

```bash
curl -X PATCH http://localhost:3000/user/<userId>   -H "Content-Type: application/json"   -d '{"skills":["nextjs","react"],"age":25}'
```

### Data validation and sanitization
Three layers check incoming data:

1. **API level, signup:** `validateSingupData` requires a first and last name, a valid email and a strong password (8+ characters with an uppercase letter, a lowercase letter, a number and a symbol). It throws an error, and the route's `catch` sends it back.
2. **API level, update:** `PATCH` only allows `photoUrl`, `abbout`, `skills`, `gender` and `age`, so nobody can change their email or password through it.
3. **Schema level:** Mongoose checks the rules in the model on `save()`. Updates only run them when you pass `{ runValidators: true }`.

Signup also builds the user from named fields instead of `new User(req.body)`, so extra fields in the body are never saved.

### Things I learned
- **`find()` returns an array, `findOne()` returns a document or `null`.** Check `users.length === 0` for the first, `!user` for the second.
- **`findByIdAndUpdate` / `findByIdAndDelete` return `null` for an id that doesn't exist**; they don't throw. Check the result and send `404` yourself.
- **`findOne({ emailId: undefined })` matches any user**, because Mongoose drops `undefined` fields and runs `findOne({})`. Check the input first.
- **Never store plain passwords.** `await bcrypt.hash(password, 10)` on signup, `await bcrypt.compare(password, user.password)` on login.
- **Match exports and imports:** `module.exports = { fn }` goes with `const { fn } = require(...)`; `module.exports = fn` goes with `const fn = require(...)`. Mixing them gives "fn is not a function".
- **Use the same name in `catch (err)` and inside it.** `catch (error)` followed by `err.message` crashes with `err is not defined` and hides the real error.
- **Always send a response in `catch`.** If you only `console.log`, Postman waits forever.
- **A `GET` request with a body** works in Postman, but query params (`/user?emailId=...`) are the usual way to send filters.

### Express 5 route syntax (from `homework.md`)
| Express 4 | Express 5 |
| --- | --- |
| `/ab?c` | `/a{b}c` |
| `/user/:id?` | `/user{/:id}` |
| `*` | `/*splat` or `/{*splat}` |
| `/ab+c` | regex: `/ab+c/` |
