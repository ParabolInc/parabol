/*
 * An interrupting chicken is when the facilitator moves forward while another client is still typing.
 * This causes the user to progress as well, causing them to lose their progress on what they were typing.
 */
import {AGENDA_ITEMS, DISCUSS} from './constants'

const interruptingChickenPhases = new Set([AGENDA_ITEMS, DISCUSS])

const isInterruptingChickenPhase = (phaseType) => {
  return interruptingChickenPhases.has(phaseType)
}

export default isInterruptingChickenPhase
