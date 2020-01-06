import React, {useEffect} from 'react'
import {RouteComponentProps} from 'react-router'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useAuthRoute from '../../../../hooks/useAuthRoute'
import CreateImposterTokenMutation from '../../../../mutations/CreateImposterTokenMutation'
import {AuthTokenRole} from '../../../../types/constEnums'

interface Props extends RouteComponentProps<{newUserId: string}> {}

const Impersonate = (props: Props) => {
  const {match} = props
  const {params} = match
  const {newUserId} = params
  const atmosphere = useAtmosphere()
  useAuthRoute({role: AuthTokenRole.SUPER_USER, silent: true})
  useEffect(() => {
    if (newUserId) {
      CreateImposterTokenMutation(atmosphere, newUserId)
    }
  })
  return <div>{newUserId ? 'Impersonating...' : 'No userId provided!'}</div>
}

export default Impersonate
