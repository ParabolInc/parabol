import {useEffect, useState} from 'react'
import {Navigate} from 'react-router-dom'
import {useCreatePageMutation} from '../../mutations/useCreatePageMutation'

export const MakePage = () => {
  const [pageCode, setPageCode] = useState<number>()
  const [execute] = useCreatePageMutation()
  useEffect(() => {
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
    return <Navigate to={`/pages/${pageCode}`} replace />
  }
  return <div>Creating page...</div>
}

export default MakePage
