export const OPENAI_MODEL = 'gpt-4.1-mini';

const _fhirBaseRaw = import.meta.env.VITE_FHIR_BASE || 'https://fhirassist.rsystems.com:481';
const _useHttps = import.meta.env.VITE_FHIR_USE_HTTPS !== 'false';
/** FHIR base URL - protocol controlled by VITE_FHIR_USE_HTTPS (true=https, false=http) */
export const FHIR_BASE = (() => {
  try {
    const u = new URL(_fhirBaseRaw.startsWith('http') ? _fhirBaseRaw : `https://${_fhirBaseRaw}`);
    u.protocol = _useHttps ? 'https:' : 'http:';
    return u.origin;
  } catch {
    return _useHttps ? `https://${_fhirBaseRaw}` : `http://${_fhirBaseRaw}`;
  }
})();

export const LOGIN_URL = `${FHIR_BASE}/auth/login`;

/** Backend chat API base (same as FHIR when using EHRAssist) */
export const CHAT_API_BASE = import.meta.env.VITE_CHAT_API_BASE || FHIR_BASE;

export const STORAGE_KEYS = {
  TOKEN: 'cb_token',
  USER: 'cb_user',
  OPENAI_KEY: 'cb_oai_key',
};
