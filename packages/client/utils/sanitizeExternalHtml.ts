import DOMPurify from 'dompurify'

const sanitizeExternalHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ADD_ATTR: ['target'], // preserve target="_blank" on links
    FORBID_TAGS: ['style'] // block <style> tags to prevent CSS injection
  })
}

export default sanitizeExternalHtml
