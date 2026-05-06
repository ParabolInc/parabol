// There's some bug where I can't import .css directly from graphiql. Probably ESM related
import './monkeyPatchMonacoEnvironment'
import './style.css'
import {ToolbarButton} from '@graphiql/react'
import {createGraphiQLFetcher, type FetcherOpts, type FetcherParams} from '@graphiql/toolkit'
import KeyIcon from '@mui/icons-material/Key'
import {GraphiQL} from 'graphiql'
import {useCallback, useEffect, useState} from 'react'
import {Link} from 'react-router'
import useAtmosphere from '~/hooks/useAtmosphere'
import {Dialog} from '~/ui/Dialog/Dialog'
import {DialogActions} from '~/ui/Dialog/DialogActions'
import {DialogContent} from '~/ui/Dialog/DialogContent'
import {DialogTitle} from '~/ui/Dialog/DialogTitle'
import logoMarkPrimary from '../../../../styles/theme/images/brand/lockup_color_mark_dark_type.svg'
import logoMarkDark from '../../../../styles/theme/images/brand/lockup_color_mark_white_type.svg'

const PAT_STORAGE_KEY = 'graphiql:personalAccessToken'

const GraphqlContainer = () => {
  const atmosphere = useAtmosphere()
  const isSuperUser = atmosphere.authObj?.rol === 'su'

  const [accessToken, setAccessToken] = useState<string | null>(() => {
    if (isSuperUser) return null
    return localStorage.getItem(PAT_STORAGE_KEY)
  })
  const [patInput, setPatInput] = useState('')
  const [patSubmitAttempted, setPatSubmitAttempted] = useState(false)
  const [showModal, setShowModal] = useState(!isSuperUser && !accessToken)

  const fetcher = useCallback(
    (() => {
      const baseFetcher = createGraphiQLFetcher({
        url: '/graphql',
        headers: accessToken ? {authorization: `Bearer ${accessToken}`} : undefined
      })
      return (params: FetcherParams, opts?: FetcherOpts) => {
        const isIntrospection =
          params.operationName === 'IntrospectionQuery' ||
          params.query.includes('__schema') ||
          params.query.includes('__type')
        if (isIntrospection && !isSuperUser) {
          return fetch('/graphql/schema.json')
            .then((res) => res.json())
            .then((data) => ({data}))
        }
        return baseFetcher(params, opts)
      }
    })(),
    [accessToken]
  )

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

  const isValidPat = patInput.trim().startsWith('pat_')

  const handleSubmitPat = () => {
    setPatSubmitAttempted(true)
    const token = patInput.trim()
    if (!isValidPat) return
    localStorage.setItem(PAT_STORAGE_KEY, token)
    setAccessToken(token)
    setPatInput('')
    setPatSubmitAttempted(false)
    setShowModal(false)
  }

  const handleOpenChangeToken = () => {
    setPatInput('')
    setPatSubmitAttempted(false)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    if (accessToken) setShowModal(false)
  }

  return (
    <>
      <Dialog isOpen={showModal} onClose={handleCloseModal}>
        <DialogContent noClose={!accessToken} className='max-w-md md:max-w-md'>
          <DialogTitle>
            {accessToken ? 'Change Personal Access Token' : 'Personal Access Token Required'}
          </DialogTitle>
          <p className='mt-3 text-slate-600 text-sm'>
            Enter your personal access token to use GraphiQL
          </p>
          <input
            autoFocus
            type='text'
            value={patInput}
            onChange={(e) => setPatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmitPat()}
            placeholder='pat_...'
            className='mt-4 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500'
          />
          {patSubmitAttempted && !isValidPat && (
            <p className='mt-1 text-red-600 text-xs'>Token must start with pat_</p>
          )}
          <DialogActions>
            {accessToken && (
              <button
                onClick={handleCloseModal}
                className='rounded px-4 py-2 font-medium text-slate-600 text-sm hover:bg-slate-100'
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSubmitPat}
              disabled={!patInput.trim()}
              className='rounded bg-sky-500 px-4 py-2 font-medium text-sm text-white hover:bg-sky-600 disabled:opacity-50'
            >
              Submit
            </button>
          </DialogActions>
        </DialogContent>
      </Dialog>
      <GraphiQL fetcher={fetcher}>
        <GraphiQL.Logo>
          <Link to={'/'}>
            <img crossOrigin='' alt='Parabol' src={logo} className={'flex'} />
          </Link>
        </GraphiQL.Logo>
        {!isSuperUser && (
          <GraphiQL.Toolbar>
            <ToolbarButton label='Change personal access token' onClick={handleOpenChangeToken}>
              <KeyIcon className='graphiql-toolbar-icon' />
            </ToolbarButton>
          </GraphiQL.Toolbar>
        )}
      </GraphiQL>
    </>
  )
}

export default GraphqlContainer
