import {Fetcher} from '@graphiql/toolkit'
import GraphiQL from 'graphiql/dist'
import 'graphiql/graphiql.css'
import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useAuthRoute from '../../../../hooks/useAuthRoute'
import logoMarkPrimary from '../../../../styles/theme/images/brand/lockup_color_mark_dark_type.svg'
import logoMarkDark from '../../../../styles/theme/images/brand/lockup_color_mark_white_type.svg'

import {AuthTokenRole} from '../../../../types/constEnums'

const GraphqlContainer = () => {
  const atmosphere = useAtmosphere()
  useAuthRoute({role: AuthTokenRole.SUPER_USER})
  const fetcher: Fetcher = async ({query, variables}) => {
    const res = await fetch('/intranet-graphql', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-application-authorization': `Bearer ${atmosphere.authToken}`
      },
      body: JSON.stringify({query, variables, isPrivate: true})
    })
    const resJSON = await res.json()
    return resJSON
  }

  const [isDarkMode, setIsDarkMode] = useState(false)
  useEffect(() => {
    // @graphiql/react only supports ESM so we can't import useTheme
    // This hack works, but it won't update until the component re-renders
    const setMode = localStorage.getItem('graphiql:theme')
    const nextTheme =
      setMode === 'dark'
        ? true
        : setMode === 'light'
          ? false
          : window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDarkMode(nextTheme)
  })

  const logo = isDarkMode ? logoMarkDark : logoMarkPrimary
  return (
    <GraphiQL fetcher={fetcher}>
      <GraphiQL.Logo>
        <Link to={'/'}>
          <img crossOrigin='' alt='Parabol' src={logo} className={'flex'} />
        </Link>
      </GraphiQL.Logo>
    </GraphiQL>
  )
}

export default GraphqlContainer
