import DOMPurify from 'dompurify';

export const sanitizeHTML = (dirty) => ({
  __html: DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p'],
    ALLOWED_ATTR: []
  })
}); 