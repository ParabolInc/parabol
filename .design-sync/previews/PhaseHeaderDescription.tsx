import {PhaseHeaderDescription} from 'parabol-client'

// NOTE: PhaseHeaderDescription is display:none below the 1280px meetingTopBar
// media query (styles/meeting.ts). At the 900px grading viewport it is hidden.
export const Default = () => (
  <PhaseHeaderDescription>
    Reflect on the last sprint — what should we start, stop, and continue?
  </PhaseHeaderDescription>
)

export const Group = () => (
  <PhaseHeaderDescription>Drag cards together to group related reflections</PhaseHeaderDescription>
)
