import shortid from 'shortid';
import testOrgMember from './testOrgMember';

export const ORG1_BILLING_LEADER = testOrgMember({
  id: 'avajs|steveRogers',
  email: 'steve.rogers@avengers.org',
  name: 'Steve Rogers',
  nickname: 'Captain America'
});

export const ORG1_OTHER_TEAM_MEMBERS = [
  testOrgMember({
    id: 'avajs|jonas',
    email: 'vision@avengers.org',
    name: 'Jonas',
    nickname: 'Vision'
  }),
  testOrgMember({
    id: 'avajs|jamesRhodes',
    email: 'james.rhodes@avengers.org',
    name: 'James Rhodes',
    nickname: 'War Machine'
  }),
  testOrgMember({
    id: 'avajs|tonyStark',
    email: 'tony.stark@avengers.org',
    name: 'Tony Stark',
    nickname: 'War Machine'
  }),
  testOrgMember({
    id: 'avajs|bruceBanner',
    email: 'bruce.banner@avengers.org',
    name: 'Bruce Banner',
    nickname: 'Hulk',
  }),
  testOrgMember({
    id: 'avajs|natashaRomanova',
    email: 'natasha.romanova@avengers.org',
    name: 'Natasha Romanova',
    nickname: 'Black Widow'
  }),
  testOrgMember({
    id: 'avajs|kyleRichmond',
    email: 'kyle.richmond@avengers.org',
    name: 'Kyle Richmond',
    nickname: 'Nighthawk',
  }),
  testOrgMember({
    id: 'avajs|thorOdinson',
    email: 'thor@avengers.org',
    name: 'Thor Odinson',
    nickname: 'Thor',
  })
];

export const ORG1_ALL_TEAM_MEMBERS = [
  ORG1_BILLING_LEADER, ...ORG1_OTHER_TEAM_MEMBERS
];

export const ORG1_TEAM = {
  id: shortid.generate(),
  name: 'The Avengers'
};
