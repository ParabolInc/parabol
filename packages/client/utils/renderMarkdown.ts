import {marked} from 'marked'
import sanitizeHtml from 'sanitize-html'

const renderMarkdown = (text: string) => {
  const renderedText = marked(text, {
    gfm: true,
    breaks: true
  }) as string
  return sanitizeHtml(renderedText, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['a']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ['href', 'target', 'rel']
    },
    transformTags: {
      a: (tagName, attribs) => {
        return {
          tagName,
          attribs: {
            ...attribs,
            target: '_blank',
            rel: 'noopener noreferrer'
          }
        }
      }
    }
  })
}

export default renderMarkdown
