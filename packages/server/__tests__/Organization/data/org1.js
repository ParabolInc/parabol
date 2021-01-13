import shortid from 'shortid'
import testOrgMember from './testOrgMember'

export const ORG1_BILLING_LEADER = testOrgMember({
  id: 'test|steveRogers',
  email: 'steve.rogers@avengers.org',
  name: 'Steve Rogers',
  nickname: 'Captain America'
})

export const ORG1_OTHER_TEAM_MEMBERS = [
  testOrgMember({
    id: 'test|jonas',
    email: 'vision@avengers.org',
    name: 'Jonas',
    nickname: 'Vision'
  }),
  testOrgMember({
    id: 'test|jamesRhodes',
    email: 'james.rhodes@avengers.org',
    name: 'James Rhodes',
    nickname: 'War Machine'
  }),
  testOrgMember({
    id: 'test|tonyStark',
    email: 'tony.stark@avengers.org',
    name: 'Tony Stark',
    nickname: 'War Machine'
  }),
  testOrgMember({
    id: 'test|bruceBanner',
    email: 'bruce.banner@avengers.org',
    name: 'Bruce Banner',
    nickname: 'Hulk'
  }),
  testOrgMember({
    id: 'test|natashaRomanova',
    email: 'natasha.romanova@avengers.org',
    name: 'Natasha Romanova',
    nickname: 'Black Widow'
  }),
  testOrgMember({
    id: 'test|kyleRichmond',
    email: 'kyle.richmond@avengers.org',
    name: 'Kyle Richmond',
    nickname: 'Nighthawk'
  }),
  testOrgMember({
    id: 'test|thorOdinson',
    email: 'thor@avengers.org',
    name: 'Thor Odinson',
    nickname: 'Thor'
  })
]

export const ORG1_ALL_TEAM_MEMBERS = [ORG1_BILLING_LEADER, ...ORG1_OTHER_TEAM_MEMBERS]

export const ORG1_TEAM = {
  id: shortid.generate(),
  name: 'The Avengers'
}
