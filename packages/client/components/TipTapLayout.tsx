import {generateHTML, generateJSON} from '@tiptap/core'
import {Outlet} from 'react-router'
import {serverTipTapExtensions} from '../shared/tiptap/serverTipTapExtensions'
import sanitizeTipTapHtml from '../utils/sanitizeTipTapHtml'
import {TipTapProvider} from './TipTapProvider'

const generateSanitizedHTML: typeof generateHTML = (doc, extensions) =>
  sanitizeTipTapHtml(generateHTML(doc, extensions))

const TipTapLayout = () => {
  return (
    <TipTapProvider
      generateHTML={generateSanitizedHTML}
      generateJSON={generateJSON}
      extensions={serverTipTapExtensions}
    >
      <Outlet />
    </TipTapProvider>
  )
}

export default TipTapLayout
