import {useEffect, useState} from 'react'
import {Redirect} from 'react-router'
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
    return <Redirect to={`/pages/${pageCode}`} />
  }
  return <div>Creating page...</div>
}

export default MakePage
