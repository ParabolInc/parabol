import {useState} from 'react'
import {Button} from '../ui/Button/Button'
import plural from '../utils/plural'
import scopeResources from './OAuthConsent/scopeResources'

const COLLAPSED_COUNT = 2

interface Props {
  scopes: readonly string[]
}

const AIAppScopeList = ({scopes}: Props) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const grantedScopes = new Set(scopes)
  const titles = Object.entries(scopeResources).flatMap(([resource, {title}]) =>
    grantedScopes.has(`${resource}_READ`) || grantedScopes.has(`${resource}_WRITE`) ? [title] : []
  )
  const hiddenCount = titles.length - COLLAPSED_COUNT
  const visibleTitles = isExpanded ? titles : titles.slice(0, COLLAPSED_COUNT)
  return (
    <span className='text-fg-primary'>
      {visibleTitles.join(', ')}
      {hiddenCount > 0 && (
        <Button
          variant='flat'
          size='sm'
          className='ml-1 px-1.5 font-semibold text-fg-secondary'
          aria-expanded={isExpanded}
          aria-label={
            isExpanded
              ? 'Show fewer permissions'
              : `Show ${hiddenCount} more ${plural(hiddenCount, 'permission')}`
          }
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Less' : `+${hiddenCount}`}
        </Button>
      )}
    </span>
  )
}

export default AIAppScopeList
