export interface ExternalLinkProps {
  className?: string
  copy: string
  href: string
}
const ExternalLink = ({className, copy, href}: ExternalLinkProps) => {
  return (
    <a href={href} rel='noopener noreferrer' target='_blank' title={copy} className={className}>
      {copy}
    </a>
  )
}

export default ExternalLink
