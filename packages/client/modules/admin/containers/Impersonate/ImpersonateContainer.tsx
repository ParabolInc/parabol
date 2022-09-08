import React, {useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useAuthRoute from '../../../../hooks/useAuthRoute'
import CreateImposterTokenMutation from '../../../../mutations/CreateImposterTokenMutation'
import {AuthTokenRole} from '../../../../types/constEnums'

const Impersonate = () => {
  const {t} = useTranslation()

  const params = new URLSearchParams(location.search)
  const email = params.get('email') || params.get('e')
  const userId = params.get('userId') || params.get('u')
  const atmosphere = useAtmosphere()
  useAuthRoute({role: AuthTokenRole.SUPER_USER, silent: true})
  useEffect(() => {
    if (email || userId) {
      CreateImposterTokenMutation(atmosphere, {userId, email})
    }
  })
  return (
    <div>{email || userId ? 'Impersonating...' : t('Impersonate.NoEmailOrUserIdProvided')}</div>
  )
}

export default Impersonate
