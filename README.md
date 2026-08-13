# PDF Portal — Backend

Node.js + Express + MongoDB (Mongoose) API matching the frontend you already
have. Auth uses an **httpOnly cookie** — the JWT is never exposed to
client-side JS.

## 1. Setup

```bash
npm install
cp .env.example .env   # fill in MONGO_URI and a real JWT_SECRET
npm run dev             # or: npm start
```

Requires a running MongoDB instance (local or Atlas) at the `MONGO_URI` you set.

## 2. How auth works

- `POST /api/auth/signup` and `POST /api/auth/login` hash/check the password,
  sign a JWT, and set it as an `httpOnly`, `sameSite=strict` cookie named
  `token`. The response body only contains the safe user object — never the
  token itself.
- `POST /api/auth/logout` clears that cookie.
- `GET /api/auth/me` returns the current user based on the cookie. Since the
  frontend can no longer read/decode the token itself, call this once on app
  load to restore the session (see note below).
- `middlewares/authMiddleware.js` (`protect`) reads the cookie, verifies the
  JWT, and loads the user onto `req.user` for every protected route.
- `middlewares/roleMiddleware.js` (`requireRole("admin")`) blocks routes to
  non-admins after `protect` has run.

## 3. Endpoints

| Method | Endpoint                 | Auth        | Body / Notes                                       |
|--------|---------------------------|-------------|------------------------------------------------------|
| POST   | `/api/auth/signup`        | —           | `{ name, email, mobile, password }`                  |
| POST   | `/api/auth/login`         | —           | `{ email, password }`                                |
| POST   | `/api/auth/logout`        | any         | clears the cookie                                     |
| GET    | `/api/auth/me`            | any         | returns the logged-in user                            |
| GET    | `/api/pdf`                | any         | list of uploaded PDFs                                 |
| GET    | `/api/pdf/:id/download`   | any         | streams the file for download                         |
| POST   | `/api/pdf/upload`         | admin only  | `multipart/form-data`, field name `pdf`               |
| DELETE | `/api/pdf/:id`            | admin only  | removes a PDF                                          |
| GET    | `/api/admin/users`        | admin only  | list of all users                                      |
| POST   | `/api/admin/users`        | admin only  | `{ name, email, mobile, password, role }`             |
| DELETE | `/api/admin/users/:id`    | admin only  | removes a user (can't remove yourself)                |

## 4. Required frontend change

Your existing frontend reads the token out of the cookie with `jwt-decode`.
That won't work anymore — an `httpOnly` cookie can't be read by JavaScript at
all (that's the point). Two small changes needed in `AuthContext.jsx`:

1. Configure axios with `withCredentials: true` so the cookie is sent
   automatically — you no longer need to attach an `Authorization` header.
2. On app load, instead of decoding a cookie, call `GET /api/auth/me` and use
   its response to set the logged-in user.

Ask me and I'll make that edit to the frontend project directly.

## 5. Uploaded files

PDFs are saved to `uploads/` on disk with a random filename (never the
client-supplied one, to avoid path traversal/overwrite issues) and capped at
15 MB. Only `application/pdf` is accepted. The original filename is kept in
MongoDB purely for display and for the `Content-Disposition` header on
download.

## 6. CORS

`CLIENT_URL` in `.env` must match your frontend's exact origin (e.g.
`http://localhost:5173`) — cookies won't be sent cross-origin otherwise. In
production, set `NODE_ENV=production` so the cookie is also marked `secure`
(HTTPS only).
