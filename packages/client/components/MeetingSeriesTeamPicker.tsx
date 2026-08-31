import {Link} from 'react-router'

interface Props {
  seriesTitle: string
  meetings: readonly {id: string; teamName: string}[]
}

const MeetingSeriesTeamPicker = (props: Props) => {
  const {seriesTitle, meetings} = props
  return (
    <div className='mx-auto mt-8 max-w-xl rounded-lg bg-surface-card p-6 shadow-md'>
      <h1 className='m-0 mb-2 font-semibold text-fg-primary text-xl'>{seriesTitle}</h1>
      <p className='m-0 mb-4 text-fg-secondary text-sm'>
        This meeting is running for more than one of your teams. Pick the one you want to join.
      </p>
      <ul className='m-0 flex list-none flex-col gap-2 p-0'>
        {meetings.map(({id, teamName}) => (
          <li key={id}>
            <Link
              to={`/meet/${id}`}
              replace
              className='block rounded-md border border-hairline border-solid px-4 py-3 font-semibold text-fg-primary no-underline hover:bg-surface-hover'
            >
              {teamName}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default MeetingSeriesTeamPicker
