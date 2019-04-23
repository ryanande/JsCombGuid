# JsCombGuid

[![npm version](https://badge.fury.io/js/jscombguid.svg)](https://badge.fury.io/js/jscombguid)

A simple JavaScript Comb Guid Generator.

No guarantees it's perfect!

That being said, we have run tests generating 100,000 ids and not having any duplicates.
Guids are generated based on current date/ time and this data is used to create the sequential unique identifiers.

Primary concept of the code was sparked within this discussion [http://stackoverflow.com/a/8809472/173949](http://stackoverflow.com/a/8809472/173949).

## Getting Started

### Installing

Pretty simple implementation, simply import the module, and you're off an running!

```bash
npm install jscombguid
```

And cheap example usage;

```javascript
import generateCombGuid from 'jscombguid'

console.log(generateCombGuid());
```

## Running the tests

The library source includes some straight forward mocha tests and a duplicate check test which executes 10,000 cycles of guid generation check for duplicates being created. These tests sre located in the test/index.test.js file.

To execute the tests execute the following line of code in your fav tool.

```bash
npm run test
```

.nyc_output directory will have the coverage reports outputted to the coverage directory.
To view this report, and you have `http-server`, a handy basic insta web server, you can instal it and simply run;

```bash
npm i -g http-server
```

Then fire it up and run it post the test execution;

```bash
http-server ./coverage/lcov-report/
```

and check out the server site at [http://127.0.0.1:8080](http://127.0.0.1:8080)

## Built With

* [momentjs](http://www.momentjs.com) - used in working with date time to generate the combs (direct dependency)
* [mocha](https://maven.apache.org/) - unsed in the unit testing of the simple function
* [instabul](https://istanbul.js.org/) - used to validate test coverage and reporting
* [eslint](https://eslint.org/) - used for housekeeping and sanity
* [babel](https://babeljs.io/) - used to bust down the code, we aren't doing anything that would fully constitute this however

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Big thanks to [@thetinomen](https://twitter.com/thetinomen) he refactored out the sophmoric code...
