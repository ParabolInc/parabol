import React, {useEffect} from 'react'
import {RouteComponentProps} from 'react-router'
import requireAuthAndRole from 'universal/decorators/requireAuthAndRole/requireAuthAndRole'
import CreateImposterTokenMutation from 'universal/mutations/CreateImposterTokenMutation'
import useAtmosphere from '../../../../hooks/useAtmosphere'

interface Props extends RouteComponentProps<{newUserId: string}> {}

const Impersonate = (props: Props) => {
  const {
    match: {
      params: {newUserId}
    },
    history,
    location
  } = props
  const atmosphere = useAtmosphere()
  useEffect(() => {
    if (newUserId) {
      CreateImposterTokenMutation(atmosphere, newUserId, {
        history,
        location
      })
    }
  })
  return <div>{newUserId ? 'Impersonating...' : 'No userId provided!'}</div>
}

export default requireAuthAndRole({role: 'su', silent: true})(Impersonate)
