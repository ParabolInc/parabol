import DOMPurify from 'dompurify'
import getSafeRegex from '~/utils/getSafeRegex'
import {cn} from '../ui/cn'

interface Props {
  query: string
  label: string
  highlight?: boolean
  className?: string
}

const TypeAheadLabel = (props: Props) => {
  const {query, label, highlight, className} = props
  const queryHtml = highlight ? `<mark className="bg-sky-300">$&</mark>` : `<b>$&</b>`
  const cleanInnerHtml = DOMPurify.sanitize(
    query ? label.replace(getSafeRegex(query, 'gi'), queryHtml) : label
  )
  const merged = cn('overflow-hidden text-ellipsis whitespace-nowrap', className)
  if (!cleanInnerHtml) {
    return <span className={merged}>{label}</span>
  }
  return (
    <span
      className={merged}
      dangerouslySetInnerHTML={{
        __html: cleanInnerHtml
      }}
    />
  )
}

export default TypeAheadLabel
