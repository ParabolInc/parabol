## [9.1.5](https://github.com/ParabolInc/parabol/compare/v9.1.4...v9.1.5) (2025-04-15)


### Fixed

* ensure public teams are public for org admins ([#11162](https://github.com/ParabolInc/parabol/issues/11162)) ([2702328](https://github.com/ParabolInc/parabol/commit/270232880ab37e3f42773704d534dd6d0e4372a5))


### Changed

* **.env.example:** separe developer variables from the rest ([c90aa5a](https://github.com/ParabolInc/parabol/commit/c90aa5a9b498716d91e4242421959fab4f913845))

## [9.1.4](https://github.com/ParabolInc/parabol/compare/v9.1.3...v9.1.4) (2025-04-11)


### Fixed

* support poker removing unintegrated items  ([#11183](https://github.com/ParabolInc/parabol/issues/11183)) ([f61dc59](https://github.com/ParabolInc/parabol/commit/f61dc5960b7a21cf99092a598af0cc83451293e1))

## [9.1.3](https://github.com/ParabolInc/parabol/compare/v9.1.2...v9.1.3) (2025-04-11)


### Fixed

* multipart header vuln ([#11181](https://github.com/ParabolInc/parabol/issues/11181)) ([43ada48](https://github.com/ParabolInc/parabol/commit/43ada486b5afebaf39a910253f3dbac7526398a6))
* org admins can delete teams ([#11178](https://github.com/ParabolInc/parabol/issues/11178)) ([9174ed0](https://github.com/ParabolInc/parabol/commit/9174ed03a1eb5463266f5b916bb78d35f14ffaaf))

## [9.1.2](https://github.com/ParabolInc/parabol/compare/v9.1.1...v9.1.2) (2025-04-10)


### Fixed

* bugs from datadog logs updateTask, acceptTeamInvitation ([#11169](https://github.com/ParabolInc/parabol/issues/11169)) ([a18a951](https://github.com/ParabolInc/parabol/commit/a18a9510587f8d29f81d4b4b3935340690c5386e))
* gracefully handle acceptTeamInvitation ([#11173](https://github.com/ParabolInc/parabol/issues/11173)) ([e087f29](https://github.com/ParabolInc/parabol/commit/e087f29130338bf3898ac112420bb140c2b5d5c7))
* Meeting summary line breaks ([#11160](https://github.com/ParabolInc/parabol/issues/11160)) ([6afbfae](https://github.com/ParabolInc/parabol/commit/6afbfaee1bf66fcf13a178847fcfdb4cedcda3d6))
* serialize using msgpack to preserve Dates for dataloaders ([#11155](https://github.com/ParabolInc/parabol/issues/11155)) ([f5e385e](https://github.com/ParabolInc/parabol/commit/f5e385e54229c235ee6fd80d76f8e0c16e98d223))


### Changed

* **SAML:** Fetch fresh metadata before expiry ([#11163](https://github.com/ParabolInc/parabol/issues/11163)) ([5c15f80](https://github.com/ParabolInc/parabol/commit/5c15f8030d6fa2cbc31ceee8c35269ecc43f9bf2))
* Update service diagram ([#11168](https://github.com/ParabolInc/parabol/issues/11168)) ([f01b0d8](https://github.com/ParabolInc/parabol/commit/f01b0d81c96f944c261da2bc593595dc3198fa0e))

## [9.1.1](https://github.com/ParabolInc/parabol/compare/v9.1.0...v9.1.1) (2025-04-09)


### Fixed

* sigterm faster ([#11152](https://github.com/ParabolInc/parabol/issues/11152)) ([0320f51](https://github.com/ParabolInc/parabol/commit/0320f51dad2499e4d154fabe83f04275a7e4f61c))

## [9.1.0](https://github.com/ParabolInc/parabol/compare/v9.0.7...v9.1.0) (2025-04-09)


### Added

* Disable Suggest Groups button if the free team has exceeded the limit ([#11133](https://github.com/ParabolInc/parabol/issues/11133)) ([7e76235](https://github.com/ParabolInc/parabol/commit/7e762354e82aaaaf0f83a0342965f9861102ce69))


### Fixed

* handle sigterm more gracefully ([#11150](https://github.com/ParabolInc/parabol/issues/11150)) ([465667e](https://github.com/ParabolInc/parabol/commit/465667e8410cb695d87660731b87254291a8733e))
* super user can toggle ai features ([#11144](https://github.com/ParabolInc/parabol/issues/11144)) ([13c97d3](https://github.com/ParabolInc/parabol/commit/13c97d3bf758119fdf6372651d3a56668b7b8223))


### Changed

* track upgrade clicks from public teams ([#11130](https://github.com/ParabolInc/parabol/issues/11130)) ([85086d0](https://github.com/ParabolInc/parabol/commit/85086d0645dd469edf5304db97cd9548e63d791b))

## [9.0.7](https://github.com/ParabolInc/parabol/compare/v9.0.6...v9.0.7) (2025-04-09)


### Fixed

* escape hatch for missing datadog context ([#11136](https://github.com/ParabolInc/parabol/issues/11136)) ([025c44e](https://github.com/ParabolInc/parabol/commit/025c44eff83c9d8b7d1967d5096609af6fbeb596))
* Org admin can remove team members without being on team ([#11142](https://github.com/ParabolInc/parabol/issues/11142)) ([c3ebadb](https://github.com/ParabolInc/parabol/commit/c3ebadb9c93cd800fe7394f945417a2ae7072304))

## [9.0.6](https://github.com/ParabolInc/parabol/compare/v9.0.5...v9.0.6) (2025-04-08)


### Fixed

* turn on dd resolvers ([#11125](https://github.com/ParabolInc/parabol/issues/11125)) ([ba2ef28](https://github.com/ParabolInc/parabol/commit/ba2ef2884be0422cbac5fe461dc438f626838cfa))


### Changed

* refactor teams query in organization ([#11085](https://github.com/ParabolInc/parabol/issues/11085)) ([7134bbb](https://github.com/ParabolInc/parabol/commit/7134bbbe14042e7828c26171e494c1c45488d1df))
* Trace Azure DevOps workItems queries ([#11132](https://github.com/ParabolInc/parabol/issues/11132)) ([f2357c8](https://github.com/ParabolInc/parabol/commit/f2357c835560ca09fa0c37fb3f418c895b4448da))

## [9.0.5](https://github.com/ParabolInc/parabol/compare/v9.0.4...v9.0.5) (2025-04-07)


### Fixed

* abs path for sourcemaps, add hc to blocklist for dd, disconnect query ([#11122](https://github.com/ParabolInc/parabol/issues/11122)) ([b969fda](https://github.com/ParabolInc/parabol/commit/b969fdab0cb10a5a7122e3a54fc948f5a50a2809))

## [9.0.4](https://github.com/ParabolInc/parabol/compare/v9.0.3...v9.0.4) (2025-04-07)


### Fixed

* [#11107](https://github.com/ParabolInc/parabol/issues/11107) push server sourcemaps to dd ([#11119](https://github.com/ParabolInc/parabol/issues/11119)) ([37d4d98](https://github.com/ParabolInc/parabol/commit/37d4d9856fb58db2203ae898dbcc45a4d121ebb1))
* bugs found under production load with graphql-yoga ([#11116](https://github.com/ParabolInc/parabol/issues/11116)) ([b46ad57](https://github.com/ParabolInc/parabol/commit/b46ad57e8970625b2f930469e7f349be43dcb37d))
* use abs path ([#11120](https://github.com/ParabolInc/parabol/issues/11120)) ([1d38bc0](https://github.com/ParabolInc/parabol/commit/1d38bc00aa611d682b5e705b02bab4b920288e30))

## [9.0.3](https://github.com/ParabolInc/parabol/compare/v9.0.2...v9.0.3) (2025-04-04)


### Fixed

* set app location on ws conn ([#11109](https://github.com/ParabolInc/parabol/issues/11109)) ([228c8c7](https://github.com/ParabolInc/parabol/commit/228c8c7211a5be03b0c8ae452aabe97669633b32))

## [9.0.2](https://github.com/ParabolInc/parabol/compare/v9.0.1...v9.0.2) (2025-04-04)


### Fixed

* missing githubRequest from schema ([#11105](https://github.com/ParabolInc/parabol/issues/11105)) ([636f4a9](https://github.com/ParabolInc/parabol/commit/636f4a94b480e4103992e296dfb9be5c3700d6bb))

## [9.0.1](https://github.com/ParabolInc/parabol/compare/v9.0.0...v9.0.1) (2025-04-04)


### Fixed

* dataloaders in redis bugfix ([#11102](https://github.com/ParabolInc/parabol/issues/11102)) ([7df894d](https://github.com/ParabolInc/parabol/commit/7df894d121e4dc1bf98a19febccae9dad3c2561b))

## [9.0.0](https://github.com/ParabolInc/parabol/compare/v8.39.2...v9.0.0) (2025-04-04)


### ⚠ BREAKING CHANGES

* sunset gql-executor service in favor of graphql-yoga on the socket server ([#11077](https://github.com/ParabolInc/parabol/issues/11077))

### Added

* sunset gql-executor service in favor of graphql-yoga on the socket server ([#11077](https://github.com/ParabolInc/parabol/issues/11077)) ([bb592cd](https://github.com/ParabolInc/parabol/commit/bb592cdfce600c04a711352293dfad71f2cefcab))
