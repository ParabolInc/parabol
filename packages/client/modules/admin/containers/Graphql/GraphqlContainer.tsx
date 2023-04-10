import styled from '@emotion/styled'
import {Fetcher} from '@graphiql/toolkit'
import GraphiQL from 'graphiql'
import 'graphiql/graphiql.css'
import React, {useRef} from 'react'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useAuthRoute from '../../../../hooks/useAuthRoute'
import logoMarkPrimary from '../../../../styles/theme/images/brand/lockup_color_mark_dark_type.svg'
import {AuthTokenRole} from '../../../../types/constEnums'

const GQL = styled('div')({
  margin: 0,
  height: '100vh',
  minHeight: '100vh',
  padding: 0,
  width: '100%'
})

const GraphqlContainer = () => {
  const graphiql = useRef<GraphiQL>(null)
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

  return (
    <GQL>
      <GraphiQL fetcher={fetcher} ref={graphiql} tabs>
        <GraphiQL.Logo>
          <img crossOrigin='' alt='Parabol' src={logoMarkPrimary} />
        </GraphiQL.Logo>
        <GraphiQL.Toolbar>
          <GraphiQL.ToolbarButton
            onClick={() => graphiql.current!.ref?.props.prettify()}
            title='Prettify Query (Shift-Ctrl-P)'
            label='Prettify'
          />
          <GraphiQL.ToolbarButton
            onClick={() => graphiql.current!.ref?.props.historyContext?.toggle()}
            title='Show History'
            label='History'
          />
        </GraphiQL.Toolbar>
      </GraphiQL>
    </GQL>
  )
}

export default GraphqlContainer
