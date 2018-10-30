const demoAvatar02 = () =>
  import(/* webpackChunkName: 'demoAvatar02' */ '/static/images/avatars/demo/02.png')
const demoAvatar03 = () =>
  import(/* webpackChunkName: 'demoAvatar03' */ '/static/images/avatars/demo/03.png')
const demoAvatar04 = () =>
  import(/* webpackChunkName: 'demoAvatar04' */ '/static/images/avatars/demo/04.png')
const demoAvatar06 = () =>
  import(/* webpackChunkName: 'demoAvatar06' */ '/static/images/avatars/demo/06.png')
const demoAvatar09 = () =>
  import(/* webpackChunkName: 'demoAvatar09' */ '/static/images/avatars/demo/09.png')
const demoAvatar14 = () =>
  import(/* webpackChunkName: 'demoAvatar14' */ '/static/images/avatars/demo/14.png')
const demoAvatar15 = () =>
  import(/* webpackChunkName: 'demoAvatar15' */ '/static/images/avatars/demo/15.png')
const demoAvatar16 = () =>
  import(/* webpackChunkName: 'demoAvatar16' */ '/static/images/avatars/demo/16.png')
const demoAvatar17 = () =>
  import(/* webpackChunkName: 'demoAvatar17' */ '/static/images/avatars/demo/17.png')
const demoAvatar20 = () =>
  import(/* webpackChunkName: 'demoAvatar20' */ '/static/images/avatars/demo/20.png')
const demoAvatar21 = () =>
  import(/* webpackChunkName: 'demoAvatar21' */ '/static/images/avatars/demo/21.png')
const demoAvatar22 = () =>
  import(/* webpackChunkName: 'demoAvatar22' */ '/static/images/avatars/demo/22.png')
const demoAvatar24 = () =>
  import(/* webpackChunkName: 'demoAvatar24' */ '/static/images/avatars/demo/24.png')
const demoAvatar26 = () =>
  import(/* webpackChunkName: 'demoAvatar26' */ '/static/images/avatars/demo/26.png')
const demoAvatar29 = () =>
  import(/* webpackChunkName: 'demoAvatar29' */ '/static/images/avatars/demo/29.png')
const demoAvatar31 = () =>
  import(/* webpackChunkName: 'demoAvatar31' */ '/static/images/avatars/demo/31.png')
const demoAvatar38 = () =>
  import(/* webpackChunkName: 'demoAvatar38' */ '/static/images/avatars/demo/38.png')
const demoAvatar39 = () =>
  import(/* webpackChunkName: 'demoAvatar39' */ '/static/images/avatars/demo/39.png')
const demoAvatar41 = () =>
  import(/* webpackChunkName: 'demoAvatar41' */ '/static/images/avatars/demo/41.png')
const demoAvatar42 = () =>
  import(/* webpackChunkName: 'demoAvatar42' */ '/static/images/avatars/demo/42.png')

const avatars = [
  {
    preferredName: 'Legal Leo',
    email: 'leo@example.co',
    picture: demoAvatar02
  },
  {
    preferredName: 'Designer Dani',
    email: 'dani@example.co',
    picture: demoAvatar03
  },
  {
    preferredName: 'Warehouse Wally',
    email: 'wally@example.co',
    picture: demoAvatar04
  },
  {
    preferredName: 'Engineering Ellie',
    email: 'ellie@example.co',
    picture: demoAvatar06
  },
  {
    preferredName: 'Product Lead Paula',
    email: 'paula@example.co',
    picture: demoAvatar09
  },
  {
    preferredName: 'HR Hank',
    email: 'hank@example.co',
    picture: demoAvatar14
  },
  {
    preferredName: 'Legal Liam',
    email: 'liam@example.co',
    picture: demoAvatar15
  },
  {
    preferredName: 'Product Manager Polly',
    email: 'polly@example.co',
    picture: demoAvatar16
  },
  {
    preferredName: 'HR Hanna',
    email: 'hanna@example.co',
    picture: demoAvatar17
  },
  {
    preferredName: 'Programmer Petra',
    email: 'petra@example.co',
    picture: demoAvatar20
  },
  {
    preferredName: 'Intern Isabel',
    email: 'isabel@example.co',
    picture: demoAvatar21
  },
  {
    preferredName: 'Operations Oscar',
    email: 'oscar@example.co',
    picture: demoAvatar22
  },
  {
    preferredName: 'Customer Support Cali',
    email: 'cali@example.co',
    picture: demoAvatar24
  },
  {
    preferredName: 'Researcher Rumi',
    email: 'rumi@example.co',
    picture: demoAvatar26
  },
  {
    preferredName: 'QA Kara',
    email: 'kara@example.co',
    picture: demoAvatar29
  },
  {
    preferredName: 'Customer Support Cary',
    email: 'cary@example.co',
    picture: demoAvatar31
  },
  {
    preferredName: 'Developer Don',
    email: 'don@example.co',
    picture: demoAvatar38
  },
  {
    preferredName: 'Researcher Rudy',
    email: 'rudy@example.co',
    picture: demoAvatar39
  },
  {
    preferredName: 'Finance Fred',
    email: 'fred@example.co',
    picture: demoAvatar41
  },
  {
    preferredName: 'QA Cody',
    email: 'cody@example.co',
    picture: demoAvatar42
  }
]

export const getDemoAvatar = (seed = '') => {
  const date = Date.now()
  const idx = (seed + date) % avatars.length
  return avatars[idx]
}
