import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {OAuthConsentHeader_request$key} from '../../__generated__/OAuthConsentHeader_request.graphql'
import {cn} from '../../ui/cn'
import {CheckCircle, Public, SwapHoriz, Warning} from '../../ui/icons'
import getTileColorClass from './getTileColorClass'
import OAuthConsentChip from './OAuthConsentChip'

const TILE_CLASS =
  'flex size-14 shrink-0 items-center justify-center rounded-[14px] font-bold text-2xl text-white'

interface Props {
  requestRef: OAuthConsentHeader_request$key
  email: string
}

const OAuthConsentHeader = ({requestRef, email}: Props) => {
  const request = useFragment(
    graphql`
      fragment OAuthConsentHeader_request on OAuthAuthorizationRequest {
        name
        verifiedAt
        clientHost
        organization {
          id
        }
        organizations {
          blockedReason
        }
      }
    `,
    requestRef
  )
  const {name, verifiedAt, clientHost, organization, organizations} = request
  const isGlobal = !organization
  const isUnverified = isGlobal && !verifiedAt
  const reachesNoOrg = isGlobal && organizations.every(({blockedReason}) => blockedReason)
  const title = reachesNoOrg
    ? `${name} can’t reach any of your organizations`
    : `${name} wants to use your Parabol account`
  return (
    <>
      <div aria-hidden='true' className='flex items-center justify-center gap-3.5 text-fg-muted'>
        {isUnverified ? (
          <span
            className={cn(
              TILE_CLASS,
              'bg-surface-well text-fg-secondary ring-1 ring-hairline-strong ring-inset'
            )}
          >
            <Public className='text-[28px]' />
          </span>
        ) : (
          <span className={cn(TILE_CLASS, getTileColorClass(name))}>
            {name.charAt(0).toUpperCase()}
          </span>
        )}
        <span className='w-10 border-hairline-strong border-t-2 border-dashed' />
        <SwapHoriz className='text-xl' />
        <span className='w-10 border-hairline-strong border-t-2 border-dashed' />
        <span className={cn(TILE_CLASS, 'bg-linear-135 from-tomato-500 to-rose-500')}>P</span>
      </div>
      <div className='flex flex-col items-center gap-2 text-center text-fg-secondary text-sm'>
        <h1 className='wrap-anywhere m-0 font-semibold text-fg-primary text-xl leading-7'>
          {title}
        </h1>
        {isUnverified && (
          <span className='wrap-anywhere rounded-md bg-surface-well px-2 py-0.5 font-medium font-mono text-[15px] text-fg-primary'>
            {clientHost}
          </span>
        )}
        {isGlobal &&
          (verifiedAt ? (
            <OAuthConsentChip tone='ok' Icon={CheckCircle} label='Verified by Parabol' />
          ) : (
            <OAuthConsentChip tone='warn' Icon={Warning} label='Unverified app' />
          ))}
        <span className='wrap-anywhere'>
          Signed in as <b className='font-semibold text-fg-primary'>{email}</b>
        </span>
      </div>
    </>
  )
}

export default OAuthConsentHeader
