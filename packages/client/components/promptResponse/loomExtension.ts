import {Node, nodeInputRule, nodePasteRule} from '@tiptap/core'

const LOOM_REGEX = /^(?:https:\/\/)?(?:www\.)?loom\.com\/share\/[a-zA-Z0-9]*\?.*$/g

export const LoomExtension = Node.create({
  name: 'loom',

  group: 'block',
  inline: false,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null
      }
    }
  },

  renderHTML(props) {
    const {HTMLAttributes} = props
    const components = HTMLAttributes.src.split('/')
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
      ]
    ]
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: LOOM_REGEX,
        type: this.type,
        getAttributes: (match) => {
          return {
            src: match.input
          }
        }
      })
    ]
  },

  addPasteRules() {
    return [
      nodePasteRule({
        find: LOOM_REGEX,
        type: this.type,
        getAttributes: (match) => {
          return {
            src: match.input
          }
        }
      })
    ]
  }
})
