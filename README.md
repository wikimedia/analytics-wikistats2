# Wikistats 2.0
[Wikistats](http://stats.wikimedia.org/) is the public statistics website of the Wikimedia Foundation. Its main purpose is to add context and motivate our editor community by providing a set of metrics through which users can see the impact of their contributions in the projects they are a part of.

In [Wikistats 2.0](https://stats.wikimedia.org/v2) we are not only updating the website interface but we are also providing new access to all our edit data in an analytics-friendly form. The transition of relying on static, precomputed datasets generated periodically into APIs querying our data lake improves drastically (and fundamentally changes) the way, time and resources it takes to calculate edit metrics both for the WMF and the community.

## Local install for development
### Cloning the project
The minimum requirements to install the Wikistats UI are Node.js (with the npm package manager) and Git. The project is hosted in a [Phabricator repository](https://phabricator.wikimedia.org/source/wikistats/)
```
git clone https://gerrit.wikimedia.org/r/analytics/wikistats2
npm install
```

### Third-party UI elements
Wikistats uses many components from the Semantic UI library, which requires a special initialization with gulp when installing the project:
```
npm install -g gulp
cd semantic
gulp build
```

### Generating the bundle
Last, you need to generate the Javascript bundle that contains the Wikistats project, its dependencies and the stylesheets. Assuming you want a development environment, you should run:
```
npm run dev
```
This command will set up a watcher that will rebuild the bundle each time a project file changes. The production environment won't minify the bundle so that code is readable within the browser developer tools. This will generate the static site in ./dist-dev within your wikistats repository directory. In order to see the built site you need a simple http server such as python's SimpleHTTPServer
```
python -m SimpleHTTPServer 5000
```
The application should be now working in `localhost:5000`

## Tests
Tests are located in the `test` directory. We use Jasmine as our testing library and Karma as the test runner. Running the following:
```
npm test
```
will initialize a karma watcher that will run the webpack bundler each time a test change, and evaluate the whole test suite, printing out any failures in the console. Beware the by default, npm test will use Google Chrome as the testing browser. If you're using a different browser or environment you should change it in `karma.conf.js`
Additionally, there are smoke tests to be performed with each significant change to the codebase, which are described in [Analytics/Wikistats 2/Smoke testing](https://wikitech.wikimedia.org/wiki/Analytics/Wikistats_2/Smoke_Testing).

## Bug report and Feature request
Please fill this [Phabricator template](https://phabricator.wikimedia.org/maniphest/task/edit/?title=Wikistats%20Bug&projectPHIDs=Analytics-Wikistats,Analytics) to report a bug or request a new feature.

## Contributing and Deployment
Please read through our [contributing guidelines](https://wikitech.wikimedia.org/wiki/Analytics/Wikistats_2#Contributing_and_Deployment). Included are directions for code reviews, and notes on deployment.

## Built With
- [Vue.js](https://vuejs.org/) - The web framework used
- [d3](https://d3js.org/) - Version 4+ for visualizations
- [CrossFilter](https://github.com/crossfilter/crossfilter) - For exploring large multivariate datasets in the browser

## Community
Get updates on Wikistats 2.0 development and chat with the project maintainers and community members.
- Chat with community members on [IRC](https://webchat.freenode.net/) server, in the `#wikimedia-analytics` channel.

## Copyright
All data, charts, and other content is available under the [Creative Commons CC0 dedication](https://creativecommons.org/publicdomain/zero/1.0/).
