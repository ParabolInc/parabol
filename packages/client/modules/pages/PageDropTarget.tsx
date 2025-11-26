import {cn} from '../../ui/cn'

export const PageDropTarget = (
  props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
) => {
  const {children, className, ...rest} = props
  return (
    <div
      onDragEnter={(e) => {
        e.preventDefault()
        e.currentTarget.setAttribute('data-hover', '')
      }}
      onDragLeave={(e) => {
        e.preventDefault()
        if (e.currentTarget.contains(e.relatedTarget as any)) {
          // still inside the zone, ignore
          return
        }
        e.currentTarget.removeAttribute('data-hover')
      }}
      className={cn(
        'data-drop-below:data-hover:bg-sky-300/70 data-drop-in:data-hover:bg-sky-300/70 data-drop-below:hover:bg-sky-300/70 data-drop-in:hover:bg-sky-300/70',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
