import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import EditIcon from '@mui/icons-material/Edit'
import {Fragment} from '@tiptap/pm/model'
import {getHTMLFromFragment, NodeViewContent, type NodeViewProps} from '@tiptap/react'
import {Tooltip} from '../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../ui/Tooltip/TooltipTrigger'
import type {InsightsBlockAttrs} from './InsightsBlock'

export const InsightsBlockResult = (props: NodeViewProps) => {
  const {editor, node, updateAttributes} = props
  const attrs = node.attrs as InsightsBlockAttrs
  const {id} = attrs
  return (
    <>
      <div className='flex justify-end space-x-2'>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className='cursor-pointer text-slate-600 hover:text-slate-700'
              onClick={async () => {
                const nodePos = editor.$node('insightsBlock', {id})!
                // Leaving the comment here in case we want to switch back to plain text
                // const plainText = editor.state.doc.textBetween(nodePos.from, nodePos.to, '\n')
                // Important: get HTML from schema so we get attributes
                const fragment = Fragment.from(nodePos.node)
                const htmlText = getHTMLFromFragment(fragment, editor.schema)
                const markdownText = editor.storage.markdown.serializer.serialize(nodePos.node)
                await navigator.clipboard.write([
                  new ClipboardItem({
                    'text/plain': new Blob([markdownText], {
                      type: 'text/plain'
                    }),
                    'text/html': new Blob([htmlText], {type: 'text/html'})
                  })
                ])
              }}
            >
              <ContentCopyIcon />
            </button>
          </TooltipTrigger>
          <TooltipContent side='bottom' align='center'>
            {'Copy'}
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className='cursor-pointer text-slate-600 hover:text-slate-700'
              onClick={() => {
                updateAttributes({editing: true})
              }}
            >
              <EditIcon />
            </button>
          </TooltipTrigger>
          <TooltipContent side='bottom' align='center'>
            {'Edit query'}
          </TooltipContent>
        </Tooltip>
      </div>
      <NodeViewContent className='px-4 outline-hidden' />
    </>
  )
}
