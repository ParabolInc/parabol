import DOMPurify from 'dompurify'

const LOOM_EMBED_URL = 'https://www.loom.com/embed/'

const purify = DOMPurify(window)
purify.addHook('uponSanitizeElement', (node, {tagName}) => {
  if (tagName !== 'iframe') return
  const src = (node as Element).getAttribute('src')
  if (!src?.startsWith(LOOM_EMBED_URL)) node.parentNode?.removeChild(node)
})

const sanitizeTipTapHtml = (html: string) =>
  purify.sanitize(html, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['target', 'frameborder', 'allowfullscreen']
  })

export default sanitizeTipTapHtml
