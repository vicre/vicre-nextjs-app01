// lib/utils.mjs

export function removeUnderscoreFields(data, excludeFields = []) {
    if (Array.isArray(data)) {
      return data.map(item => removeUnderscoreFields(item, excludeFields));
    } else if (data !== null && typeof data === 'object') {
      const sanitizedData = {};
      for (const key in data) {
        if (!key.startsWith('_') && !excludeFields.includes(key)) {
          sanitizedData[key] = removeUnderscoreFields(data[key], excludeFields);
        }
      }
      return sanitizedData;
    } else {
      return data;
    }
  }
  