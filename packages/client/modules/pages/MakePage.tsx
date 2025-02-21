import {useEffect, useState} from 'react'
import {Redirect} from 'react-router'
import {useCreatePageMutation} from '../../mutations/useCreatePageMutation'

export const MakePage = () => {
  const [pageId, setPageId] = useState<number>()
  const [execute] = useCreatePageMutation()
  useEffect(() => {
    execute({
      variables: {},
      onCompleted: (response) => {
        const {createPage} = response
        const {page} = createPage
        const {id} = page
        const [_, pageId] = id.split(':')
        setPageId(Number(pageId))
      }
    })
  }, [])
  if (pageId) {
    return <Redirect to={`/pages/${pageId}`} />
  }
  return <div>Creating page...</div>
}

export default MakePage
