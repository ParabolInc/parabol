const preferredNames = [
  'Albert Einsten',
  'Harry Potter',
  'Bingo Bronson',
  'Benjamin Franklin',
  'Nikola Tesla',
  'Bilbo Baggins',
  'Optimus Prime'
];

const teamNames = [
  'The Beatles',
  'Looney Tunes',
  'The A-Team',
  'The Lone Rangers',
  'ThunderCats',
  'The Three Amigos',
  'The Mighty Ducks',
  'The Goonies'
];

const getRandomValue = (arr) => arr[Math.floor(Math.random() * arr.length)];

const themes = [
  {
    preferredName: 'Frodo Baggins',
    teamName: 'The Fellowship of the Ring',
    email: 'frodo@lotr.io',
    emailMulti: 'frodo@lotr.io, gandalf@lotr.io, strider@lotr.io, legolas@lotr.io, gimli@lotr.io'
  },
  {
    preferredName: 'Bugs Bunny',
    teamName: 'Looney Tunes',
    email: 'b.bunney@acme.co',
    emailMulti: 'b.bunny@acme.co, d.duck@acme.co, e.fudd@acme.co, t.bird@acme.co, m.martian@acme.co'
  },
  {
    preferredName: 'Michelangelo',
    teamName: 'Teenage Mutant Ninja Turtles',
    email: 'mike@tmnt.co',
    emailMulti: 'mike@tmnt.co, don@tmnt.co, leo@tmnt.co, ralph@tmnt.co'
  },
  {
    preferredName: 'Harry Potter',
    teamName: 'Order of the Phoenix',
    email: 'harry@hogwarts.edu',
    emailMulti: 'harry@hogwarts.edu, hermione@hogwarts.edu, ron@hogwarts.edu'
  }
];

export const randomPreferredName = getRandomValue(preferredNames);
export const randomTeamName = getRandomValue(teamNames);
export const randomPlaceholderTheme = getRandomValue(themes);
