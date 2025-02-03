const sanitizeMetadata = (metadata) => {
  const clean = {};
  for(const [key, value] of Object.entries(metadata)) {
    clean[key] = typeof value === 'string' 
      ? value.replace(/[<>"']/g, '')
      : value;
  }
  return clean;
}; 

const redactPII = (value) => {
  if (typeof value === 'string') {
    return value
      .replace(/\b\d{4}-\d{4}-\d{4}-\d{4}\b/g, '****-****-****-****')
      .replace(/\b\d{9,10}\b/g, '*********');
  }
  return value;
}; 