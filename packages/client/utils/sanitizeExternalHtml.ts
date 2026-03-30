import DOMPurify from 'dompurify'

// Force all links to open safely in new tabs
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank')
    node.setAttribute('rel', 'noopener noreferrer')
  }
})

const sanitizeExternalHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ADD_ATTR: ['target'], // prevent DOMPurify from stripping target before the hook runs
    FORBID_TAGS: ['style'] // block <style> tags to prevent CSS injection
  })
}

export default sanitizeExternalHtml
