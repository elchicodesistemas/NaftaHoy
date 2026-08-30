const STORAGE_KEY = "naftahoy_visitor_id";

export function getVisitorId() {
  if (typeof window === "undefined") return "";
  const current = window.localStorage.getItem(STORAGE_KEY);
  if (current) return current;
  const id = window.crypto?.randomUUID?.() || "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    return (character === "x" ? random : (random & 0x3) | 0x8).toString(16);
  });
  window.localStorage.setItem(STORAGE_KEY, id);
  return id;
}
