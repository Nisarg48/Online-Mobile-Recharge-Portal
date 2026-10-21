// Light/dark theme handling. The chosen theme is stored in localStorage and
// reflected as `data-theme` on <html>, which index.css uses to switch the
// CSS-variable palette.
const THEME_KEY = "theme";

export function getTheme() {
    return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
}

export function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
}

export function toggleTheme() {
    const next = getTheme() === "dark" ? "light" : "dark";
    applyTheme(next);
    return next;
}
