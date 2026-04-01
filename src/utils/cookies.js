import config from "../config/env.js";

const buildCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: config.isProduction,
  sameSite: "strict",
  maxAge,
});

const ACCESS_COOKIE_NAME = "accessToken";
const REFRESH_COOKIE_NAME = "refreshToken";

const attachAuthCookies = (res, { accessToken, refreshToken }) => {
  if (accessToken) {
    res.cookie(
      ACCESS_COOKIE_NAME,
      accessToken,
      buildCookieOptions(config.jwt.accessCookieMaxAgeMs),
    );
  }

  if (refreshToken) {
    res.cookie(
      REFRESH_COOKIE_NAME,
      refreshToken,
      buildCookieOptions(config.jwt.refreshCookieMaxAgeMs),
    );
  }
};

const clearAuthCookies = (res) => {
  const expired = { ...buildCookieOptions(0), maxAge: 0 };
  res.clearCookie(ACCESS_COOKIE_NAME, expired);
  res.clearCookie(REFRESH_COOKIE_NAME, expired);
};

const extractRefreshToken = (req) =>
  req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;

export {
  attachAuthCookies,
  clearAuthCookies,
  extractRefreshToken,
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
};
