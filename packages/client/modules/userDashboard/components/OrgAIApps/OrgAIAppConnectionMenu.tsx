import {Link} from '@tanstack/react-router'
import {useRef, useState} from 'react'
import useRevokeOAuthAPIGrantFromOrgMutation from '../../../../mutations/useRevokeOAuthAPIGrantFromOrgMutation'
import {Button} from '../../../../ui/Button/Button'
import {MoreVert} from '../../../../ui/icons'
import {Menu} from '../../../../ui/Menu/Menu'
import {MenuContent} from '../../../../ui/Menu/MenuContent'
import {MenuItem} from '../../../../ui/Menu/MenuItem'
import {MenuSeparator} from '../../../../ui/Menu/MenuSeparator'
import RevokeAIAppDialog from './RevokeAIAppDialog'

interface Props {
  grantId: string
  appName: string
  isUnverified: boolean
  memberName: string
  orgId: string
  orgName: string
}

const OrgAIAppConnectionMenu = (props: Props) => {
  const {grantId, appName, isUnverified, memberName, orgId, orgName} = props
  const [isRevokeOpen, setIsRevokeOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [revoke, submitting] = useRevokeOAuthAPIGrantFromOrgMutation()
  const firstName = memberName.split(' ')[0]
  const handleRevoke = () => {
    revoke({variables: {grantId, orgId}, onCompleted: () => setIsRevokeOpen(false)})
  }
  return (
    <>
      <Menu
        trigger={
          <Button
            ref={triggerRef}
            variant='flat'
            shape='icon'
            className='size-8 text-fg-secondary'
            aria-label={`${memberName}’s ${appName} connection`}
          >
            <MoreVert className='text-xl' />
          </Button>
        }
      >
        <MenuContent align='end' sideOffset={4}>
          <MenuItem onClick={() => setIsRevokeOpen(true)}>
            <div className='py-1'>
              <div>Revoke {orgName} access</div>
              <div className='text-fg-muted text-xs'>{firstName}’s other organizations keep it</div>
            </div>
          </MenuItem>
          <MenuSeparator />
          <MenuItem asChild>
            <Link to='/me/organizations/$orgId/members' params={{orgId}}>
              View {memberName} in Members
            </Link>
          </MenuItem>
        </MenuContent>
      </Menu>
      {isRevokeOpen && (
        <RevokeAIAppDialog
          appName={appName}
          memberName={memberName}
          isUnverified={isUnverified}
          orgName={orgName}
          submitting={submitting}
          onConfirm={handleRevoke}
          onClose={() => setIsRevokeOpen(false)}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            triggerRef.current?.focus()
          }}
        />
      )}
    </>
  )
}

export default OrgAIAppConnectionMenu
