import {cn} from '../../ui/cn'
import sanitizeExternalHtml from '../../utils/sanitizeExternalHtml'

interface Props {
  html: string
  disableAnonymity: boolean
}

export const HTMLReflection = (props: Props) => {
  const {html, disableAnonymity} = props
  return (
    // The vertical padding lives out here because `.ProseMirror` in global.css is unlayered and
    // sets its own py, which outranks every Tailwind utility (they're in `layer(utilities)`).
    // 8px matches the `py-2` that ReflectionCardRoot carries in ReflectionCard, so this ghost is
    // the same height as the card it stands in for
    <div
      className={cn(
        'relative w-full overflow-auto pt-2 text-fg-primary text-sm leading-5',
        disableAnonymity ? 'pb-0' : 'pb-2'
      )}
    >
      <div
        className='ProseMirror flex max-h-41 min-h-6 w-full flex-col items-start justify-center px-4 leading-5'
        dangerouslySetInnerHTML={{__html: sanitizeExternalHtml(html)}}
      ></div>
    </div>
  )
}

export default HTMLReflection
