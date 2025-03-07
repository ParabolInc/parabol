import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ModelTrainingIcon from '@mui/icons-material/ModelTraining'
import {NodeViewContent, type NodeViewProps} from '@tiptap/react'
import {NodeHtmlMarkdown} from 'node-html-markdown-cloudflare'
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
      <NodeViewContent className='px-4 outline-hidden' />
      <div className='absolute top-0 right-0 flex justify-end space-x-2 p-4'>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className='cursor-pointer text-slate-600'
              onClick={async () => {
                const nodePos = editor.$node('insightsBlock', {id})!
                const nodeEl = editor.view.domAtPos(nodePos.pos).node as HTMLDivElement
                const markdown = NodeHtmlMarkdown.translate(nodeEl.outerHTML)
                await navigator.clipboard.writeText(markdown)
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
              className='cursor-pointer text-slate-600'
              onClick={() => {
                updateAttributes({editing: true})
              }}
            >
              <ModelTrainingIcon />
            </button>
          </TooltipTrigger>
          <TooltipContent side='bottom' align='center'>
            {'Start over'}
          </TooltipContent>
        </Tooltip>
      </div>
    </>
  )
}
