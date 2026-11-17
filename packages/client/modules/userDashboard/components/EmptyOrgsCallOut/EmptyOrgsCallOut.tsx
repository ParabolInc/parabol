import {useNavigate} from 'react-router'
import Panel from '../../../../components/Panel/Panel'
import {Button} from '../../../../ui/Button/Button'

const EmptyOrgsCallOut = () => {
  const navigate = useNavigate()
  const gotoNewTeam = () => {
    navigate('/newteam')
  }

  const isSingleOrg = window.__ACTION__.IS_SINGLE_ORG
  return (
    <Panel>
      <div className='p-8 text-center'>
        <h2 className='m-0 mb-4 text-[20px] leading-[30px]'>
          {"You aren't in any organizations!"}
        </h2>
        {!isSingleOrg && (
          <>
            <p className='m-0 mb-6 text-[14px] leading-[21px]'>
              {'You can create a new organization'}
              <br />
              {'and manage your own teams and tasks.'}
            </p>
            <Button variant='primary' className='mx-auto my-0' onClick={gotoNewTeam} size='md'>
              {'Start a New Organization'}
            </Button>
          </>
        )}
      </div>
    </Panel>
  )
}

export default EmptyOrgsCallOut
