import React, {useEffect} from 'react'
import {RouteComponentProps} from 'react-router'
import CreateImposterTokenMutation from 'universal/mutations/CreateImposterTokenMutation'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useAuthRoute from 'universal/hooks/useAuthRoute'
import {AuthTokenRole} from 'universal/types/graphql'

interface Props extends RouteComponentProps<{newUserId: string}> {}

const Impersonate = (props: Props) => {
  const {match, history} = props
  const {params} = match
  const {newUserId} = params
  const atmosphere = useAtmosphere()
  useAuthRoute({role: AuthTokenRole.su, silent: true})
  useEffect(() => {
    if (newUserId) {
      CreateImposterTokenMutation(atmosphere, newUserId, {
        history
      })
    }
  })
  return <div>{newUserId ? 'Impersonating...' : 'No userId provided!'}</div>
}

export default Impersonate
