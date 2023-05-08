import {Mark, markInputRule, markPasteRule} from '@tiptap/core'

const LOOM_REGEX = /^(?:https:\/\/)?(?:www\.)?loom\.com\/share\/[a-zA-Z0-9]*$/g

export const LoomExtension = Mark.create({
  name: 'loom',

  content: 'inline*',

  group: 'block',

  defining: true,
  addAttributes() {
    return {
      src: {
        default: null
      }
    }
  },

  renderHTML(props) {
    const {HTMLAttributes} = props
    console.log(props)
    const components = HTMLAttributes.src.split('/')
    // return ['div', HTMLAttributes, 0]
    return [
      'div',
      HTMLAttributes,
      [
        'div',
        {style: 'position: relative; padding-bottom: 75%; height: 0;'},
        [
          'iframe',
          {
            src: `https://www.loom.com/embed/${components[components.length - 1]}`,
            style: 'position: absolute; top: 0; left: 0; width: 100%; height: 100%;',
            frameborder: '0',
            webkitallowfullscreen: true,
            mozallowfullscreen: true,
            allowfullscreen: true
          }
        ]
      ],
      ['div', HTMLAttributes, 0]
    ]
  },

  addInputRules() {
    return [
      markInputRule({
        find: LOOM_REGEX,
        type: this.type,
        getAttributes: (match) => {
          console.log(match)
          return {
            src: match.input
          }
        }
      })
    ]
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: LOOM_REGEX,
        type: this.type,
        getAttributes: (match) => {
          console.log(match, {
            src: match.input
          })
          return {
            src: match.input
          }
        }
      })
    ]
  }
})
