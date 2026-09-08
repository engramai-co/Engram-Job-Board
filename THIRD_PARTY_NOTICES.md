# Third-party notices

The project's original code and research skill use the MIT license in [LICENSE](LICENSE). Dependencies are separate works under their own licenses; installing them does not relicense them.

The runtime dependencies in the release lockfile are:

| Package | License | Preserved text |
| --- | --- | --- |
| React | MIT | [License](LICENSES/react-MIT.txt) |
| React DOM | MIT | [License](LICENSES/react-dom-MIT.txt) |
| Scheduler | MIT | [License](LICENSES/scheduler-MIT.txt) |
| Apache ECharts | Apache-2.0 | [License](LICENSES/echarts-Apache-2.0.txt), [NOTICE](LICENSES/echarts-NOTICE.txt) |
| ECharts bundled D3-derived code | BSD-3-Clause | [License](LICENSES/echarts-d3-BSD.txt) |
| zrender | BSD-3-Clause | [License](LICENSES/zrender-BSD-3-Clause.txt) |
| tslib | 0BSD | [License](LICENSES/tslib-0BSD.txt), [Copyright](LICENSES/tslib-CopyrightNotice.txt) |

Development tools retain the licenses shipped in their installed packages. Run `pnpm licenses list` to inspect the installed dependency tree. Update these notices when changing bundled dependencies. Preserve the applicable notices when redistributing a built application, not only when redistributing this source repository.

No employer logos, third-party photographs, custom font files, CVs or private research documents are included. Typography uses fonts already available on the device; the app does not download webfonts.
