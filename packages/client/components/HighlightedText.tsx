import escapeRegExp from '../utils/escapeRegExp'

interface Props {
  text: string
  query: string | readonly string[]
  variant?: 'bold' | 'mark'
  className?: string
}

const HighlightedText = (props: Props) => {
  const {text, query, variant = 'bold', className} = props
  const terms = (typeof query === 'string' ? [query] : query).filter(Boolean)
  const parts =
    terms.length > 0
      ? text.split(new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'i'))
      : [text]
  const MatchTag = variant === 'mark' ? 'mark' : 'b'
  return (
    <span className={className}>
      {parts.map((part, index) =>
        index % 2 === 1 ? <MatchTag key={index}>{part}</MatchTag> : part
      )}
    </span>
  )
}

export default HighlightedText
