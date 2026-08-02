const DIACRITICS_REGEX = new RegExp("[\\u0300-\\u036f]", "g");

export function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(DIACRITICS_REGEX, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}
