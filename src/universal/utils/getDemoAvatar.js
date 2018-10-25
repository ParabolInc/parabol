const path = '/static/images/avatars/demo/'
const avatars = [
  {
    name: 'Designer Dani',
    picture: `${path}01.png`
  },
  {
    name: 'Legal Leo',
    picture: `${path}02.png`
  },
  {
    name: 'Designer Diane',
    picture: `${path}03.png`
  },
  {
    name: 'Warehouse Will',
    picture: `${path}04.png`
  },
  {
    name: 'Researcher Rumi',
    picture: `${path}05.png`
  },
  {
    name: 'Engineering Ellie',
    picture: `${path}06.png`
  },
  {
    name: 'Business Dev Bud',
    picture: `${path}07.png`
  },
  {
    name: 'HR Harry',
    picture: `${path}08.png`
  },
  {
    name: 'Product Lead Paula',
    picture: `${path}09.png`
  },
  {
    name: 'QA Cody',
    picture: `${path}10.png`
  },
  {
    name: 'Customer Support Carly',
    picture: `${path}11.png`
  },
  {
    name: 'Data Scientist Don',
    picture: `${path}12.png`
  },
  {
    name: 'Zen SME Zeb',
    picture: `${path}13.png`
  },
  {
    name: 'HR Hank',
    picture: `${path}14.png`
  },
  {
    name: 'Legal Liam',
    picture: `${path}15.png`
  },
  {
    name: 'Product Manager Polly',
    picture: `${path}16.png`
  },
  {
    name: 'HR Hanna',
    picture: `${path}17.png`
  },
  {
    name: 'Sales Sally',
    picture: `${path}18.png`
  },
  {
    name: 'Business Dev Brianna',
    picture: `${path}19.png`
  },
  {
    name: 'Programmer Petra',
    picture: `${path}20.png`
  },
  {
    name: 'Intern Isabel',
    picture: `${path}21.png`
  },
  {
    name: 'Operations Oscar',
    picture: `${path}22.png`
  },
  {
    name: 'Developer Darryl',
    picture: `${path}23.png`
  },
  {
    name: 'Customer Support Cali',
    picture: `${path}24.png`
  },
  {
    name: 'Manager Mike',
    picture: `${path}25.png`
  },
  {
    name: 'Researcher Ralph',
    picture: `${path}26.png`
  },
  {
    name: 'Programmer Polly',
    picture: `${path}27.png`
  },
  {
    name: 'Researcher Randy',
    picture: `${path}28.png`
  },
  {
    name: 'QA Kara',
    picture: `${path}29.png`
  },
  {
    name: 'HR Heidi',
    picture: `${path}30.png`
  },
  {
    name: 'Customer Support Cary',
    picture: `${path}31.png`
  },
  {
    name: 'Manager Miguel',
    picture: `${path}32.png`
  },
  {
    name: 'Logistics Leonard',
    picture: `${path}33.png`
  },
  {
    name: 'QA Kyle',
    picture: `${path}34.png`
  },
  {
    name: 'Custom Support Carl',
    picture: `${path}35.png`
  },
  {
    name: 'Warehouse Wally',
    picture: `${path}36.png`
  },
  {
    name: 'Manager Molly',
    picture: `${path}37.png`
  },
  {
    name: 'Developer Dana',
    picture: `${path}38.png`
  },
  {
    name: 'Research Rudy',
    picture: `${path}39.png`
  },
  {
    name: 'Art Director Al',
    picture: `${path}40.png`
  },
  {
    name: 'Finance Fred',
    picture: `${path}41.png`
  },
  {
    name: 'Business Dev Betty',
    picture: `${path}42.png`
  },
  {
    name: 'Sales Sam',
    picture: `${path}43.png`
  },
  {
    name: 'Product Tester Ted',
    picture: `${path}44.png`
  },
  {
    name: 'Manager Mary',
    picture: `${path}45.png`
  },
  {
    name: 'Technical Advisor Terri',
    picture: `${path}46.png`
  },
  {
    name: 'QA Tester Tito',
    picture: `${path}47.png`
  },
  {
    name: 'Designer Dolly',
    picture: `${path}48.png`
  }
]

export const getDemoAvatar = (seed = '') => {
  const date = Date.now()
  const idx = (seed + date) % avatars.length
  return avatars[idx]
}
