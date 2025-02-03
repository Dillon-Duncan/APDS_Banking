import DOMPurify from 'dompurify';

export const sanitizeInput = (input) => 
  DOMPurify.sanitize(input, {
    allowedTags: [],
    allowedAttributes: {}
  });

export const sanitizeHTML = (dirty) => ({
  __html: DOMPurify.sanitize(dirty, {
    allowedTags: ['b', 'i', 'em', 'strong'],
    allowedAttributes: {}
  })
}); 