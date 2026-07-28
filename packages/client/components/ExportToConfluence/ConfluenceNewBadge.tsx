import {CONFLUENCE_EXPORT_BADGE_SUNSET, CONFLUENCE_EXPORT_SEEN_KEY} from '../../utils/constants'

export const showConfluenceBadge = () =>
  new Date() < new Date(CONFLUENCE_EXPORT_BADGE_SUNSET) &&
  !window.localStorage.getItem(CONFLUENCE_EXPORT_SEEN_KEY)

export const dismissConfluenceBadge = () =>
  window.localStorage.setItem(CONFLUENCE_EXPORT_SEEN_KEY, '1')

export const ConfluenceNewBadge = () => {
  if (!showConfluenceBadge()) return null
  return (
    <span className='ml-2 rounded-full bg-rose-500 px-1.5 font-semibold text-white text-xs'>
      {'NEW'}
    </span>
  )
}
