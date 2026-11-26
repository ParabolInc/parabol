import {useEffect, useRef} from 'react'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useAuthRoute from '../../../../hooks/useAuthRoute'
import CreateImposterTokenMutation from '../../../../mutations/CreateImposterTokenMutation'
import {AuthTokenRole} from '../../../../types/constEnums'

const Impersonate = () => {
  const params = new URLSearchParams(location.search)
  const email = params.get('email') || params.get('e')
  const userId = params.get('userId') || params.get('u')
  const atmosphere = useAtmosphere()
  const impersonationRequestedRef = useRef(false)
  useAuthRoute({role: AuthTokenRole.SUPER_USER, silent: true})
  useEffect(() => {
    if (impersonationRequestedRef.current) return
    impersonationRequestedRef.current = true
    if (email || userId) {
      CreateImposterTokenMutation(atmosphere, {userId, email})
    }
  }, [])
  return <div>{email || userId ? 'Impersonating...' : 'No email or userId provided!'}</div>
}

export default Impersonate
