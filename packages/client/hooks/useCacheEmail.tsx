// Segment analytics needs an email.
// The email is cached on a successful login
// But users only have to login if their credentials expires
// In that case, we need to fetch the email
// In the future, when every user has their email cached, this hook can go away

import graphql from 'babel-plugin-relay/macro'
import {useEffect} from 'react'
import {fetchQuery} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {LocalStorageKey} from '~/types/constEnums'
import {useCacheEmailQuery} from '~/__generated__/useCacheEmailQuery.graphql'

const query = graphql`
  query useCacheEmailQuery {
    viewer {
      email
    }
  }
`

const useCacheEmail = () => {
  const atmosphere = useAtmosphere()
  useEffect(() => {
    const email = window.localStorage.getItem(LocalStorageKey.EMAIL)
    if (email) return
    const cacheEmail = async () => {
      const res = await fetchQuery<useCacheEmailQuery>(atmosphere, query, {})
      const nextEmail = res?.viewer?.email
      if (!nextEmail) return
      window.localStorage.setItem(LocalStorageKey.EMAIL, nextEmail)
    }
    cacheEmail().catch()
  }, [])
}
export default useCacheEmail
