// Generate a proper UUID v4
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Create an anonymous user UUID for public applications
export function getAnonymousUserId(): string {
  // Generate a consistent anonymous UUID based on session or create new one
  let anonymousId = localStorage.getItem('anonymous_user_id');
  if (!anonymousId) {
    anonymousId = generateUUID();
    localStorage.setItem('anonymous_user_id', anonymousId);
  }
  return anonymousId;
}

// Generate a unique token for candidate applications
export function generateToken(): string {
  return generateUUID().replace(/-/g, '').substring(0, 16);
}