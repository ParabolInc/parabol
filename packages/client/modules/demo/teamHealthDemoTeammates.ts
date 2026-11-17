import {PALETTE} from '../../styles/paletteV3'
import getInitialsAvatar from './getInitialsAvatar'
import {TeamHealthDemo} from './teamHealthDemoIds'

export interface DemoTeammate {
  id: string
  preferredName: string
  email: string
  picture: string
}

const createTeammate = (id: string, preferredName: string, color: string): DemoTeammate => ({
  id,
  preferredName,
  email: `${preferredName.split(' ')[0]!.toLowerCase()}@example.com`,
  picture: getInitialsAvatar(preferredName, color)
})

export const demoViewer = createTeammate(TeamHealthDemo.VIEWER_ID, 'You', PALETTE.SKY_600)
export const demoFacilitator = createTeammate(
  'teamHealthDemoFacilitatorId',
  'Priya Raman',
  PALETTE.GRAPE_600
)
const noor = createTeammate('teamHealthDemoNoorId', 'Noor Haddad', PALETTE.SLATE_700)
const tomas = createTeammate('teamHealthDemoTomasId', 'Tomás Oliveira', PALETTE.TOMATO_700)
const ingrid = createTeammate('teamHealthDemoIngridId', 'Ingrid Falk', PALETTE.GOLD_700)
const kwame = createTeammate('teamHealthDemoKwameId', 'Kwame Boateng', PALETTE.TERRA_500)

export const demoTeammateLookup = {
  viewer: demoViewer,
  priya: demoFacilitator,
  noor,
  tomas,
  ingrid,
  kwame
}

export type DemoTeammateKey = keyof typeof demoTeammateLookup

export const demoTeammates: DemoTeammate[] = Object.values(demoTeammateLookup)
