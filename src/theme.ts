type Theme = "highlighter" | "dracula";
type Appearance = "system" | "light" | "dark";
type ColorMode = "light" | "dark";

type Preferences = Readonly<{
  theme: Theme;
  appearance: Appearance;
}>;

const THEME_KEY = "yellowquest.web.theme";
const APPEARANCE_KEY = "yellowquest.web.appearance";
let listenerLifetime: AbortController | undefined;
let currentPreferences: Preferences | undefined;

function parseTheme(value: string | null): Theme {
  return value === "dracula" ? "dracula" : "highlighter";
}

function parseAppearance(value: string | null): Appearance {
  return value === "light" || value === "dark" ? value : "system";
}

function readPreference(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function savePreference(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // The selection still works for this visit when storage is unavailable.
  }
}

function selectControls(
  selector: string,
  accessibleName: string,
): HTMLSelectElement[] {
  const controls: HTMLSelectElement[] = [];
  for (const element of document.querySelectorAll(selector)) {
    if (!(element instanceof HTMLSelectElement)) continue;
    const hasLabel = element.labels !== null && element.labels.length > 0;
    if (
      !hasLabel &&
      !element.hasAttribute("aria-label") &&
      !element.hasAttribute("aria-labelledby")
    ) {
      element.setAttribute("aria-label", accessibleName);
    }
    controls.push(element);
  }
  return controls;
}

/** Call after rendering the controls; repeating initialization retires old listeners. */
export function initializeTheme(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  listenerLifetime?.abort();
  const lifetime = new AbortController();
  listenerLifetime = lifetime;
  const systemAppearance = window.matchMedia("(prefers-color-scheme: dark)");
  const themeControls = selectControls("[data-theme-select]", "Color theme");
  const appearanceControls = selectControls("[data-mode-select]", "Appearance");
  let preferences: Preferences = currentPreferences ?? {
    theme: parseTheme(readPreference(THEME_KEY)),
    appearance: parseAppearance(readPreference(APPEARANCE_KEY)),
  };

  function applyPreferences(): void {
    const mode: ColorMode =
      preferences.appearance === "system"
        ? systemAppearance.matches
          ? "dark"
          : "light"
        : preferences.appearance;
    document.documentElement.setAttribute("data-theme", preferences.theme);
    document.documentElement.setAttribute("data-mode", mode);
    document.documentElement.style.colorScheme = mode;
    for (const control of themeControls) control.value = preferences.theme;
    for (const control of appearanceControls)
      control.value = preferences.appearance;
    currentPreferences = preferences;
  }

  function themeChanged(event: Event): void {
    if (!(event.currentTarget instanceof HTMLSelectElement)) return;
    preferences = {
      ...preferences,
      theme: parseTheme(event.currentTarget.value),
    };
    savePreference(THEME_KEY, preferences.theme);
    applyPreferences();
  }

  function appearanceChanged(event: Event): void {
    if (!(event.currentTarget instanceof HTMLSelectElement)) return;
    preferences = {
      ...preferences,
      appearance: parseAppearance(event.currentTarget.value),
    };
    savePreference(APPEARANCE_KEY, preferences.appearance);
    applyPreferences();
  }

  function storageChanged(event: StorageEvent): void {
    try {
      if (
        event.storageArea !== null &&
        event.storageArea !== window.localStorage
      )
        return;
    } catch {
      return;
    }
    // A null key means another tab cleared storage, so return to the defaults.
    if (event.key === null) {
      preferences = { theme: "highlighter", appearance: "system" };
      applyPreferences();
      return;
    }
    if (event.key === THEME_KEY) {
      preferences = { ...preferences, theme: parseTheme(event.newValue) };
      applyPreferences();
      return;
    }
    if (event.key !== APPEARANCE_KEY) return;
    preferences = {
      ...preferences,
      appearance: parseAppearance(event.newValue),
    };
    applyPreferences();
  }

  const options: AddEventListenerOptions = { signal: lifetime.signal };
  for (const control of themeControls)
    control.addEventListener("change", themeChanged, options);
  for (const control of appearanceControls)
    control.addEventListener("change", appearanceChanged, options);
  systemAppearance.addEventListener("change", applyPreferences, options);
  window.addEventListener("storage", storageChanged, options);
  // A page restored from the back/forward cache may have missed another tab's change.
  window.addEventListener(
    "pageshow",
    (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      preferences = {
        theme: parseTheme(readPreference(THEME_KEY)),
        appearance: parseAppearance(readPreference(APPEARANCE_KEY)),
      };
      applyPreferences();
    },
    options,
  );
  applyPreferences();
  document.documentElement.setAttribute("data-enhanced", "true");
}
