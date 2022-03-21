import demoAvatar02 from 'static/images/avatars/demo/02.png'
import demoAvatar03 from 'static/images/avatars/demo/03.png'
import demoAvatar04 from 'static/images/avatars/demo/04.png'
import demoAvatar06 from 'static/images/avatars/demo/06.png'
import demoAvatar09 from 'static/images/avatars/demo/09.png'
import demoAvatar14 from 'static/images/avatars/demo/14.png'
import demoAvatar15 from 'static/images/avatars/demo/15.png'
import demoAvatar16 from 'static/images/avatars/demo/16.png'
import demoAvatar17 from 'static/images/avatars/demo/17.png'
import demoAvatar20 from 'static/images/avatars/demo/20.png'
import demoAvatar21 from 'static/images/avatars/demo/21.png'
import demoAvatar22 from 'static/images/avatars/demo/22.png'
import demoAvatar24 from 'static/images/avatars/demo/24.png'
import demoAvatar26 from 'static/images/avatars/demo/26.png'
import demoAvatar29 from 'static/images/avatars/demo/29.png'
import demoAvatar31 from 'static/images/avatars/demo/31.png'
import demoAvatar38 from 'static/images/avatars/demo/38.png'
import demoAvatar39 from 'static/images/avatars/demo/39.png'
import demoAvatar41 from 'static/images/avatars/demo/41.png'
import demoAvatar42 from 'static/images/avatars/demo/42.png'

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
    preferredName: 'PM Paula',
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
    preferredName: 'PM Polly',
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
    preferredName: 'CS Cali',
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
    preferredName: 'CS Cary',
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

const getDemoAvatar = (seed: number) => {
  const date = Date.now()
  const idx = (seed + date) % avatars.length
  return avatars[idx]
}

export default getDemoAvatar
