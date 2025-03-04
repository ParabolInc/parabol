import {NodeViewContent, type NodeViewProps} from '@tiptap/react'
import {Button} from '../../../ui/Button/Button'

interface Props {
  updateAttributes: NodeViewProps['updateAttributes']
}
export const InsightsBlockResult = (props: Props) => {
  const {updateAttributes} = props
  return (
    <>
      <NodeViewContent className='outline-hidden' contentEditable />
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
