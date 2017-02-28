export default async function expectAsyncToThrow(promise) {
  try {
    await promise;
  } catch (e) {
    expect(() => { throw e; }).toThrowErrorMatchingSnapshot();
  }
};
