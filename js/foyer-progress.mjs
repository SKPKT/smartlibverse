import {KEY, fresh, sanitize, totals, unlocked, earn} from './state.mjs';

export function readProgress(storage) {
  try { return sanitize(JSON.parse(storage.getItem(KEY))); }
  catch { return fresh(); }
}
// Update only the requested v1 fields, preserving all other existing data.
// Corrupt/unsupported saves and blocked storage are never replaced silently.
function editProgress(storage, edit) {
  try {
    const text = storage.getItem(KEY);
    const raw = text === null ? fresh() : JSON.parse(text);
    if (!raw || raw.version !== 1 || !raw.profile || !Array.isArray(raw.rewards)) return false;
    edit(raw);
    storage.setItem(KEY, JSON.stringify(raw));
    return true;
  } catch { return false; }
}
export function chooseAvatar(storage, avatar) {
  if (!['lelaki','perempuan'].includes(avatar)) return false;
  return editProgress(storage, raw => {raw.profile.avatar = avatar;});
}
export function completeTutorial(storage) {
  return editProgress(storage, raw => {
    const verified = sanitize(raw);
    if (earn(verified,'tutorial') && !raw.rewards.includes('tutorial')) raw.rewards.push('tutorial');
  });
}
export const progressTotals = state => totals(sanitize(state));
export const secretAvailable = state => unlocked(sanitize(state));
