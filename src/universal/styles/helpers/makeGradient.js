const makeGradient = (fromColor: string, toColor: string): string =>
  `linear-gradient(to right, ${fromColor} 0, ${toColor} 100%)`;

export default makeGradient;
