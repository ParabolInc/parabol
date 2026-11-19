interface Props {
  text: string
  searchQuery: string
}

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const RetroTemplateMatchText = ({text, searchQuery}: Props) => {
  if (!searchQuery) return text
  const parts = text.split(new RegExp(`(${escapeRegExp(searchQuery)})`, 'i'))
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <strong key={index} className='font-semibold'>
        {part}
      </strong>
    ) : (
      part
    )
  )
}

export default RetroTemplateMatchText
