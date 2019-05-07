import React from 'react'

import {AGENDA_ITEMS, FIRST_CALL, LAST_CALL} from 'universal/utils/constants'

const makeLink = (link, copy) => {
  const href = `https://www.parabol.co/getting-started-guide/${link}`
  return (
    <a href={href} rel='noopener noreferrer' target='blank' title={copy}>
      {copy}
    </a>
  )
}

const teamAgendaHelpLink = makeLink('action-meetings-101#team-agenda', 'Learn More')

const firstCallHelpContent = (
  <div>
    <p>{'Time to add any remaining Agenda topics for discussion!'}</p>
    <p>
      {'You can contribute to the Agenda any time: before a meeting begins, or during a meeting.'}
    </p>
    <p>{'For those that like keyboard shortcuts, you can simply press the “+” key to add.'}</p>
    <p>{teamAgendaHelpLink}</p>
  </div>
)

const agendaTopicHelpContent = (
  <div>
    <p>
      {
        'The goal of this phase is to identify next steps and capture them as task cards assigned to an owner.'
      }
    </p>
    <p>
      {
        'Sometimes the next task is to schedule a time to discuss a topic more in depth at a later time.'
      }
    </p>
    <p>{teamAgendaHelpLink}</p>
  </div>
)

const lastCallHelpContent = (
  <div>
    <p>{'Here’s a chance to add any last topics for discussion.'}</p>
    <p>{'A Meeting Summary will be generated once the Facilitator ends the meeting.'}</p>
    <p>{teamAgendaHelpLink}</p>
  </div>
)

export const actionPhaseHelpLookup = {
  [FIRST_CALL]: firstCallHelpContent,
  [AGENDA_ITEMS]: agendaTopicHelpContent,
  [LAST_CALL]: lastCallHelpContent
}
