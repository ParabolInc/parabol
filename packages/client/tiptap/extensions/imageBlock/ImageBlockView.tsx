import {NodeViewWrapper, type NodeViewProps} from '@tiptap/react'
import {useCallback, useRef, useState} from 'react'
import {useBlockResizer} from '../../../hooks/useBlockResizer'
import {cn} from '../../../ui/cn'
import {BlockResizer} from './BlockResizer'

export const ImageBlockView = (props: NodeViewProps) => {
  const {editor, getPos, node, updateAttributes} = props
  const imageWrapperRef = useRef<HTMLDivElement>(null)
  const {src} = node.attrs

  const alignClass =
    node.attrs.align === 'left'
      ? 'justify-start'
      : node.attrs.align === 'right'
        ? 'justify-end'
        : 'justify-center'

  const onClick = useCallback(() => {
    editor.commands.setNodeSelection(getPos())
  }, [getPos, editor.commands])

  const maxHeightRef = useRef<number | undefined>(editor.storage.imageUpload.editorHeight)
  const {current: maxHeight} = maxHeightRef
  const ref = useRef<HTMLImageElement>(null)
  const [width, setWidth] = useState<number>(node.attrs.width || 0)
  const {onMouseDown} = useBlockResizer(width, setWidth, updateAttributes)
  const onMouseDownLeft = onMouseDown('left')
  const onMouseDownRight = onMouseDown('right')
  return (
    <NodeViewWrapper>
      <div className={cn('flex', alignClass)}>
        <div contentEditable={false} ref={imageWrapperRef} className='group relative w-fit'>
          <img
            className='block'
            src={src}
            alt=''
            onClick={onClick}
            style={{maxHeight, width: width === 0 ? undefined : width}}
            ref={ref}
            onLoad={(e) => {
              const img = e.target as HTMLImageElement
              maxHeightRef.current = undefined
              setWidth(img.width)
            }}
          />
          {editor.isEditable && editor.isFocused && (
            <>
              <BlockResizer className='left-0' onMouseDown={onMouseDownLeft} />
              <BlockResizer className='right-0' onMouseDown={onMouseDownRight} />
            </>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  )
}

export default ImageBlockView
