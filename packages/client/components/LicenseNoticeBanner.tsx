import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {LicenseNoticeBanner_viewer$key} from '~/__generated__/LicenseNoticeBanner_viewer.graphql'
import {cn} from '../ui/cn'

interface Props {
  viewerRef: LicenseNoticeBanner_viewer$key
}

// Tells the admins of organizations that depend on the instance's license that it's missing, invalid, expiring,
// expired, or over its seats. The server decides who sees it and words it.
const LicenseNoticeBanner = (props: Props) => {
  const {viewerRef} = props
  const viewer = useFragment(
    graphql`
      fragment LicenseNoticeBanner_viewer on User {
        licenseNotice {
          kind
          message
        }
      }
    `,
    viewerRef
  )
  const {licenseNotice} = viewer
  if (!licenseNotice) return null
  const {kind, message} = licenseNotice
  const isUrgent = kind === 'MISSING' || kind === 'INVALID' || kind === 'EXPIRED'
  return (
    <div
      role='status'
      className={cn(
        'w-full px-4 py-2 text-center font-semibold text-sm print:hidden',
        isUrgent ? 'bg-tomato-500 text-white' : 'bg-gold-300 text-slate-900'
      )}
    >
      {message}
    </div>
  )
}

export default LicenseNoticeBanner
