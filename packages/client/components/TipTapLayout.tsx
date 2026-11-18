import {Outlet} from '@tanstack/react-router'
import {generateHTML, generateJSON} from '@tiptap/core'
import {serverTipTapExtensions} from '../shared/tiptap/serverTipTapExtensions'
import {TipTapProvider} from './TipTapProvider'

const TipTapLayout = () => {
  return (
    <TipTapProvider
      generateHTML={generateHTML}
      generateJSON={generateJSON}
      extensions={serverTipTapExtensions}
    >
      <Outlet />
    </TipTapProvider>
  )
}

export default TipTapLayout
