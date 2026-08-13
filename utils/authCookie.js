const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function cookieOptions() {
  return {
    httpOnly: true, // JS on the page can never read this cookie
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "strict",
    maxAge: COOKIE_MAX_AGE_MS,
  };
}

function setAuthCookie(res, token) {
  res.cookie("token", token, cookieOptions());
}

function clearAuthCookie(res) {
  // clearCookie needs the same attributes used when the cookie was set
  const { maxAge, ...rest } = cookieOptions();
  res.clearCookie("token", rest);
}

module.exports = { setAuthCookie, clearAuthCookie };
