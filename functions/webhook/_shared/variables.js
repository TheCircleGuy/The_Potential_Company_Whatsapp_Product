// Variable interpolation utilities

/**
 * Interpolate variables in a template string
 * Supports: {{variableName}}, {{user.name}}, {{api_response.data.value}}
 */
export function interpolate(template, variables) {
  if (!template || typeof template !== 'string') return template;

  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const value = getNestedValue(variables, path.trim());
    return value !== undefined ? String(value) : match;
  });
}

/**
 * Get nested value from object using dot notation
 */
export function getNestedValue(obj, path) {
  if (!obj || !path) return undefined;

  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }

  return current;
}

/**
 * Set nested value in object using dot notation
 */
export function setNestedValue(obj, path, value) {
  if (!path) return obj;

  const parts = path.split('.');
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current)) {
      current[part] = {};
    }
    current = current[part];
  }

  current[parts[parts.length - 1]] = value;
  return obj;
}

/**
 * Evaluate a condition
 */
export function evaluateCondition(variable, operator, compareValue, variables) {
  const actualValue = getNestedValue(variables, variable);

  switch (operator) {
    case 'equals':
      return String(actualValue).toLowerCase() === String(compareValue).toLowerCase();
    case 'not_equals':
      return String(actualValue).toLowerCase() !== String(compareValue).toLowerCase();
    case 'contains':
      return String(actualValue).toLowerCase().includes(String(compareValue).toLowerCase());
    case 'not_contains':
      return !String(actualValue).toLowerCase().includes(String(compareValue).toLowerCase());
    case 'starts_with':
      return String(actualValue).toLowerCase().startsWith(String(compareValue).toLowerCase());
    case 'ends_with':
      return String(actualValue).toLowerCase().endsWith(String(compareValue).toLowerCase());
    case 'greater_than':
      return Number(actualValue) > Number(compareValue);
    case 'less_than':
      return Number(actualValue) < Number(compareValue);
    case 'is_empty':
      return !actualValue || String(actualValue).trim() === '';
    case 'is_not_empty':
      return actualValue && String(actualValue).trim() !== '';
    case 'matches_regex':
      try {
        return new RegExp(compareValue, 'i').test(String(actualValue));
      } catch {
        return false;
      }
    default:
      return false;
  }
}
