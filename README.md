moduler.js
==========

JavaScript library for binding modules to DOM elements

## Getting Started

Get the [latest version](https://github.com/simplyio/moduler.js/releases) from the releases in Github and include the moduler.js in your HTML page. jQuery is a prerequisite for moduler.js to work.

## Quick Example

1. Create a new module type:

	(function () {
	    "use strict";

	    var moduleObj = moduler('hello-world', {
	        defaults: {
	            message: 'Hello ',
	        },
	        
	        init: function (module) {
	        	module.$element.click(function() {
	        		alert(module.settings.message + module.$element.text());
	        	});
	        }
	    });
	})();

2. Apply it to an element:

	<div>
		<span data-module="hello-world" data-hello-world="message: 'Hey '">Peter Griffin</span>
	</div>

3. Click on "Peter Griffin" and an alert box will appear saying "Hey Peter Griffin" because we overrided the default message ("Hello ").

## Browser Support

Tested in the following browsers, but will likely work in all modern browsers.

- Internet Explorer 8 and later.
- Chrome, latest.
- Firefox, latest.

## Documentation

- [Creating your first module](https://github.com/simplyio/moduler.js/wiki/Creating-your-first-module)
- [Explanation of a module](https://github.com/simplyio/moduler.js/wiki/Example-module-explained)

## Issues

Report bugs through the [issue list](https://github.com/simplyio/moduler.js/issues) on Github.

## Tests

The QUnit testing framework is used to test most of moduler.js's features. You can run them by opening tests/tests.html. 

## License

Moduler.js is freely distributable under the terms of the MIT license.