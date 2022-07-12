import styled from '@emotion/styled'
import {Fetcher} from '@graphiql/toolkit'
import GraphiQL, {GraphiQLProps} from 'graphiql'
import {ToolbarSelect, ToolbarSelectOption} from 'graphiql/dist/components/ToolbarSelect'
import 'graphiql/graphiql.css'
import React, {useRef, useState} from 'react'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useAuthRoute from '../../../../hooks/useAuthRoute'
import logoMarkPrimary from '../../../../styles/theme/images/brand/lockup_color_mark_dark_type.svg'
import {AuthTokenRole, LocalStorageKey} from '../../../../types/constEnums'

const GQL = styled('div')({
  margin: 0,
  height: '100vh',
  minHeight: '100vh',
  padding: 0,
  width: '100%'
})

type SchemaType = 'Public' | 'Private'

const safeParseJSON = (str: string | null) => {
  if (!str) return null
  try {
    return JSON.parse(str)
  } catch {
    return null
  }
}

const persistSchemaForTab = (currentSchema: SchemaType) => {
  // get active tab idx
  const tabStateStr = window.localStorage.getItem('graphiql:tabState')
  if (!tabStateStr) return
  const parsedTabState = safeParseJSON(tabStateStr)
  if (!parsedTabState) return
  const activeTabIdx = parsedTabState?.activeTabIndex ?? null
  if (activeTabIdx === null) return
  // set schema for the given tab
  const tabSchemaLookupStr = window.localStorage.getItem('graphiql:tabSchemaLookup')
  const parsedTabSchemaLookup = safeParseJSON(tabSchemaLookupStr)
  const tabSchemaLookup = Array.isArray(parsedTabSchemaLookup) ? parsedTabSchemaLookup : []
  tabSchemaLookup[activeTabIdx] = currentSchema
  window.localStorage.setItem('graphiql:tabSchemaLookup', JSON.stringify(tabSchemaLookup))
}

const GraphqlContainer = () => {
  const [currentSchema, setCurrentSchema] = useState<SchemaType>(() => {
    return (window.localStorage.getItem(LocalStorageKey.GRAPHIQL_SCHEMA) as SchemaType) || 'Public'
  })
  const introspectionResultRef = useRef({Public: '', Private: ''})
  const graphiql = useRef<GraphiQL>(null)
  const atmosphere = useAtmosphere()
  useAuthRoute({role: AuthTokenRole.SUPER_USER})
  const changeSchema = (value: SchemaType) => () => {
    setCurrentSchema(value)
    window.localStorage.setItem(LocalStorageKey.GRAPHIQL_SCHEMA, value)
    persistSchemaForTab(value)
  }
  const fetcher: Fetcher = async ({query, variables}) => {
    const introspectionResult = introspectionResultRef.current
    const isIntrospectionQuery = query.includes('IntrospectionQuery')
    if (isIntrospectionQuery && introspectionResult[currentSchema]) {
      return introspectionResult[currentSchema]
    }
    const res = await fetch('/intranet-graphql', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-application-authorization': `Bearer ${atmosphere.authToken}`
      },
      body: JSON.stringify({query, variables, isPrivate: currentSchema === 'Private'})
    })
    const resJSON = await res.json()
    if (isIntrospectionQuery) {
      introspectionResult[currentSchema] = resJSON
    }
    return resJSON
  }

  const onTabChange: Exclude<GraphiQLProps['tabs'], boolean | undefined>['onTabChange'] = (tab) => {
    const tabSchemaLookupStr = window.localStorage.getItem('graphiql:tabSchemaLookup')
    const parsedTabSchemaLookup = safeParseJSON(tabSchemaLookupStr)
    const tabSchemaLookup = Array.isArray(parsedTabSchemaLookup) ? parsedTabSchemaLookup : []
    const schemaToUse = tabSchemaLookup[tab.activeTabIndex] || 'Public'
    setCurrentSchema(schemaToUse)
  }

  return (
    <GQL>
      <GraphiQL fetcher={fetcher} ref={graphiql} tabs={{onTabChange}}>
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
          <GraphiQL.Group>
            <span>Schema: </span>
            <ToolbarSelect title='Schema' label='Schema'>
              <ToolbarSelectOption
                label='Public'
                value='Public'
                selected={currentSchema === 'Public'}
                onSelect={changeSchema('Public')}
              />
              <ToolbarSelectOption
                label='Private'
                value='Private'
                selected={currentSchema === 'Private'}
                onSelect={changeSchema('Private')}
              />
            </ToolbarSelect>
          </GraphiQL.Group>
        </GraphiQL.Toolbar>
      </GraphiQL>
    </GQL>
  )
}

export default GraphqlContainer
