// export default function makeGradient(fromColor, toColor) {
//   const backgroundImage = `linear-gradient(to right, ${fromColor} 0, ${toColor} 100%)`;
//   return backgroundImage;
// }

const makeGradient = (fromColor: string, toColor: string): string => (
  `linear-gradient(to right, ${fromColor} 0, ${toColor} 100%)`
);

export default makeGradient;
