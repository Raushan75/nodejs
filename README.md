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

### Structure
| Path | What it does |
| --- | --- |
| `src/app.js` | Express app: connects to the database, then starts the server and defines routes |
| `src/config/database.js` | `connectionDB()`: connects Mongoose to the `devTinder` database on Atlas |
| `src/models/user.js` | `User` model: `firstName`, `lastName`, `emailId`, `password`, `age`, `gender` |
| `src/middleware/auth.js` | `adminAuth` and `userAuth` middleware: check a (dummy) token, reply `401` or call `next()` |
| `src/homework.md` | Notes on routing: `app.use` vs `app.get`, route params, and Express 4 → Express 5 path syntax |

### Routes
`express.json()` parses JSON request bodies, so every route reads its input from `req.body`.

| Method | Path | Body | What it does |
| --- | --- | --- | --- |
| `POST` | `/singup` | User fields, e.g. `{ "firstName": "...", "emailId": "...", ... }` | Creates a user from the request body and saves it to the `users` collection |
| `GET` | `/user` | `{ "emailId": "..." }` | Finds one user by email (`findOne`); replies `404` if none is found |
| `GET` | `/feed` | none | Returns every user (`find({})`) |
| `PATCH` | `/user` | `{ "userId": "...", ...fieldsToUpdate }` | Updates a user by `_id` (`findByIdAndUpdate`) |
| `DELETE` | `/user` | `{ "userId": "..." }` | Deletes a user by `_id` (`findByIdAndDelete`) |

Example:

```bash
curl -X POST http://localhost:3000/singup \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Raushan","lastName":"Kumar","emailId":"raushan@example.com","password":"secret","age":24,"gender":"male"}'
```

Things I learned:
- **`find()` returns an array, `findOne()` returns a document or `null`.** Check `users.length === 0` for the first, `!user` for the second.
- **`findByIdAndDelete(id)` and `findByIdAndUpdate(id, data)`** take the id directly; passing `{ _id: id }` also works.
- **Fields not in the schema are ignored** when saving or updating, so the extra `userId` in the `PATCH` body isn't stored.
- **A `GET` request with a body** works in Postman, but query params (`/user?emailId=...`) are the usual way to send filters.

### Express 5 route syntax (from `homework.md`)
| Express 4 | Express 5 |
| --- | --- |
| `/ab?c` | `/a{b}c` |
| `/user/:id?` | `/user{/:id}` |
| `*` | `/*splat` or `/{*splat}` |
| `/ab+c` | regex: `/ab+c/` |
