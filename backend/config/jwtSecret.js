/**
 * Single source for JWT signing/verify. Docker Compose must set JWT_SECRET in production.
 */
const DEV_FALLBACK =
  'appointment-scheduler-dev-jwt-secret-min-32-chars-required';

function getJwtSecret() {
  const s = process.env.JWT_SECRET;
  if (s && String(s).trim().length > 0) {
    return String(s).trim();
  }
  if (process.env.NODE_ENV === 'production') {
    console.warn(
      '[jwt] JWT_SECRET is not set — using insecure dev fallback. Set JWT_SECRET in production.'
    );
  }
  return DEV_FALLBACK;
}

module.exports = { getJwtSecret };
