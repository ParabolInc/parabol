import DOMPurify from 'dompurify'
import {twMerge} from 'tailwind-merge'
import getSafeRegex from '~/utils/getSafeRegex'

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
  return (
    <span
      className={twMerge('overflow-hidden text-ellipsis whitespace-nowrap', className)}
      dangerouslySetInnerHTML={{
        __html: cleanInnerHtml
      }}
    />
  )
}

export default TypeAheadLabel
