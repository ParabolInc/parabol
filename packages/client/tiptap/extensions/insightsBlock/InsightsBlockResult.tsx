import {NodeViewContent, type NodeViewProps} from '@tiptap/react'
import {Button} from '../../../ui/Button/Button'

interface Props {
  updateAttributes: NodeViewProps['updateAttributes']
}
export const InsightsBlockResult = (props: Props) => {
  const {updateAttributes} = props
  return (
    <>
      <div contentEditable className='outline-hidden'>
        <NodeViewContent className='content' />
      </div>
      <div className='flex justify-end p-4'>
        <Button
          variant='secondary'
          shape='pill'
          size='md'
          onClick={() => {
            updateAttributes({editing: true})
          }}
        >
          New Query
        </Button>
      </div>
    </>
  )
}
