import {type NodeViewProps, NodeViewWrapper} from '@tiptap/react'
import {useCallback, useEffect, useRef, useState} from 'react'
import {OpenInFull as OpenInFullIcon} from '~/ui/icons'
import {useBlockResizer} from '../../../hooks/useBlockResizer'
import {useSignInAndReturn} from '../../../hooks/useSignInAndReturn'
import {Button} from '../../../ui/Button/Button'
import {cn} from '../../../ui/cn'
import {useEmbedNewUserAsset} from '../fileBlock/useEmbedNewUserAsset'
import {BlockResizer} from './BlockResizer'
import {getLightboxImages, OPEN_IMAGE_LIGHTBOX_META} from './getLightboxImages'
import type {ImageBlockAttrs} from './ImageBlock'
import {ImageBlockBubbleMenu} from './ImageBlockBubbleMenu'
import {ImageBlockPlaceholder} from './ImageBlockPlaceholder'
import {ImageLightbox, type LightboxImage} from './ImageLightbox'

const NOTICES = {
  signIn: {
    title: 'Sign in to add images',
    description: "Others won't see this image until a signed-in editor adds it."
  },
  embedError: {
    title: "Image couldn't be embedded",
    description: 'The source requires authentication or is behind a firewall.'
  },
  external: {
    title: 'External image',
    description: "Images from other sites aren't loaded automatically."
  }
}

export const ImageBlockView = (props: NodeViewProps) => {
  const {editor, getPos, node, updateAttributes, selected} = props
  const imageWrapperRef = useRef<HTMLDivElement>(null)
  const {attrs} = node
  const {src, align, height, width, isFullWidth} = attrs as ImageBlockAttrs
  const alignClass =
    align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center'
  const {scopeKey, assetScope} = editor.extensionStorage.fileUpload
  const {isPending, embedError, isSignInRequired, isBlocked} = useEmbedNewUserAsset(
    src,
    scopeKey,
    assetScope,
    editor
  )
  const signIn = useSignInAndReturn()
  const [lightbox, setLightbox] = useState<{images: LightboxImage[]; startIndex: number} | null>(
    null
  )
  const openLightbox = useCallback(() => {
    const pos = getPos()
    if (pos === undefined) return
    setLightbox(getLightboxImages(editor.state.doc, pos))
  }, [getPos, editor])
  const onClick = useCallback(() => {
    if (!editor.isEditable) {
      openLightbox()
      return
    }
    const pos = getPos()
    if (!pos) return
    editor.chain().focus().setNodeSelection(pos).run()
  }, [getPos, editor, openLightbox])

  useEffect(() => {
    const onTransaction = ({transaction}: {transaction: {getMeta: (key: string) => unknown}}) => {
      const pos = transaction.getMeta(OPEN_IMAGE_LIGHTBOX_META)
      if (pos !== undefined && pos === getPos()) openLightbox()
    }
    editor.on('transaction', onTransaction)
    return () => {
      editor.off('transaction', onTransaction)
    }
  }, [editor, getPos, openLightbox])

  const [maxHeight, setMaxHeight] = useState(
    // if no height is provided (first load), make sure the image is no taller than the editor
    height ? undefined : editor.storage.imageBlock.editorHeight
  )

  const aspectRatioRef = useRef(1)
  const {onPointerDown} = useBlockResizer(
    (attrs) => updateAttributes({...attrs, isFullWidth: false}),
    editor.view.dom.getBoundingClientRect().width || editor.storage.imageBlock.editorWidth,
    aspectRatioRef
  )
  const onPointerDownLeft = onPointerDown('left')
  const onPointerDownRight = onPointerDown('right')

  const notice = isSignInRequired
    ? NOTICES.signIn
    : embedError
      ? NOTICES.embedError
      : isBlocked
        ? NOTICES.external
        : null
  if (notice) {
    return (
      <NodeViewWrapper>
        <div className={cn('flex', alignClass)}>
          <ImageBlockPlaceholder
            src={src}
            onClick={onClick}
            title={notice.title}
            description={notice.description}
            action={
              isSignInRequired && (
                <Button
                  variant='outline'
                  size='sm'
                  className='mt-2'
                  onClick={(e) => {
                    e.stopPropagation()
                    signIn()
                  }}
                >
                  Sign in
                </Button>
              )
            }
          />
        </div>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper>
      <div className={cn('flex', alignClass)}>
        <div
          contentEditable={false}
          ref={imageWrapperRef}
          className={cn('group relative', isFullWidth ? 'w-full' : 'w-fit')}
        >
          <img
            draggable={false}
            data-uploading={isPending ? '' : undefined}
            className={cn(
              'block data-uploading:animate-shimmer data-uploading:[mask:linear-gradient(-60deg,#000_30%,#0005,#000_70%)_right/350%_100%]',
              !editor.isEditable && 'cursor-zoom-in'
            )}
            src={src}
            alt=''
            onClick={onClick}
            onDoubleClick={editor.isEditable ? openLightbox : undefined}
            style={{maxHeight: isFullWidth ? undefined : maxHeight}}
            width={isFullWidth ? '100%' : width}
            height={isFullWidth ? undefined : height}
            onLoad={(e) => {
              const img = e.target as HTMLImageElement
              aspectRatioRef.current = img.width / img.height
              if (img.width !== width && !isFullWidth) {
                // on initial load, once we grab the h/w/ar, remove the maxH constraint
                setMaxHeight(undefined)
                updateAttributes({width: img.width, height: img.height})
              }
            }}
          />
          {editor.storage.imageBlock.expandButton && !isPending && (
            <button
              type='button'
              aria-label='Expand image'
              title='Expand image'
              className='absolute top-1.5 right-1.5 flex size-7 cursor-pointer items-center justify-center rounded-md border border-hairline-strong bg-surface-card text-fg-primary opacity-0 pointer-coarse:opacity-100 shadow-sm transition-opacity hover:bg-surface-raised focus-visible:opacity-100 group-hover:opacity-100'
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.stopPropagation()
                openLightbox()
              }}
            >
              <OpenInFullIcon className='text-base' />
            </button>
          )}
          {editor.isEditable && (
            <>
              {!isFullWidth && (
                <>
                  <BlockResizer className='left-0' onPointerDown={onPointerDownLeft} />
                  <BlockResizer className='right-0' onPointerDown={onPointerDownRight} />
                </>
              )}
              <ImageBlockBubbleMenu
                editor={editor}
                align={align}
                updateAttributes={updateAttributes}
                width={width}
                isFullWidth={isFullWidth}
                isOpen={selected && !lightbox}
                onExpand={openLightbox}
              />
            </>
          )}
        </div>
      </div>
      {lightbox && (
        <ImageLightbox
          images={lightbox.images}
          startIndex={lightbox.startIndex}
          onClose={() => setLightbox(null)}
        />
      )}
    </NodeViewWrapper>
  )
}

export default ImageBlockView
