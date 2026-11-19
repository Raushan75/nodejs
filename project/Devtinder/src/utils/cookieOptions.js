// Options for the login cookie (shared by login, signup and change-password).
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000, // 1 day, same as the JWT
};

module.exports = { COOKIE_OPTIONS };
