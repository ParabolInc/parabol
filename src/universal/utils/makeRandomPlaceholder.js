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

const multiEmails = [
  'b.bunny@acme.co, d.duck@acme.co, e.fudd@acme.co',
  'mike@tmnt.co, don@tmnt.co, leo@tmnt.co, ralph@tmnt.co',
  'harry@hogwarts.edu, hermione@hogwarts.edu, ron@hogwarts.edu'
];

const getRandomValue = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const randomPreferredName = getRandomValue(preferredNames);
export const randomTeamName = getRandomValue(teamNames);
export const randomMultiEmails = getRandomValue(multiEmails);
