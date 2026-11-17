import {cn} from '../../ui/cn'
import ExternalLink, {type ExternalLinkProps} from '../ExternalLink'

const HelpMenuLink = (props: ExternalLinkProps) => {
  const {className, ...rest} = props
  return <ExternalLink {...rest} className={cn('underline', className)} />
}

export default HelpMenuLink
