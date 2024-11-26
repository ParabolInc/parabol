import {generateHTML} from '@tiptap/core'
import {render} from 'react-dom'
import Root from './Root'
import './scrollIntoViewIfNeeded'
import {serverTipTapExtensions} from './shared/tiptap/serverTipTapExtensions'
import './types/modules.d'

render(<Root />, document.getElementById('root'))
if (__PRODUCTION__ && 'serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    navigator.serviceWorker.register('/sw.js', {scope: '/'}).catch(console.error)
  })
}

const doc = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          text: 'well great!',
          type: 'text'
        },
        {
          type: 'hardBreak'
        },
        {
          type: 'mention',
          attrs: {
            id: 'google-oauth2|104933228229706489335',
            label: 'matt 🙈'
          }
        },
        {
          text: ' ',
          type: 'text'
        }
      ]
    },
    {
      type: 'paragraph',
      content: [
        {
          text: 'woot ',
          type: 'text'
        },
        {
          type: 'taskTag',
          attrs: {
            id: 'archived',
            label: null
          }
        },
        {
          text: ' ',
          type: 'text'
        }
      ]
    }
  ]
}

const html = generateHTML(doc, serverTipTapExtensions)
console.log(html)
// window.addEventListener('beforeinstallprompt', (e) => {
//   // Stash the event so it can be triggered later.
//   console.log("ready to install")
//   // call e.prompt() somewhere
//   e.userChoice
//     .then((choiceResult) => {
//       if (choiceResult.outcome === 'accepted') {
//         console.log('User accepted the A2HS prompt');
//       } else {
//         console.log('User dismissed the A2HS prompt');
//       }
//       e = null;
//     });
// });
//
// window.addEventListener('appinstalled', (evt) => {
//   console.log('a2hs installed');
// });
