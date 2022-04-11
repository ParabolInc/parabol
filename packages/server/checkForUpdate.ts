// const checkForUpdate = async (fromUpdate) => {
//   console.log('status', module.hot.status())
//   if (module.hot.status() !== "idle") return
//   let updatedModules
//   try {
//     updatedModules = await module.hot.check()
//   } catch (e) {
//     console.log('in catch clause')
//     const status = module.hot.status()
//     if (["abort", "fail"].indexOf(status) >= 0) {
//       console.log('RESTART NEEDED')
//     } else {
//       console.log('OTHER BAD ERROR', e)
//     }
//   }

//   if (!updatedModules) {
//     if (fromUpdate) console.log("info", "[HMR] Update applied.")
//     return
//   }

//   console.log('done checking', module.hot.status(), updatedModules)
//   // time to apply
//   // try {

//   //   await module.hot.apply({ignoreUnaccepted: true, ignoreErrored: true, ignoreDecline: true})
//   // } catch (e) {
//   //   console.log('catching apply')
//   //   const status = module.hot.status()
//   //   if (["abort", "fail"].indexOf(status) >= 0) {
//   //     console.log('2RESTART NEEDED')
//   //   } else {
//   //     console.log('2OTHER BAD ERROR', e)
//   //   }
//   // }

//   // require("webpack/hot/log-apply-result")(updatedModules, updatedModules)
//   // checkForUpdate(true)
// }

// setInterval(checkForUpdate, 1000)
