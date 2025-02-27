import {cn} from '../../ui/cn'

interface Props {
  html: string
  disableAnonymity: boolean
}

export const HTMLReflection = (props: Props) => {
  const {html, disableAnonymity} = props
  return (
    <div className={cn('relative w-full overflow-auto text-sm leading-5 text-slate-700')}>
      <div
        className={cn(
          'ProseMirror flex max-h-41 min-h-6 w-full flex-col items-start justify-center px-4 pt-3 leading-5',
          disableAnonymity ? 'pb-0' : 'pb-3'
        )}
        dangerouslySetInnerHTML={{__html: html}}
      ></div>
    </div>
  )
}

export default HTMLReflection
