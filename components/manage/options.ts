/** Preset accent colors for kid profiles (distinct, AAA-friendly). */
export const COLOR_OPTIONS = [
  { name: "Indigo", value: "#4338ca" },
  { name: "Blue", value: "#1d4ed8" },
  { name: "Teal", value: "#0f766e" },
  { name: "Green", value: "#15803d" },
  { name: "Amber", value: "#92400e" },
  { name: "Red", value: "#b91c1c" },
  { name: "Purple", value: "#6b21a8" },
  { name: "Pink", value: "#be185d" },
] as const;

export const DEFAULT_COLOR = COLOR_OPTIONS[0].value;

export function colorName(value: string, locale: "en" | "he"): string {
  const names: Record<string, string> = {
    "#4338ca": "אינדיגו",
    "#1d4ed8": "כחול",
    "#0f766e": "טורקיז",
    "#15803d": "ירוק",
    "#92400e": "ענבר",
    "#b91c1c": "אדום",
    "#6b21a8": "סגול",
    "#be185d": "ורוד",
  };
  return locale === "he"
    ? (names[value] ?? value)
    : (COLOR_OPTIONS.find((c) => c.value === value)?.name ?? value);
}
