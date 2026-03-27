/**
 * Reads UTM parameters from the current URL and stores them in sessionStorage.
 * Call this once on app load. All API calls can then append these params.
 */
export function captureUTM() {
  const params = new URLSearchParams(window.location.search);
  const utm = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((key) => {
    const val = params.get(key);
    if (val) utm[key] = val;
  });
  if (Object.keys(utm).length > 0) {
    sessionStorage.setItem('unilo_utm', JSON.stringify(utm));
  }
}

export function getStoredUTM() {
  try {
    return JSON.parse(sessionStorage.getItem('unilo_utm') || '{}');
  } catch {
    return {};
  }
}

/**
 * Append UTM params to any URL string (e.g. WhatsApp share links)
 */
export function buildShareLink(baseUrl, source = 'whatsapp') {
  const url = new URL(baseUrl, window.location.origin);
  url.searchParams.set('utm_source', source);
  url.searchParams.set('utm_medium', 'share');
  url.searchParams.set('utm_campaign', 'listing_share');
  return url.toString();
}
