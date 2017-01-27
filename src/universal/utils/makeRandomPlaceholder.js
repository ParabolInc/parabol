const preferredNames = [
  'Albert Einsten',
  'Harry Potter',
  'Bingo Bronson',
  'Benjamin Franklin',
  'Nikola Tesla',
  'Bilbo Baggins',
  'Optimus Prime'
];

const getRandomValue = (arr) => arr[Math.floor(Math.random() * arr.length)];

const themes = [
  {
    orgName: 'The Tolkein Corp',
    preferredName: 'Frodo Baggins',
    teamName: 'The Fellowship of the Ring',
    email: 'frodo@lotr.io',
    emailMulti: 'frodo@lotr.io, gandalf@lotr.io, strider@lotr.io, legolas@lotr.io, gimli@lotr.io'
  },
  {
    orgName: 'Warner Bros',
    preferredName: 'Bugs Bunny',
    teamName: 'Looney Tunes',
    email: 'b.bunney@acme.co',
    emailMulti: 'b.bunny@acme.co, d.duck@acme.co, m.martian@acme.co, t.bird@acme.co, e.fudd@acme.co'
  },
  {
    orgName: 'Splinter, Inc.',
    preferredName: 'Michelangelo',
    teamName: 'Teenage Mutant Ninja Turtles',
    email: 'mike@tmnt.co',
    emailMulti: 'mike@tmnt.co, don@tmnt.co, leo@tmnt.co, ralph@tmnt.co'
  },
  {
    orgName: 'Hogwarts',
    preferredName: 'Harry Potter',
    teamName: 'Order of the Phoenix',
    email: 'harry@hogwarts.edu',
    emailMulti: 'harry@hogwarts.edu, hermione@hogwarts.edu, ron@hogwarts.edu'
  },
  {
    orgName: 'Hard Days Night, LLC',
    preferredName: 'John Lennon',
    teamName: 'The Beatles',
    email: 'john@splhcb.co',
    emailMulti: 'john@splhcb.co, paul@splhcb.co, ringo@splhcb.co, george@splhcb.co'
  },
  {
    orgName: 'The Guapo Group, Ltd.',
    preferredName: 'Lucky Day',
    teamName: 'The Three Amigos',
    email: 'lucky@ami.go',
    emailMulti: 'lucky@ami.go, dusty@ami.go, ned@ami.go'
  }
];

export const randomPreferredName = getRandomValue(preferredNames);
export const randomPlaceholderTheme = getRandomValue(themes);
