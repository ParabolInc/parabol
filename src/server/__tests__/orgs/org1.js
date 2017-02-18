import shortid from 'shortid';

export const ORG1_BILLING_LEADER = {
  id: 'avajs|steveRogers',
  auth0UserInfo: {
    email: 'steve.rogers@avengers.org',
    email_verified: false,
    name: 'Steve Rogers',
    nickname: 'Captain America',
    picture: null,
    user_id: 'avajs|steveRogers',
    created_at: '2017-02-14T00:00:00Z',
    updated_at: '2017-02-14T00:00:00Z',
  }
};

export const ORG1_OTHER_TEAM_MEMBERS = [
  {
    id: 'avajs|jonas',
    auth0UserInfo: {
      email: 'vision@avengers.org',
      email_verified: false,
      name: 'Jonas',
      nickname: 'Vision',
      picture: null,
      user_id: 'avajs|jonas',
      created_at: '2017-02-14T00:00:00Z',
      updated_at: '2017-02-14T00:00:00Z',
    }
  },
  {
    id: 'avajs|jamesRhodes',
    auth0UserInfo: {
      email: 'james.rhodes@avengers.org',
      email_verified: false,
      name: 'James Rhodes',
      nickname: 'War Machine',
      picture: null,
      user_id: 'avajs|jamesRhodes',
      created_at: '2017-02-14T00:00:00Z',
      updated_at: '2017-02-14T00:00:00Z',
    }
  },
  {
    id: 'avajs|tonyStark',
    auth0UserInfo: {
      email: 'tony.stark@avengers.org',
      email_verified: false,
      name: 'Tony Stark',
      nickname: 'War Machine',
      picture: null,
      user_id: 'avajs|tonyStark',
      created_at: '2017-02-14T00:00:00Z',
      updated_at: '2017-02-14T00:00:00Z',
    }
  },
  {
    id: 'avajs|bruceBanner',
    auth0UserInfo: {
      email: 'bruce.banner@avengers.org',
      email_verified: false,
      name: 'Bruce Banner',
      nickname: 'Hulk',
      picture: null,
      user_id: 'avajs|bruceBanner',
      created_at: '2017-02-14T00:00:00Z',
      updated_at: '2017-02-14T00:00:00Z',
    }
  },
  {
    id: 'avajs|natashaRomanova',
    auth0UserInfo: {
      email: 'natasha.romanova@avengers.org',
      email_verified: false,
      name: 'Natasha Romanova',
      nickname: 'Black Widow',
      picture: null,
      user_id: 'avajs|natashaRomanova',
      created_at: '2017-02-14T00:00:00Z',
      updated_at: '2017-02-14T00:00:00Z',
    }
  },
  {
    id: 'avajs|kyleRichmond',
    auth0UserInfo: {
      email: 'kyle.richmond@avengers.org',
      email_verified: false,
      name: 'Kyle Richmond',
      nickname: 'Nighthawk',
      picture: null,
      user_id: 'avajs|kyleRichmond',
      created_at: '2017-02-14T00:00:00Z',
      updated_at: '2017-02-14T00:00:00Z',
    }
  },
  {
    id: 'avajs|thorOdinson',
    auth0UserInfo: {
      email: 'thor@avengers.org',
      email_verified: false,
      name: 'Thor Odinson',
      nickname: 'Thor',
      picture: null,
      user_id: 'avajs|thorOdinson',
      created_at: '2017-02-14T00:00:00Z',
      updated_at: '2017-02-14T00:00:00Z',
    }
  }
];

export const ORG1_ALL_TEAM_MEMBERS = [
  ORG1_BILLING_LEADER, ...ORG1_OTHER_TEAM_MEMBERS
];

export const ORG1_TEAM = {
  id: shortid.generate(),
  name: 'The Avengers'
};
