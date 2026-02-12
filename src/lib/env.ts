const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const FALSE_VALUES = new Set(["0", "false", "no", "off", ""]);

function stripMatchingQuotes(value: string) {
  if (value.length < 2) {
    return value;
  }

  const startsWithDouble = value.startsWith('"') && value.endsWith('"');
  const startsWithSingle = value.startsWith("'") && value.endsWith("'");

  if (startsWithDouble || startsWithSingle) {
    return value.slice(1, -1).trim();
  }

  return value;
}

export function getEnv(name: string) {
  const value = process.env[name];
  if (typeof value !== "string") {
    return "";
  }

  return stripMatchingQuotes(value.trim());
}

export function isEnvFlagEnabled(name: string, defaultValue = false) {
  const normalized = getEnv(name).toLowerCase();

  if (!normalized) {
    return defaultValue;
  }

  if (TRUE_VALUES.has(normalized)) {
    return true;
  }

  if (FALSE_VALUES.has(normalized)) {
    return false;
  }

  return defaultValue;
}

export function getEnvNumber(name: string, defaultValue: number) {
  const value = Number(getEnv(name));

  if (!Number.isFinite(value)) {
    return defaultValue;
  }

  return value;
}
