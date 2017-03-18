import React from 'react';
// import appTheme from 'universal/styles/theme/appTheme';

const rallyList = [
  {
    phrase: 'Carpe Diem',
    link: 'https://youtu.be/veYR3ZC9wMQ'
  },
  {
    phrase: 'Keep Moving Forward',
    link: 'https://youtu.be/5HksV7ZFuhM'
  },
  {
    phrase: 'Discombobulate',
    link: 'https://youtu.be/UxfauhR7niY'
  },
  {
    phrase: 'Be Happy',
    link: 'https://youtu.be/d-diB65scQU'
  },
  {
    phrase: 'Bring Your Friends',
    link: 'https://youtu.be/hTWKbfoikeg'
  },
  {
    phrase: 'The Best Times',
    link: 'https://youtu.be/2H5uWRjFsGc'
  },
  {
    phrase: 'Can’t Touch This',
    link: 'https://youtu.be/ck6i3HtktaY'
  },
  {
    phrase: 'C’mere! Get Free',
    link: 'https://youtu.be/asOvnGHwtDU'
  },
  {
    phrase: 'Don’t Stop Believin’',
    link: 'https://youtu.be/Pw3GTTYgEV8'
  },
  {
    phrase: 'Gimme Some New',
    link: 'https://youtu.be/FPoKiGQzbSQ'
  },
  {
    phrase: 'Go! Go! Go! Go',
    link: 'https://youtu.be/8PaoLy7PHwk'
  },
  {
    phrase: 'Hammertime',
    link: 'https://youtu.be/VrqdbBZqT7U'
  },
  {
    phrase: 'Harder, Better, Faster',
    link: 'https://youtu.be/gAjR4_CbPpQ'
  },
  {
    phrase: 'It’s A Lovely Day',
    link: 'https://youtu.be/sYi7uEvEEmk'
  },
  {
    phrase: 'Kill It With Kisses',
    link: 'https://youtu.be/iWOyfLBYtuU'
  },
  {
    phrase: 'Now or Never',
    link: 'https://youtu.be/vx2u5uUu3DE'
  },
  {
    phrase: 'On With The Show',
    link: 'https://youtu.be/4ADh8Fs3YdU'
  },
  {
    phrase: 'Rawr, Tiger',
    link: 'https://youtu.be/btPJPFnesV4'
  },
  {
    phrase: 'Right Here, Right Now',
    link: 'https://youtu.be/F7jSp2xmmEE'
  },
  {
    phrase: 'Ring That Bell',
    link: 'https://youtu.be/OaBfFSOJ9H8'
  },
  {
    phrase: 'Run This Mother',
    link: 'https://youtu.be/VBmMU_iwe6U'
  },
  {
    phrase: 'Serve It',
    link: 'https://youtu.be/0J2QdDbelmY'
  },
  {
    phrase: 'Sharpness Without Effort',
    link: 'https://youtu.be/hpeTLTj2tww'
  },
  {
    phrase: 'Stronger, Richer, Smarter',
    link: 'https://youtu.be/Wmc8bQoL-J0'
  },
  {
    phrase: 'Wax On',
    link: 'https://youtu.be/Wd7PvbJece8'
  },
  {
    phrase: 'The Whole Team Here',
    link: 'https://youtu.be/RubBzkZzpUA'
  },
  {
    phrase: 'The World Is Yours',
    link: 'https://youtu.be/e5PnuIRnJW8'
  },
  {
    phrase: 'You Are A Champion',
    link: 'https://youtu.be/04854XqcfCY'
  },
  {
    phrase: 'You Are Beautiful',
    link: 'https://youtu.be/eAfyFTzZDMM'
  },
  {
    phrase: 'You Bossy',
    link: 'https://youtu.be/SSgp-IIgr4I'
  },
  {
    phrase: 'You Came To Win',
    link: 'https://youtu.be/KZaz7OqyTHQ'
  },
  {
    phrase: 'You’re The Smart One',
    link: 'https://youtu.be/bKQYK7PYQpQ'
  },
  {
    phrase: 'You’ve Got A Bright Future',
    link: 'https://youtu.be/kZGvnI37mxk'
  },
  {
    phrase: 'Go Pro',
    link: 'https://youtu.be/9mSMTXYj7pQ'
  },
  {
    phrase: 'An Invocation for Beginnings',
    link: 'https://youtu.be/RYlCVwxoL_g'
  }
];

const rally = rallyList[Math.floor(Math.random() * rallyList.length)];

const rallyPhrase = `${rally.phrase}!`;

const style = {
  // color: appTheme.palette.dark70l
  color: 'inherit'
};

export default function getRallyLink(hasStyle = true) {
  return (
    <a
      href={rally.link}
      rel="noopener noreferrer"
      style={hasStyle ? style : null}
      target="_blank"
      title={rallyPhrase}
    >
      {rally.phrase}
    </a>
  );
}
