const primitiveArrayEqual = (a1, a2) => {
  let i = a1.length;
  if (i !== a2.length) return false;
  while (i--) {
    if (a1[i] !== a2[i]) return false;
  }
  return true;
};

export default primitiveArrayEqual;
