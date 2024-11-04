# Wikistats 2.0 https://maps.app.goo.gl/XaPeGUM4bZY9fDnv6

[Wikistats](http://stats.wikimedia.org/) is the public statistics website of the Wikimedia Foundation (WMF). Its main purpose is to add context and motivate our editor community by providing a set of metrics through which users can see the impact of their contributions in the projects they are a part of.

In [Wikistats 2.0](https://stats.wikimedia.org/v2) we are not only updating the website interface but we are also providing new access to all our edit data in an analytics-friendly form. The transition of relying on static, precomputed datasets generated periodically into APIs querying our data lake improves drastically (and fundamentally changes) the way, time and resources it takes to calculate edit metrics both for the WMF and the community.

## Local install for development

### Cloning the project

The minimum requirements to install the Wikistats UI are Node.js 8+, npm 6+, and git. The project is hosted in a [Phabricator repository](https://phabricator.wikimedia.org/source/wikistats/)

```bash
git clone https://gerrit.wikimedia.org/r/analytics/wikistats2
npm install
```

### Third-party UI elements

Wikistats uses many components from the Fomantic UI library.  This should build itself with gulp when it's first loaded.  If there are any changes to `semantic/src/site/globals/site.variables`, fomantic css will need to be rebuilt:

```bash
cd node_modules/fomantic-ui
./node_modules/gulp/bin/gulp.js build-css
```

### Generating the bundle

Last, you need to generate the Javascript bundle that contains the Wikistats project, its dependencies and the stylesheets. Assuming you want a development environment, you should run:

```bash
npm run dev
```

This command will set up a watcher that will rebuild the bundle each time a project file changes. The production environment won't minify the bundle so that code is readable within the browser developer tools. This will generate the static site in `./dist-dev` within your wikistats repository directory. In order to see the built site you need a simple http server such as python's SimpleHTTPServer

```bash
npm run server
```

The application should be now working in `localhost:5000`

## Tests

Tests are located in the `test` directory. We use Jest as our test runner. Running the following:

```bash
npm test
```

Additionally, there are smoke tests to be performed with each significant change to the codebase, which are described in [Analytics/Wikistats 2/Smoke testing](https://wikitech.wikimedia.org/wiki/Analytics/Wikistats_2/Smoke_Testing).

## Bug report and Feature request

Please fill this [Phabricator template](https://phabricator.wikimedia.org/maniphest/task/edit/?title=Wikistats%20Bug&projectPHIDs=Analytics-Wikistats,Analytics) to report a bug or request a new feature.

## Contributing and Deployment

Please read through our [contributing guidelines](https://wikitech.wikimedia.org/wiki/Analytics/Wikistats_2#Contributing_and_Deployment). Included are directions for code reviews, and notes on deployment.

## Built With

- [npm](https://npmjs.com) - Version 6+
- [Vue.js](https://vuejs.org/) — The web framework used
- [d3](https://d3js.org/) — Version 4+ for visualizations
- [CrossFilter](https://github.com/crossfilter/crossfilter) — For exploring large multivariate datasets in the browser

## Community

Get updates on Wikistats 2.0 development and chat with the project maintainers and community members.

- Chat with community members on [IRC](https://web.libera.chat/) server, in the `#wikimedia-analytics` channel.

## Copyright

All data, charts, and other content is available under the [Creative Commons CC0 dedication](https://creativecommons.org/publicdomain/zero/1.0/).
