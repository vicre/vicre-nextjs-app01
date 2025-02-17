// lib/utils.ts

export function removeUnderscoreFields<T>(data: T, excludeFields: string[] = [], excludeUnderscoreFields: boolean = true): T {
  if (Array.isArray(data)) {
    return data.map(item => removeUnderscoreFields(item, excludeFields, excludeUnderscoreFields)) as T;
  } else if (data !== null && typeof data === 'object') {
    const sanitizedData: Record<string, any> = {};
    for (const key in data) {
      if ((!excludeUnderscoreFields || !key.startsWith('_')) && !excludeFields.includes(key)) {
        sanitizedData[key] = removeUnderscoreFields((data as Record<string, any>)[key], excludeFields, excludeUnderscoreFields);
      }
    }
    return sanitizedData as T;
  } else {
    return data;
  }
}