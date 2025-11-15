## [8.39.2](https://github.com/ParabolInc/parabol/compare/v8.39.1...v8.39.2) (2025-04-04)


### Fixed

* gitlab & azure summaries show up ([#11091](https://github.com/ParabolInc/parabol/issues/11091)) ([7c48282](https://github.com/ParabolInc/parabol/commit/7c48282d5759d7b15165f756912fef87c023a243))


### Changed

* add metrics for page creation, insight generation, and team privacy changes ([#11075](https://github.com/ParabolInc/parabol/issues/11075)) ([3c344f2](https://github.com/ParabolInc/parabol/commit/3c344f29513a218433c50d1e5362b7909862608a))
* **Mattermost Plugin:** Move plugin commands ([#11089](https://github.com/ParabolInc/parabol/issues/11089)) ([c438c68](https://github.com/ParabolInc/parabol/commit/c438c6811376e793ca05944e61c65f7e892b52a6))
* remove S3 from Iron Bank action ([#11097](https://github.com/ParabolInc/parabol/issues/11097)) ([e991ec0](https://github.com/ParabolInc/parabol/commit/e991ec03d7050badafaa69df39c6bce91526a957))

## [8.39.1](https://github.com/ParabolInc/parabol/compare/v8.39.0...v8.39.1) (2025-04-03)


### Fixed

* tiptap mentions ([#11093](https://github.com/ParabolInc/parabol/issues/11093)) ([14f4670](https://github.com/ParabolInc/parabol/commit/14f46707e252403f2938185beb9abf7ef0442efb))

## [8.39.0](https://github.com/ParabolInc/parabol/compare/v8.38.0...v8.39.0) (2025-04-02)


### Added

* **orgAdmin:** org admin can invite people right in the org team view ([#11087](https://github.com/ParabolInc/parabol/issues/11087)) ([85ea1ea](https://github.com/ParabolInc/parabol/commit/85ea1eaa97284e0fea8d839e750ae0bd8945a19e))
* team privacy UI updates ([#11078](https://github.com/ParabolInc/parabol/issues/11078)) ([d408a2c](https://github.com/ParabolInc/parabol/commit/d408a2cfe8c37c1ef31a225aa1540bd16a0fd613))
* update OrgMembers component to display matched users in search results ([#11086](https://github.com/ParabolInc/parabol/issues/11086)) ([19cd155](https://github.com/ParabolInc/parabol/commit/19cd155549446e55698bd91d664bc92debd740be))

## [8.38.0](https://github.com/ParabolInc/parabol/compare/v8.37.4...v8.38.0) (2025-03-27)


### Added

* Add actions to the empty team experience ([#11070](https://github.com/ParabolInc/parabol/issues/11070)) ([5d53b1a](https://github.com/ParabolInc/parabol/commit/5d53b1a669b3f42c3968bc69c3f4c48b0b302d85))
* can choose privacy when creating a team ([#11046](https://github.com/ParabolInc/parabol/issues/11046)) ([1a18729](https://github.com/ParabolInc/parabol/commit/1a18729e150bbcf95ab665887df637e35cf60cbd))
* Join your organization when signing up with SAML ([#11054](https://github.com/ParabolInc/parabol/issues/11054)) ([2f7579e](https://github.com/ParabolInc/parabol/commit/2f7579e84b5bbec431f1be821530a0935e0f9a88))
* User provisioning to different Organization via SAML claim ([#11059](https://github.com/ParabolInc/parabol/issues/11059)) ([3f331da](https://github.com/ParabolInc/parabol/commit/3f331da9be4e7bdb3d04a9d64b1adb717310a834))

## [8.37.4](https://github.com/ParabolInc/parabol/compare/v8.37.3...v8.37.4) (2025-03-26)


### Fixed

* Public Teams Modal Layout on Safari ([#11069](https://github.com/ParabolInc/parabol/issues/11069)) ([b71ab71](https://github.com/ParabolInc/parabol/commit/b71ab710de8a12b44694763c250d12f686b8dfd5))

## [8.37.3](https://github.com/ParabolInc/parabol/compare/v8.37.2...v8.37.3) (2025-03-25)


### Fixed

* can see public teams when there are no viewer teams ([#11056](https://github.com/ParabolInc/parabol/issues/11056)) ([62fb10a](https://github.com/ParabolInc/parabol/commit/62fb10a1c15cc81f8f25a3c6009f05c2a230bea1))
* correct meeting link URL in the prompt for generating meeting summaries ([#11062](https://github.com/ParabolInc/parabol/issues/11062)) ([3448235](https://github.com/ParabolInc/parabol/commit/34482355221e55ff060b0cbe01efbd9c893c725d))
* dynamic text for instruction text ([#10942](https://github.com/ParabolInc/parabol/issues/10942)) ([ef9d3ad](https://github.com/ParabolInc/parabol/commit/ef9d3ad274d8fd651f5da263d8f5fb321461976a))
* typo on public team setting help text ([#11063](https://github.com/ParabolInc/parabol/issues/11063)) ([1963a32](https://github.com/ParabolInc/parabol/commit/1963a32bbbf1ea37f93938a2f447971182568d6f))


### Changed

* add private teams to team benefits ([#11061](https://github.com/ParabolInc/parabol/issues/11061)) ([bcfeb81](https://github.com/ParabolInc/parabol/commit/bcfeb812a976359acb7fae707a92fa7673c24c8c))
* update insights flag expiration ([#11055](https://github.com/ParabolInc/parabol/issues/11055)) ([d0e2fea](https://github.com/ParabolInc/parabol/commit/d0e2fea425b60217bced4268c099ee10ceaa3c34))

## [8.37.2](https://github.com/ParabolInc/parabol/compare/v8.37.1...v8.37.2) (2025-03-21)


### Fixed

* return 404 if PWAHandler cannot find files ([#11043](https://github.com/ParabolInc/parabol/issues/11043)) ([d66ef3d](https://github.com/ParabolInc/parabol/commit/d66ef3d7820826db41e9d38f149594ccce3266c7))
* Undefined TeamMember in NewMeetingCheckIn ([#11042](https://github.com/ParabolInc/parabol/issues/11042)) ([aac4304](https://github.com/ParabolInc/parabol/commit/aac430457398fe28def7a1c3f60ef8c2056dfdf1))

## [8.37.1](https://github.com/ParabolInc/parabol/compare/v8.37.0...v8.37.1) (2025-03-21)


### Changed

* Cork serving static files ([#11037](https://github.com/ParabolInc/parabol/issues/11037)) ([177b607](https://github.com/ParabolInc/parabol/commit/177b607c8342e004c1e473801db290f898252be3))
* Normalize TeamMember ([#11026](https://github.com/ParabolInc/parabol/issues/11026)) ([4ea346c](https://github.com/ParabolInc/parabol/commit/4ea346c2bdb8f405a55aef198018821c04ea3bd6))

## [8.37.0](https://github.com/ParabolInc/parabol/compare/v8.36.1...v8.37.0) (2025-03-19)


### Added

* **orgAdmin:** UI for mass org user removal ([#10984](https://github.com/ParabolInc/parabol/issues/10984)) ([a95616f](https://github.com/ParabolInc/parabol/commit/a95616fe8ac7d194db01d4b47199f592b6846331))

## [8.36.1](https://github.com/ParabolInc/parabol/compare/v8.36.0...v8.36.1) (2025-03-19)


### Changed

* company query allows super user to query all companies ([#11030](https://github.com/ParabolInc/parabol/issues/11030)) ([43da0b5](https://github.com/ParabolInc/parabol/commit/43da0b5b2398633b0a939d115c02ba6b13cb8d39))
* Fixes for down migration checks ([#11027](https://github.com/ParabolInc/parabol/issues/11027)) ([2510262](https://github.com/ParabolInc/parabol/commit/2510262b9d6750f52688db2628a4dfbaf8630029))

## [8.36.0](https://github.com/ParabolInc/parabol/compare/v8.35.2...v8.36.0) (2025-03-18)


### Added

* add gitlab to demo ([#11023](https://github.com/ParabolInc/parabol/issues/11023)) ([b2aa5f8](https://github.com/ParabolInc/parabol/commit/b2aa5f82c6bf176c00591ea191109bffb5b114f9))
* can join public teams without invite ([#10952](https://github.com/ParabolInc/parabol/issues/10952)) ([7a98cf3](https://github.com/ParabolInc/parabol/commit/7a98cf3e02a1bd4e6ca21d30d45deccbfb55ecc9))
* newly created teams are public by default ([#10961](https://github.com/ParabolInc/parabol/issues/10961)) ([d41ed25](https://github.com/ParabolInc/parabol/commit/d41ed25d8f6111c994836d5bdbcf1aea8e06e0ab))


### Fixed

* GQL retries consuming the stream on failover ([#11025](https://github.com/ParabolInc/parabol/issues/11025)) ([a564def](https://github.com/ParabolInc/parabol/commit/a564def5ad9ed1f3578fad0e9e713e47966eab6d))

## [8.35.2](https://github.com/ParabolInc/parabol/compare/v8.35.1...v8.35.2) (2025-03-18)


### Fixed

* link css ([#11011](https://github.com/ParabolInc/parabol/issues/11011)) ([15185aa](https://github.com/ParabolInc/parabol/commit/15185aa4b4eff350ca67a4a14dadf5b94b303595))
* Syntax error in down migration ([#11013](https://github.com/ParabolInc/parabol/issues/11013)) ([95e19ea](https://github.com/ParabolInc/parabol/commit/95e19ea9892da5fdef63de40d3d46de68f946c9e))


### Changed

* check down migrations are valid ([#11014](https://github.com/ParabolInc/parabol/issues/11014)) ([3c06358](https://github.com/ParabolInc/parabol/commit/3c06358544079c1ac75ec59ef89fcf86c975be12))
* **deps:** bump axios from 1.8.1 to 1.8.2 ([#10969](https://github.com/ParabolInc/parabol/issues/10969)) ([d4b668f](https://github.com/ParabolInc/parabol/commit/d4b668f159ca58a8a41f4428395b25ef1ab5eb6e))
* **deps:** bump tj-actions/changed-files from 41 to 46 in /.github/workflows ([#11019](https://github.com/ParabolInc/parabol/issues/11019)) ([cf20151](https://github.com/ParabolInc/parabol/commit/cf201513dccecd91454bfc5203bb43445fbee027))
* **deps:** bump xml-crypto from 3.2.0 to 3.2.1 ([#11010](https://github.com/ParabolInc/parabol/issues/11010)) ([cd257eb](https://github.com/ParabolInc/parabol/commit/cd257eb541d4a04fef72ccbea6eeb1d3aba8cbdb))
* Security upgrade dompurify from 2.5.8 to 3.2.4 ([#10883](https://github.com/ParabolInc/parabol/issues/10883)) ([7ea51a0](https://github.com/ParabolInc/parabol/commit/7ea51a0df821d7ed35959f6a02aa11245d52c295))

## [8.35.1](https://github.com/ParabolInc/parabol/compare/v8.35.0...v8.35.1) (2025-03-13)


### Fixed

* drag handles and scrollbar on specific meeting table ([#11000](https://github.com/ParabolInc/parabol/issues/11000)) ([621673c](https://github.com/ParabolInc/parabol/commit/621673c2a2bcad0745e8890d9163bf9d6d23aa4a))
* placeholder regression in tiptap ([#11007](https://github.com/ParabolInc/parabol/issues/11007)) ([b78eea8](https://github.com/ParabolInc/parabol/commit/b78eea8e8bdce1e5ec5361548969ad71d9ab02cf))
* several people are not editing, thank you ([#11008](https://github.com/ParabolInc/parabol/issues/11008)) ([9506d34](https://github.com/ParabolInc/parabol/commit/9506d347865bddf69259ca99cf29b3c5ad08193f))

## [8.35.0](https://github.com/ParabolInc/parabol/compare/v8.34.3...v8.35.0) (2025-03-12)


### Added

* **pages:** custom prompts ([#10985](https://github.com/ParabolInc/parabol/issues/10985)) ([92a2b40](https://github.com/ParabolInc/parabol/commit/92a2b403696d9705852cf1ac813e017128f0baae))


### Changed

* remove google language manager ([#10639](https://github.com/ParabolInc/parabol/issues/10639)) ([1b04e56](https://github.com/ParabolInc/parabol/commit/1b04e56668048ab02829fbee6509e3bbb2ce2f44))

## [8.34.3](https://github.com/ParabolInc/parabol/compare/v8.34.2...v8.34.3) (2025-03-12)


### Fixed

* Handle duplicate SAML attributes ([#10988](https://github.com/ParabolInc/parabol/issues/10988)) ([cf47813](https://github.com/ParabolInc/parabol/commit/cf4781346f9a1f2f85a3f690ae3f30f3c4c028bc))

## [8.34.2](https://github.com/ParabolInc/parabol/compare/v8.34.1...v8.34.2) (2025-03-12)


### Changed

* deprecate `RemoveOrgUser` in favor of `RemoveOrgUsers` ([#10951](https://github.com/ParabolInc/parabol/issues/10951)) ([8157a08](https://github.com/ParabolInc/parabol/commit/8157a081680e6ae35c029213a876ed6658d63c06))
* Log attributes if the emails don't match ([#10986](https://github.com/ParabolInc/parabol/issues/10986)) ([6e9c7ab](https://github.com/ParabolInc/parabol/commit/6e9c7abb704a2ab258c183002b064fcbcb1df9ce))

## [8.34.1](https://github.com/ParabolInc/parabol/compare/v8.34.0...v8.34.1) (2025-03-11)


### Changed

* Add logging for SAML login errors ([#10981](https://github.com/ParabolInc/parabol/issues/10981)) ([bc31ba4](https://github.com/ParabolInc/parabol/commit/bc31ba483d2f78938ee8667817a7d83dd9672aa5))
* change settings tooltip copy ([#10979](https://github.com/ParabolInc/parabol/issues/10979)) ([61caf63](https://github.com/ParabolInc/parabol/commit/61caf63daa1e7e85c402b017227caf82ecba3428))

## [8.34.0](https://github.com/ParabolInc/parabol/compare/v8.33.1...v8.34.0) (2025-03-11)


### Added

* **pages:** drag handles, copy/paste markdown ([#10977](https://github.com/ParabolInc/parabol/issues/10977)) ([7d034d8](https://github.com/ParabolInc/parabol/commit/7d034d87f21b94615fc86236e1b5c68986ef3e52))


### Changed

* **postgresql:** upgrade pgvector to 0.8.0 ([#10976](https://github.com/ParabolInc/parabol/issues/10976)) ([e0170e0](https://github.com/ParabolInc/parabol/commit/e0170e0135b7446be2b1b6d77ceab42a398989ee))
* update copy that says only team leads can upgrade ([#10970](https://github.com/ParabolInc/parabol/issues/10970)) ([957cba8](https://github.com/ParabolInc/parabol/commit/957cba8880140b628ed0288e44ef779eb89ff54f))

## [8.33.1](https://github.com/ParabolInc/parabol/compare/v8.33.0...v8.33.1) (2025-03-10)


### Fixed

* getIsEmailApprovedByOrg was overly permissive ([#10971](https://github.com/ParabolInc/parabol/issues/10971)) ([2d25bc0](https://github.com/ParabolInc/parabol/commit/2d25bc0e53f22fcbeb0875e84ec85128e6592c04))

## [8.33.0](https://github.com/ParabolInc/parabol/compare/v8.32.0...v8.33.0) (2025-03-07)


### Added

* copy insights to markdown ([#10963](https://github.com/ParabolInc/parabol/issues/10963)) ([be3b3d1](https://github.com/ParabolInc/parabol/commit/be3b3d140a5c35f20cf88205d429edcaff185cdb))
* **Mattermost Plugin:** Configure notifications ([#10905](https://github.com/ParabolInc/parabol/issues/10905)) ([623f472](https://github.com/ParabolInc/parabol/commit/623f472187e1e95a30c8625700790e29bfaa0690))


### Changed

* **Mattermost Plugin:** Error and loading states ([#10967](https://github.com/ParabolInc/parabol/issues/10967)) ([537f5de](https://github.com/ParabolInc/parabol/commit/537f5def6d4779746097c15bcced4488e1deaa0c))
* **Mattermost Plugin:** Sidepanel styling ([#10964](https://github.com/ParabolInc/parabol/issues/10964)) ([b340c33](https://github.com/ParabolInc/parabol/commit/b340c33691b371c621066405a1551f3e76e98bf6))
* **Mattermost Plugin:** Update notify API ([#10960](https://github.com/ParabolInc/parabol/issues/10960)) ([c711382](https://github.com/ParabolInc/parabol/commit/c711382dabe436de343276cb887ec146642328ca))

## [8.32.0](https://github.com/ParabolInc/parabol/compare/v8.31.0...v8.32.0) (2025-03-05)


### Added

* insights backend ([#10936](https://github.com/ParabolInc/parabol/issues/10936)) ([5fb8756](https://github.com/ParabolInc/parabol/commit/5fb875629d3600cf1399379aa9b710acbb88ebae))
* **templates:** allow org admins to access team templates ([#10946](https://github.com/ParabolInc/parabol/issues/10946)) ([7ce67c7](https://github.com/ParabolInc/parabol/commit/7ce67c70b28c58f9df4955ba71dc04840a2b3113))


### Fixed

* line height, padding for editor instances ([#10931](https://github.com/ParabolInc/parabol/issues/10931)) ([182eca9](https://github.com/ParabolInc/parabol/commit/182eca952794d46c7bc5632f3fe551d1ebe46919))


### Changed

* Add loginMattermost private mutation ([#10943](https://github.com/ParabolInc/parabol/issues/10943)) ([b45578c](https://github.com/ParabolInc/parabol/commit/b45578cd05a87cf82e5ab6feb8659498b5af7b8c))
* **Mattermost Plugin:** Poll active meetings ([#10950](https://github.com/ParabolInc/parabol/issues/10950)) ([8912e23](https://github.com/ParabolInc/parabol/commit/8912e237916c683ef6c5cbe67f0e1e482209a265))
* rename removeMultipleOrgUsers to removeOrgUsers ([#10947](https://github.com/ParabolInc/parabol/issues/10947)) ([17085b8](https://github.com/ParabolInc/parabol/commit/17085b8b4b862e0713c2d32b2c66a0ed9bc3bdee))

## [8.31.0](https://github.com/ParabolInc/parabol/compare/v8.30.0...v8.31.0) (2025-03-04)


### Added

* add client-side RemoveMultipleOrgUsersMutation ([#10805](https://github.com/ParabolInc/parabol/issues/10805)) ([167ce2b](https://github.com/ParabolInc/parabol/commit/167ce2b304b3664a09affa3a97d7b1ed32b81e11))


### Changed

* Add "Press Enter" hint in reflect phase ([#10909](https://github.com/ParabolInc/parabol/issues/10909)) ([d82db10](https://github.com/ParabolInc/parabol/commit/d82db10945429e4bb2d9641729aadabef082ffc0))
* **Notifications:** Refactor notification settings to be per team ([#10899](https://github.com/ParabolInc/parabol/issues/10899)) ([49dc95a](https://github.com/ParabolInc/parabol/commit/49dc95a2403984818b3752dab15e67ec7d2bcea7))

## [8.30.0](https://github.com/ParabolInc/parabol/compare/v8.29.0...v8.30.0) (2025-02-28)


### Added

* insights block ([#10911](https://github.com/ParabolInc/parabol/issues/10911)) ([e9ad424](https://github.com/ParabolInc/parabol/commit/e9ad4240d8d19fff17fc52d5cc8a301acf8f712c))


### Fixed

* issues when replying to comments ([#10912](https://github.com/ParabolInc/parabol/issues/10912)) ([e4f293a](https://github.com/ParabolInc/parabol/commit/e4f293aa084304a54930dc255f4bf83ba15c9411))
* no ai title for custom groups ([#10929](https://github.com/ParabolInc/parabol/issues/10929)) ([4f066a0](https://github.com/ParabolInc/parabol/commit/4f066a0ac1189d45a9ad7e1f60ce23805bfd4d79))


### Changed

* **Mattermost Plugin:** Default to linked teams on new channels ([#10937](https://github.com/ParabolInc/parabol/issues/10937)) ([9bd83af](https://github.com/ParabolInc/parabol/commit/9bd83af5b2438d0fcbe3982f5cc49cf9773fcc87))
* Minor Mattermost Plugin fixes ([#10933](https://github.com/ParabolInc/parabol/issues/10933)) ([1f16c7c](https://github.com/ParabolInc/parabol/commit/1f16c7c27fd5341805474b2deaf39e373d0ed915))

## [8.29.0](https://github.com/ParabolInc/parabol/compare/v8.28.1...v8.29.0) (2025-02-25)


### Added

* add ability for org billing leader and org admin to delete meeting templates ([#10902](https://github.com/ParabolInc/parabol/issues/10902)) ([f32c0aa](https://github.com/ParabolInc/parabol/commit/f32c0aa6978ae6691dd7a8bb7df1b870833c4796))


### Fixed

* schedule time inaccuracy ([#10908](https://github.com/ParabolInc/parabol/issues/10908)) ([d445543](https://github.com/ParabolInc/parabol/commit/d445543ed371698128fdf230c403f62ace5d9b84))


### Changed

* remove old upgrade payment logic ([#10860](https://github.com/ParabolInc/parabol/issues/10860)) ([c86b5cc](https://github.com/ParabolInc/parabol/commit/c86b5cc51eb2e9b93feecd92b2025eff9bc465ce))

## [8.28.1](https://github.com/ParabolInc/parabol/compare/v8.28.0...v8.28.1) (2025-02-20)


### Fixed

* in prod connect ws to /hocuspocus to get forwarded ([#10903](https://github.com/ParabolInc/parabol/issues/10903)) ([682886b](https://github.com/ParabolInc/parabol/commit/682886b43ac8c019cdc9bd5cd6d0556b85e29b95))

## [8.28.0](https://github.com/ParabolInc/parabol/compare/v8.27.2...v8.28.0) (2025-02-19)


### Added

* Pages ([#10802](https://github.com/ParabolInc/parabol/issues/10802)) ([79d81d2](https://github.com/ParabolInc/parabol/commit/79d81d2ab05b03749816343f2668cd431375ac98))

## [8.27.2](https://github.com/ParabolInc/parabol/compare/v8.27.1...v8.27.2) (2025-02-19)


### Fixed

* Increase integration OAuth2 access token size ([#10892](https://github.com/ParabolInc/parabol/issues/10892)) ([c0134ef](https://github.com/ParabolInc/parabol/commit/c0134ef0d35da2e12b919c752c044d3a24d65e59))

## [8.27.1](https://github.com/ParabolInc/parabol/compare/v8.27.0...v8.27.1) (2025-02-18)


### Fixed

* Show error message when failing to integrate with Azure DevOps ([#10888](https://github.com/ParabolInc/parabol/issues/10888)) ([f2d530d](https://github.com/ParabolInc/parabol/commit/f2d530d701563011096cabd81f03f64205061aac))

## [8.27.0](https://github.com/ParabolInc/parabol/compare/v8.26.3...v8.27.0) (2025-02-18)


### Added

* **Mattermost Plugin:** TipTap link menu ([#10863](https://github.com/ParabolInc/parabol/issues/10863)) ([5593b75](https://github.com/ParabolInc/parabol/commit/5593b75b6b74a3b3fcd777925e1a09e1506ea239))


### Fixed

* empty discussion stages ([#10836](https://github.com/ParabolInc/parabol/issues/10836)) ([2b4d134](https://github.com/ParabolInc/parabol/commit/2b4d134f33316bc7ccb8cfb82ceefc7aafd720e3))
* Failed to execute `removeChild` ([#10886](https://github.com/ParabolInc/parabol/issues/10886)) ([ddff9dd](https://github.com/ParabolInc/parabol/commit/ddff9ddae059edd0c5d18247561276eda75a4d7b))


### Changed

* update target GCS bucket for IB action ([#10882](https://github.com/ParabolInc/parabol/issues/10882)) ([3fb8e5c](https://github.com/ParabolInc/parabol/commit/3fb8e5ce5e561bda44d967639a85753fb2caf9c7))

## [8.26.3](https://github.com/ParabolInc/parabol/compare/v8.26.2...v8.26.3) (2025-02-14)


### Fixed

* remove handleDisconnect logs ([#10879](https://github.com/ParabolInc/parabol/issues/10879)) ([922bf34](https://github.com/ParabolInc/parabol/commit/922bf345404ac65971fc14e188b60132523be14e))

## [8.26.2](https://github.com/ParabolInc/parabol/compare/v8.26.1...v8.26.2) (2025-02-14)


### Fixed

* joinPool early and wait for old servers to shut down ([#10876](https://github.com/ParabolInc/parabol/issues/10876)) ([2f0259c](https://github.com/ParabolInc/parabol/commit/2f0259c43e51b944f3889d3ac51b6575cc883d4c))

## [8.26.1](https://github.com/ParabolInc/parabol/compare/v8.26.0...v8.26.1) (2025-02-14)


### Fixed

* end xreadgroup gracefully on shutdown ([#10873](https://github.com/ParabolInc/parabol/issues/10873)) ([526d9b8](https://github.com/ParabolInc/parabol/commit/526d9b891702b375796478c1537990f262ad7ba1))

## [8.26.0](https://github.com/ParabolInc/parabol/compare/v8.25.4...v8.26.0) (2025-02-13)


### Added

* **orgAdmin:** add sortable `memberCount` and `lastMetAt` columns in OrgTeams view ([#10846](https://github.com/ParabolInc/parabol/issues/10846)) ([c04bb94](https://github.com/ParabolInc/parabol/commit/c04bb94f9fde8b0efde2ac39de48bba33b65f660))


### Fixed

* client resub on server redeploy ([#10870](https://github.com/ParabolInc/parabol/issues/10870)) ([eda8d5b](https://github.com/ParabolInc/parabol/commit/eda8d5b42e6025b934c6d33d48bf60ad32add126))
* put dashboard routes inside dashboard components ([#10871](https://github.com/ParabolInc/parabol/issues/10871)) ([63b6c0d](https://github.com/ParabolInc/parabol/commit/63b6c0ded08791d048c15ed8e829b4d91ffd8655))

## [8.25.4](https://github.com/ParabolInc/parabol/compare/v8.25.3...v8.25.4) (2025-02-12)


### Fixed

* delay cleaning user presence ([#10855](https://github.com/ParabolInc/parabol/issues/10855)) ([b208f89](https://github.com/ParabolInc/parabol/commit/b208f89557a852e3b259d4076e6b5007ca0f2bfc))

## [8.25.3](https://github.com/ParabolInc/parabol/compare/v8.25.2...v8.25.3) (2025-02-11)


### Fixed

* log userId on missing user disconnect ([#10852](https://github.com/ParabolInc/parabol/issues/10852)) ([8a1f3a1](https://github.com/ParabolInc/parabol/commit/8a1f3a1a3470b619add96d7006f0d6ce1caa8c3c))
* **Mattermost Plugin:** Update Parabol URLs ([#10850](https://github.com/ParabolInc/parabol/issues/10850)) ([e3199a9](https://github.com/ParabolInc/parabol/commit/e3199a9cd8c100c3984355835145feb5bcd6ee74))


### Changed

* bump typescript ([#10844](https://github.com/ParabolInc/parabol/issues/10844)) ([816f2c8](https://github.com/ParabolInc/parabol/commit/816f2c8df3980206b147dffce5b7840de7a4662a))

## [8.25.2](https://github.com/ParabolInc/parabol/compare/v8.25.1...v8.25.2) (2025-02-11)


### Fixed

* Azure DevOps authorization ([#10847](https://github.com/ParabolInc/parabol/issues/10847)) ([a717fe8](https://github.com/ParabolInc/parabol/commit/a717fe843c3a5ea2b39257da1f676bee0ddcd22d))

## [8.25.1](https://github.com/ParabolInc/parabol/compare/v8.25.0...v8.25.1) (2025-02-10)


### Fixed

* no smart title, log socket server id ([#10841](https://github.com/ParabolInc/parabol/issues/10841)) ([aa36f5a](https://github.com/ParabolInc/parabol/commit/aa36f5a6c66a1f44105deb9e6aab0e9888be9468))

## [8.25.0](https://github.com/ParabolInc/parabol/compare/v8.24.5...v8.25.0) (2025-02-10)


### Added

* **Mattermost Plugin:** Cleanup sidepanel ([#10798](https://github.com/ParabolInc/parabol/issues/10798)) ([77eac0f](https://github.com/ParabolInc/parabol/commit/77eac0f4d5063cf9f4979a2cd18e45267b05929b))


### Fixed

* app version on dev server ([#10830](https://github.com/ParabolInc/parabol/issues/10830)) ([d100928](https://github.com/ParabolInc/parabol/commit/d100928f29432d91765797a22afeeb1a5985c1ad))
* bump trebuchet-client ([#10839](https://github.com/ParabolInc/parabol/issues/10839)) ([f51b24d](https://github.com/ParabolInc/parabol/commit/f51b24dc838b6b47b42ba20ac71f2f7ad10b08e7))
* remove hardcoded action.parabol.co from the application code ([#10834](https://github.com/ParabolInc/parabol/issues/10834)) ([77e63fe](https://github.com/ParabolInc/parabol/commit/77e63fe8130fabee1865bf9cdf8a1658420d2d4b))
* update icebreaker styles ([#10835](https://github.com/ParabolInc/parabol/issues/10835)) ([f0737cc](https://github.com/ParabolInc/parabol/commit/f0737cccf2727d8aeb77faea79b0de22f60ee8f6))
* use canonical image storage path helper func ([#10829](https://github.com/ParabolInc/parabol/issues/10829)) ([32f432f](https://github.com/ParabolInc/parabol/commit/32f432f6d2e614ef348e77019f40715482a1da6f))


### Changed

* **Mattermost Plugin:** Push command list from the client ([#10832](https://github.com/ParabolInc/parabol/issues/10832)) ([8e2b748](https://github.com/ParabolInc/parabol/commit/8e2b748517b2900e8ccdab60ebdb7ca99dc608da))

## [8.24.5](https://github.com/ParabolInc/parabol/compare/v8.24.4...v8.24.5) (2025-02-06)


### Fixed

* replace APP_VERSION with webpack global __APP_VERSION__ ([#10824](https://github.com/ParabolInc/parabol/issues/10824)) ([e478b10](https://github.com/ParabolInc/parabol/commit/e478b10426f51f190693cc95ba3955607f53cae7))

## [8.24.4](https://github.com/ParabolInc/parabol/compare/v8.24.3...v8.24.4) (2025-02-06)


### Changed

* flush pending GQL executor jobs before graceful shutdown ([#10821](https://github.com/ParabolInc/parabol/issues/10821)) ([da3734f](https://github.com/ParabolInc/parabol/commit/da3734fb718477fbd36efc2533371dda07148de8))

## [8.24.3](https://github.com/ParabolInc/parabol/compare/v8.24.2...v8.24.3) (2025-02-06)


### Fixed

* revert global styles change ([#10818](https://github.com/ParabolInc/parabol/issues/10818)) ([9434eb1](https://github.com/ParabolInc/parabol/commit/9434eb1dddebde7f2d8978e815fce5b0cb81e095))

## [8.24.2](https://github.com/ParabolInc/parabol/compare/v8.24.1...v8.24.2) (2025-02-06)


### Fixed

* update icebreaker styles ([#10723](https://github.com/ParabolInc/parabol/issues/10723)) ([31d398f](https://github.com/ParabolInc/parabol/commit/31d398fe00d18463242a86b9be36a0c4c51ada40))

## [8.24.1](https://github.com/ParabolInc/parabol/compare/v8.24.0...v8.24.1) (2025-02-06)


### Fixed

* Don't scroll discussions on new reactjis ([#10806](https://github.com/ParabolInc/parabol/issues/10806)) ([bd0dd0b](https://github.com/ParabolInc/parabol/commit/bd0dd0bae8d7875f412a1fdc589e9ac20c769e2a))
* Hook error during grouping reflections ([#10808](https://github.com/ParabolInc/parabol/issues/10808)) ([e67bf2b](https://github.com/ParabolInc/parabol/commit/e67bf2ba0e0bc2f0c7848eec89198741c0c07087))
* TipTap link extension type error ([#10809](https://github.com/ParabolInc/parabol/issues/10809)) ([1490e39](https://github.com/ParabolInc/parabol/commit/1490e39167e12aa77431de147b85e4c3a4ce9e34))

## [8.24.0](https://github.com/ParabolInc/parabol/compare/v8.23.8...v8.24.0) (2025-02-05)


### Added

* **Mattermost Plugin:** TipTap Editor for Task and Reflection ([#10796](https://github.com/ParabolInc/parabol/issues/10796)) ([9e4a14e](https://github.com/ParabolInc/parabol/commit/9e4a14e54726af7d156593128d9a682ad390a627))
* release standups ai to all users  ([#10724](https://github.com/ParabolInc/parabol/issues/10724)) ([260daf3](https://github.com/ParabolInc/parabol/commit/260daf3141cf67809b03fe9a764bc06e6f3b0700))


### Fixed

* update the logic to match the definition of an active team with Data Sanctum ([#10790](https://github.com/ParabolInc/parabol/issues/10790)) ([9c1df05](https://github.com/ParabolInc/parabol/commit/9c1df054457e894cde5bbb24fc01dba3d27b2030))


### Changed

* add extra logging to gql executor timeouts ([#10795](https://github.com/ParabolInc/parabol/issues/10795)) ([7ff31b1](https://github.com/ParabolInc/parabol/commit/7ff31b156ba0ebb9c7308dea51a77c34ae7f748c))
* Refactor tiptap events  ([#10800](https://github.com/ParabolInc/parabol/issues/10800)) ([4383430](https://github.com/ParabolInc/parabol/commit/4383430ac97238dfa9a58a5c042161908f370eff))

## [8.23.8](https://github.com/ParabolInc/parabol/compare/v8.23.7...v8.23.8) (2025-02-04)


### Fixed

* Allow navigation in meetings with invalid facilitator stage ([#10791](https://github.com/ParabolInc/parabol/issues/10791)) ([968c4fd](https://github.com/ParabolInc/parabol/commit/968c4fd35eacecd71b4492810e55dd4ead68ec08))

## [8.23.7](https://github.com/ParabolInc/parabol/compare/v8.23.6...v8.23.7) (2025-02-04)


### Fixed

* tailwind v4 fonts and animations ([#10787](https://github.com/ParabolInc/parabol/issues/10787)) ([576e536](https://github.com/ParabolInc/parabol/commit/576e536d498c20f3ee6142593ff85086c3d8fe5a))

## [8.23.6](https://github.com/ParabolInc/parabol/compare/v8.23.5...v8.23.6) (2025-02-04)


### Fixed

* validate facilitatorStageId when updating poker scope ([#10785](https://github.com/ParabolInc/parabol/issues/10785)) ([d677ea2](https://github.com/ParabolInc/parabol/commit/d677ea223205afb5562e66a7e60dc8934f12fc12))


### Changed

* remove tailwinds preflight ([#10784](https://github.com/ParabolInc/parabol/issues/10784)) ([1c6ec42](https://github.com/ParabolInc/parabol/commit/1c6ec425fedf3bfdda9e1e4ab825980f996fb9bb))
* upgrade tailwindcss to v4 ([#10772](https://github.com/ParabolInc/parabol/issues/10772)) ([7ea0212](https://github.com/ParabolInc/parabol/commit/7ea0212bb3969d63471e843853b9175cda2debf6))

## [8.23.5](https://github.com/ParabolInc/parabol/compare/v8.23.4...v8.23.5) (2025-01-31)


### Fixed

* overflow-auto for comment input add max-h ([#10779](https://github.com/ParabolInc/parabol/issues/10779)) ([902c549](https://github.com/ParabolInc/parabol/commit/902c5495d32944eb8ed494647a7df4b05fd0c562))

## [8.23.4](https://github.com/ParabolInc/parabol/compare/v8.23.3...v8.23.4) (2025-01-31)


### Fixed

* hide deleted and voided invoices ([#10770](https://github.com/ParabolInc/parabol/issues/10770)) ([f893226](https://github.com/ParabolInc/parabol/commit/f893226fc8a7569561d9eafcc357c0becd6c422c))
* line breaks in reflections ([#10777](https://github.com/ParabolInc/parabol/issues/10777)) ([da922ad](https://github.com/ParabolInc/parabol/commit/da922ad6049faee68c357f315592133db3e7c4ee))

## [8.23.3](https://github.com/ParabolInc/parabol/compare/v8.23.2...v8.23.3) (2025-01-30)


### Fixed

* gif menu goes off screen ([#10753](https://github.com/ParabolInc/parabol/issues/10753)) ([a14d575](https://github.com/ParabolInc/parabol/commit/a14d5756f8e03ef3fc6e942012605b6a244d9cc7))
* reduce jira issue TTL from 2 days to 1 day ([#10765](https://github.com/ParabolInc/parabol/issues/10765)) ([22060ff](https://github.com/ParabolInc/parabol/commit/22060ff14c24a80668903e213e3b4a7539f02565))
* speed up updatePokerScope ([#10767](https://github.com/ParabolInc/parabol/issues/10767)) ([5504279](https://github.com/ParabolInc/parabol/commit/5504279753f7f7b06fd57a7b8d3b0c33359bd0c7))
* tiptap bugs ([#10768](https://github.com/ParabolInc/parabol/issues/10768)) ([e12d980](https://github.com/ParabolInc/parabol/commit/e12d980e7530628dad211356c9489d205c9e0086))
* to update isEmailVerified while updating email ([#10707](https://github.com/ParabolInc/parabol/issues/10707)) ([5e64bbe](https://github.com/ParabolInc/parabol/commit/5e64bbe3654206933c85129fa9c0edd447e11453))


### Changed

* set oauth2redirect defaults, document env vars ([#10766](https://github.com/ParabolInc/parabol/issues/10766)) ([417879c](https://github.com/ParabolInc/parabol/commit/417879c4e74be1b85a375c128bb0c19cb7dc482d))
* update public teams feature flag expiry date ([#10742](https://github.com/ParabolInc/parabol/issues/10742)) ([aa009b5](https://github.com/ParabolInc/parabol/commit/aa009b57cfa1747bd2cd4f6a16078672c09b0066))

## [8.23.2](https://github.com/ParabolInc/parabol/compare/v8.23.1...v8.23.2) (2025-01-30)


### Changed

* **web-server:** reconnect window can be manually set but keeps a 60s default value ([#10754](https://github.com/ParabolInc/parabol/issues/10754)) ([da37f80](https://github.com/ParabolInc/parabol/commit/da37f803e310aec6ea42572e79fb5f64a171b4f7))

## [8.23.1](https://github.com/ParabolInc/parabol/compare/v8.23.0...v8.23.1) (2025-01-30)


### Fixed

* images keep size before loading ([#10750](https://github.com/ParabolInc/parabol/issues/10750)) ([72bbb65](https://github.com/ParabolInc/parabol/commit/72bbb65264ef521fd9d305dc121b34e5c217557b))

## [8.23.0](https://github.com/ParabolInc/parabol/compare/v8.22.0...v8.23.0) (2025-01-29)


### Added

* Support image resizing in TipTap ([#10747](https://github.com/ParabolInc/parabol/issues/10747)) ([4fb5f96](https://github.com/ParabolInc/parabol/commit/4fb5f968cff6e340072dbd8aef2ccebcb2b68b54))


### Fixed

* **Mattermost Plugin:** Load modals correctly ([#10744](https://github.com/ParabolInc/parabol/issues/10744)) ([976904e](https://github.com/ParabolInc/parabol/commit/976904e719237b3648111d615c9c03998ead1d8d))
* show invoices for enterprise customers ([#10748](https://github.com/ParabolInc/parabol/issues/10748)) ([3e72a5f](https://github.com/ParabolInc/parabol/commit/3e72a5f8713c4695d4abcab91d786a21f933f3a4))
* support edge case changeEmailDomain no users to update ([#10725](https://github.com/ParabolInc/parabol/issues/10725)) ([8c0c0db](https://github.com/ParabolInc/parabol/commit/8c0c0db6ad316235c4e956cc25ae069a61da38c0))

## [8.22.0](https://github.com/ParabolInc/parabol/compare/v8.21.1...v8.22.0) (2025-01-28)


### Added

* gifabol (tenor search) ([#10735](https://github.com/ParabolInc/parabol/issues/10735)) ([d893258](https://github.com/ParabolInc/parabol/commit/d8932586b9d581da46189826c26afa03ae536ef3))


### Fixed

* Check events is not null in stage timer modal ([#10720](https://github.com/ParabolInc/parabol/issues/10720)) ([8b581f4](https://github.com/ParabolInc/parabol/commit/8b581f41ebf49a599c50dab50b64a2cfbc5aa08f))
* Enter Key Functionality in the Response Editor when @ symbol is … ([#10699](https://github.com/ParabolInc/parabol/issues/10699)) ([cd3506d](https://github.com/ParabolInc/parabol/commit/cd3506d1ef6c669e8f8326380d85d2412ac87f05))
* simplify event timeline grouping logic ([#10727](https://github.com/ParabolInc/parabol/issues/10727)) ([f3a911d](https://github.com/ParabolInc/parabol/commit/f3a911d8dba65921a482f7fe791a7ad0c4eb804d))


### Changed

* **Mattermost:** Catch notification errors ([#10729](https://github.com/ParabolInc/parabol/issues/10729)) ([8e0502e](https://github.com/ParabolInc/parabol/commit/8e0502e3e588618eb936b271d8afdeeb931a4148))

## [8.21.1](https://github.com/ParabolInc/parabol/compare/v8.21.0...v8.21.1) (2025-01-22)


### Fixed

* React error on forgot password page ([#10717](https://github.com/ParabolInc/parabol/issues/10717)) ([8c8d600](https://github.com/ParabolInc/parabol/commit/8c8d6003a6e5e65674784f6f41897ab886c540b0))
* S3 bucket name used from the application configuration instead of infered from CDN_URL ([#10661](https://github.com/ParabolInc/parabol/issues/10661)) ([7f3051d](https://github.com/ParabolInc/parabol/commit/7f3051d6d82c44982d31d296875f834e2cad5a95))
* Tab button style ([#10715](https://github.com/ParabolInc/parabol/issues/10715)) ([216eb40](https://github.com/ParabolInc/parabol/commit/216eb40d8baa062a708275aebe933d921b2d3f27))


### Changed

* Add AWS_S3_BUCKET to .env.example ([#10718](https://github.com/ParabolInc/parabol/issues/10718)) ([001cf41](https://github.com/ParabolInc/parabol/commit/001cf41eed554c97c0d719b898258f83643bc2e7))

## [8.21.0](https://github.com/ParabolInc/parabol/compare/v8.20.1...v8.21.0) (2025-01-21)


### Added

* Add GraphQL notification settings for MS Teams and Mattermost ([#10694](https://github.com/ParabolInc/parabol/issues/10694)) ([5cdaba2](https://github.com/ParabolInc/parabol/commit/5cdaba2b32a27cf677a831cc8a834f4f6978b42a))
* add the `removeMultipleOrgUsers` mutation to support mass org user removal ([#10675](https://github.com/ParabolInc/parabol/issues/10675)) ([3044640](https://github.com/ParabolInc/parabol/commit/3044640b468f6e7966a0d55c7403be3519b44d10))
* **greetings:** add Finnish and Basque greetings and a new icebreaker ([#10693](https://github.com/ParabolInc/parabol/issues/10693)) ([41eb26f](https://github.com/ParabolInc/parabol/commit/41eb26fd30cdcf19dd0fba918aa79a51e38bd3fd))
* group timeline events by relative dates ([#10708](https://github.com/ParabolInc/parabol/issues/10708)) ([4b973a8](https://github.com/ParabolInc/parabol/commit/4b973a8b97f66e2dbdb7a4c191b18f0e770f5a59))
* notification settings UI ([#10695](https://github.com/ParabolInc/parabol/issues/10695)) ([0e79cdb](https://github.com/ParabolInc/parabol/commit/0e79cdbf8d48483ac1ca39267cf8029f3982f469))


### Fixed

* Lint Promises in conditions ([#10710](https://github.com/ParabolInc/parabol/issues/10710)) ([0fd8d8c](https://github.com/ParabolInc/parabol/commit/0fd8d8c26684aea90de44915fd913b48f34ffab9))
* remove imageuploadmenu ([#10705](https://github.com/ParabolInc/parabol/issues/10705)) ([de9002d](https://github.com/ParabolInc/parabol/commit/de9002d83d2b97f1330e96388244f05da635b1fc))


### Changed

* remove discussion summary ([#10690](https://github.com/ParabolInc/parabol/issues/10690)) ([bf8fc7e](https://github.com/ParabolInc/parabol/commit/bf8fc7e5739d313ee43b2d37b660e3e0ea77b306))

## [8.20.1](https://github.com/ParabolInc/parabol/compare/v8.20.0...v8.20.1) (2025-01-17)


### Fixed

* Create mass invitation tokens for specific meetings ([#10651](https://github.com/ParabolInc/parabol/issues/10651)) ([0516f8f](https://github.com/ParabolInc/parabol/commit/0516f8f5a88448abbf901861f1771823d88018f9))
* image placeholders in tiptap ([#10703](https://github.com/ParabolInc/parabol/issues/10703)) ([5c3f5f9](https://github.com/ParabolInc/parabol/commit/5c3f5f92bc69c8fa206dadb109d4621058a85d63))


### Changed

* make ai standups more concise and add context ([#10689](https://github.com/ParabolInc/parabol/issues/10689)) ([b67d07c](https://github.com/ParabolInc/parabol/commit/b67d07c0b2316fba638292b6c12f161a1e8660fc))

## [8.20.0](https://github.com/ParabolInc/parabol/compare/v8.19.0...v8.20.0) (2025-01-16)


### Added

* Add images to TipTap ([#10678](https://github.com/ParabolInc/parabol/issues/10678)) ([e62916f](https://github.com/ParabolInc/parabol/commit/e62916fcb78b4154ae3c6fdbff4a7e2ddbf537f7))
* update insight prompt ([#10674](https://github.com/ParabolInc/parabol/issues/10674)) ([ce489aa](https://github.com/ParabolInc/parabol/commit/ce489aa42b33b877438534335b9f029910f35be6))


### Fixed

* consolidate organizations sorting logic ([#10680](https://github.com/ParabolInc/parabol/issues/10680)) ([3d9b6d2](https://github.com/ParabolInc/parabol/commit/3d9b6d22e89edb08ee21b2214cbb7a6d97417575))

## [8.19.0](https://github.com/ParabolInc/parabol/compare/v8.18.1...v8.19.0) (2025-01-15)


### Added

* add SlashCommand to TipTap ([#10664](https://github.com/ParabolInc/parabol/issues/10664)) ([03d96e2](https://github.com/ParabolInc/parabol/commit/03d96e2fd33392522530b48455c9ae2a99ac69b5))
* added I Like, I Wish, I Wonder retrospective template ([#10650](https://github.com/ParabolInc/parabol/issues/10650)) ([795b436](https://github.com/ParabolInc/parabol/commit/795b436be9a0e524d693f01599f99f31536648a9))
* modified/added meta tags with new content ([#10652](https://github.com/ParabolInc/parabol/issues/10652)) ([9501494](https://github.com/ParabolInc/parabol/commit/9501494e2868a48cdb8a313b9db02a7e30ef56d3))


### Fixed

* kill mattermost plugin dev server on pm2 kill ([#10671](https://github.com/ParabolInc/parabol/issues/10671)) ([e73dc39](https://github.com/ParabolInc/parabol/commit/e73dc39d76ae795089163a7920aa7032047a90a4))
* Restrict Timeline Feed scrolling to its column on /me route ([#10649](https://github.com/ParabolInc/parabol/issues/10649)) ([052647f](https://github.com/ParabolInc/parabol/commit/052647fd029f59622e69038d30226831fdf321c6))
* Shorten chunk names for Mattermost plugin ([#10672](https://github.com/ParabolInc/parabol/issues/10672)) ([8af66f4](https://github.com/ParabolInc/parabol/commit/8af66f485be5f7de25fe8cfbe19e67547f334d5e))
* summary does not load indefinitely if there are no votes ([#10669](https://github.com/ParabolInc/parabol/issues/10669)) ([84b8d60](https://github.com/ParabolInc/parabol/commit/84b8d60e9d4be37004fdb2ea6e6c9a4355b38bd2))


### Changed

* **deps:** bump systeminformation from 5.23.5 to 5.23.14 ([#10626](https://github.com/ParabolInc/parabol/issues/10626)) ([f0d006f](https://github.com/ParabolInc/parabol/commit/f0d006f345fd72148d2ef2a6a916be9078063353))
* Upgrade [@mui](https://github.com/mui) dependencies ([#10627](https://github.com/ParabolInc/parabol/issues/10627)) ([18abb1a](https://github.com/ParabolInc/parabol/commit/18abb1a0df5ffc9262149d158a3b1e97309eaad0))

## [8.18.1](https://github.com/ParabolInc/parabol/compare/v8.18.0...v8.18.1) (2025-01-10)


### Fixed

* rebasing migrations ([#10666](https://github.com/ParabolInc/parabol/issues/10666)) ([d174162](https://github.com/ParabolInc/parabol/commit/d174162abeee217b4b567b65aa75468b834fe930))

# [8.18.0](https://github.com/ParabolInc/parabol/compare/v8.17.0...v8.18.0) (2025-01-10)


### Added

* rebase migrations, remove draft-js enitrely ([#10640](https://github.com/ParabolInc/parabol/issues/10640)) ([db4832f](https://github.com/ParabolInc/parabol/commit/db4832f02c5c37b9bfd98cae0854b82aac089775))


### Fixed

* move generate retro summaries mutation to public folder ([#10660](https://github.com/ParabolInc/parabol/issues/10660)) ([dead68c](https://github.com/ParabolInc/parabol/commit/dead68cb4f7f8aa40f955fdc1cdafe4fa9b51504))
* remove extra migration after rebase ([#10663](https://github.com/ParabolInc/parabol/issues/10663)) ([12afb74](https://github.com/ParabolInc/parabol/commit/12afb747eb8e71c9ae61019a2a888da2113050b3))
* Update mattermost-plugin version on release ([#10658](https://github.com/ParabolInc/parabol/issues/10658)) ([ddaa9b9](https://github.com/ParabolInc/parabol/commit/ddaa9b9b9666d3c9a557c6f52b236c5a29ce2013))

