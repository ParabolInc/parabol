import {useEffect, useRef, useState} from 'react'
import Redirect from '~/routing/Redirect'
import {useCreatePageMutation} from '../../mutations/useCreatePageMutation'

export const MakePage = () => {
  const [pageCode, setPageCode] = useState<number>()
  const [execute] = useCreatePageMutation()
  const pageRequestedRef = useRef(false)
  useEffect(() => {
    if (pageRequestedRef.current) return
    pageRequestedRef.current = true
    execute({
      variables: {},
      onCompleted: (response) => {
        const {createPage} = response
        const {page} = createPage
        const {id} = page
        const [_, pageCode] = id.split(':')
        setPageCode(Number(pageCode))
      }
    })
  }, [])
  if (pageCode) {
    return <Redirect to='/pages/$pageSlug' params={{pageSlug: String(pageCode)}} replace />
  }
  return <div>Creating page...</div>
}

export default MakePage
