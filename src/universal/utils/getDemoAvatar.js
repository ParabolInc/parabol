const path = '/static/images/avatars/demo/'
const avatars = [
  {
    preferredName: 'Designer Dani',
    email: 'dani@example.co',
    picture: `${path}01.png`
  },
  {
    preferredName: 'Legal Leo',
    email: 'leo@example.co',
    picture: `${path}02.png`
  },
  {
    preferredName: 'Designer Diane',
    email: 'diane@example.co',
    picture: `${path}03.png`
  },
  {
    preferredName: 'Warehouse Will',
    email: 'will@example.co',
    picture: `${path}04.png`
  },
  {
    preferredName: 'Researcher Rumi',
    email: 'rumi@example.co',
    picture: `${path}05.png`
  },
  {
    preferredName: 'Engineering Ellie',
    email: 'ellie@example.co',
    picture: `${path}06.png`
  },
  {
    preferredName: 'Business Dev Bud',
    email: 'bud@example.co',
    picture: `${path}07.png`
  },
  {
    preferredName: 'HR Harry',
    email: 'harry@example.co',
    picture: `${path}08.png`
  },
  {
    preferredName: 'Product Lead Paula',
    email: 'paula@example.co',
    picture: `${path}09.png`
  },
  {
    preferredName: 'QA Cody',
    email: 'cody@example.co',
    picture: `${path}10.png`
  },
  {
    preferredName: 'Customer Support Carly',
    email: 'carly@example.co',
    picture: `${path}11.png`
  },
  {
    preferredName: 'Data Scientist Don',
    email: 'don@example.co',
    picture: `${path}12.png`
  },
  {
    preferredName: 'Zen SME Zeb',
    email: 'zeb@example.co',
    picture: `${path}13.png`
  },
  {
    preferredName: 'HR Hank',
    email: 'hank@example.co',
    picture: `${path}14.png`
  },
  {
    preferredName: 'Legal Liam',
    email: 'liam@example.co',
    picture: `${path}15.png`
  },
  {
    preferredName: 'Product Manager Polly',
    email: 'polly@example.co',
    picture: `${path}16.png`
  },
  {
    preferredName: 'HR Hanna',
    email: 'hanna@example.co',
    picture: `${path}17.png`
  },
  {
    preferredName: 'Sales Sally',
    email: 'sally@example.co',
    picture: `${path}18.png`
  },
  {
    preferredName: 'Business Dev Brianna',
    email: 'brianna@example.co',
    picture: `${path}19.png`
  },
  {
    preferredName: 'Programmer Petra',
    email: 'petra@example.co',
    picture: `${path}20.png`
  },
  {
    preferredName: 'Intern Isabel',
    email: 'isabel@example.co',
    picture: `${path}21.png`
  },
  {
    preferredName: 'Operations Oscar',
    email: 'oscar@example.co',
    picture: `${path}22.png`
  },
  {
    preferredName: 'Developer Darryl',
    email: 'darryl@example.co',
    picture: `${path}23.png`
  },
  {
    preferredName: 'Customer Support Cali',
    email: 'cali@example.co',
    picture: `${path}24.png`
  },
  {
    preferredName: 'Manager Mike',
    email: 'mike@example.co',
    picture: `${path}25.png`
  },
  {
    preferredName: 'Researcher Ralph',
    email: 'ralph@example.co',
    picture: `${path}26.png`
  },
  {
    preferredName: 'Programmer Polly',
    email: 'polly@example.co',
    picture: `${path}27.png`
  },
  {
    preferredName: 'Researcher Randy',
    email: 'randy@example.co',
    picture: `${path}28.png`
  },
  {
    preferredName: 'QA Kara',
    email: 'kara@example.co',
    picture: `${path}29.png`
  },
  {
    preferredName: 'HR Heidi',
    email: 'heidi@example.co',
    picture: `${path}30.png`
  },
  {
    preferredName: 'Customer Support Cary',
    email: 'cary@example.co',
    picture: `${path}31.png`
  },
  {
    preferredName: 'Manager Miguel',
    email: 'miguel@example.co',
    picture: `${path}32.png`
  },
  {
    preferredName: 'Logistics Leonard',
    email: 'leonard@example.co',
    picture: `${path}33.png`
  },
  {
    preferredName: 'QA Kyle',
    email: 'kyle@example.co',
    picture: `${path}34.png`
  },
  {
    preferredName: 'Custom Support Carl',
    email: 'carl@example.co',
    picture: `${path}35.png`
  },
  {
    preferredName: 'Warehouse Wally',
    email: 'wally@example.co',
    picture: `${path}36.png`
  },
  {
    preferredName: 'Manager Molly',
    email: 'molly@example.co',
    picture: `${path}37.png`
  },
  {
    preferredName: 'Developer Dana',
    email: 'dana@example.co',
    picture: `${path}38.png`
  },
  {
    preferredName: 'Research Rudy',
    email: 'rudy@example.co',
    picture: `${path}39.png`
  },
  {
    preferredName: 'Art Director Al',
    email: 'al@example.co',
    picture: `${path}40.png`
  },
  {
    preferredName: 'Finance Fred',
    email: 'fred@example.co',
    picture: `${path}41.png`
  },
  {
    preferredName: 'Business Dev Betty',
    email: 'betty@example.co',
    picture: `${path}42.png`
  },
  {
    preferredName: 'Sales Sam',
    email: 'sam@example.co',
    picture: `${path}43.png`
  },
  {
    preferredName: 'Product Tester Ted',
    email: 'ted@example.co',
    picture: `${path}44.png`
  },
  {
    preferredName: 'Manager Mary',
    email: 'mary@example.co',
    picture: `${path}45.png`
  },
  {
    preferredName: 'Technical Advisor Terri',
    email: 'terri@example.co',
    picture: `${path}46.png`
  },
  {
    preferredName: 'QA Tester Tito',
    email: 'tito@example.co',
    picture: `${path}47.png`
  },
  {
    preferredName: 'Designer Dolly',
    email: 'dolly@example.co',
    picture: `${path}48.png`
  }
]

export const getDemoAvatar = (seed = '') => {
  const date = Date.now()
  const idx = (seed + date) % avatars.length
  return avatars[idx]
}
