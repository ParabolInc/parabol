import {LOBBY, SUMMARY} from 'universal/utils/constants';

export default function makePushURL(teamId, phase = LOBBY, phaseItem) {
  const base = `/meeting/${teamId}/${phase}`;
  return (phase === LOBBY || phase === SUMMARY) ? base : `${base}/${phaseItem}`;
}
