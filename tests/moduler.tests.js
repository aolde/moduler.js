/// <reference path="moduler.js" />
/// <reference path="qunit.js" />
var $fixture = $('#qunit-fixture');

QUnit.testStart(function (test) {
    moduler('app', {
        init: function () { }
    });
    //console.groupCollapsed(test.name);
});

QUnit.testDone(function (test) {
    for (var module in mo.modules) {
        if (module != 'register') {
            delete mo.modules[module];
        }
    }
    //console.groupEnd();
});


module("Register Module");

test("register an empty module", function () {
    moduler('test-module', {});

    ok(mo.modules['test-module'] != null, "Module should be registered");
});

//test("prevent adding module named 'register'", function () {
//    throws(function () {
//        moduler('register', {});
//    }, "throws when adding module named 'register'")
//});

test("register a module that has an 'init' method", function () {
    var initFired = false;

    moduler('test-module', {
        init: function () {
            initFired = true;
        }
    });

    mo.utils.addModuleToElement('#div1', 'test-module');

    notEqual(mo.utils.getModule('#div1', 'test-module'), null, 'Module is initalized')
    equal(initFired, true, "Init method has fired")
});

test("adding a second module to element", function () {
    var initFired = false;

    moduler('test-second-module', {
        init: function () {
            initFired = true;
        }
    });

    mo.utils.addModuleToElement('#app', 'test-second-module');

    notEqual(mo.utils.getModule('#app', 'test-second-module'), false, 'Module is initalized')
    equal(initFired, true, "Init method has fired")
});

test("adding a module two times to element should not run it twice", function () {
    expect(1);

    moduler('test-module', {
        init: function () {
            ok(true, 'Init fired');
        }
    });

    mo.utils.addModuleToElement('#div1', 'test-module');
    mo.utils.addModuleToElement('#div1', 'test-module');
});


module("Settings");

test("invalid formated settings attribute should throw error", function () {
    moduler('test-module', {
        init: function (module) {
            notEqual(module.settings, null);
        }
    });

    mo.utils.addModuleToElement('#div1', 'test-module', false);

    // properties without quotes are not valid in JSON
    $('#div1').attr('data-test-module', '{ hello: 1 }');

    throws(function () {
        mo.loadModules();
    }, "Throws error when invalid json");

});

test("settings is an empty object if no settings entered and no defaults", function () {
    moduler('test-module', {
        init: function (module) {
            notEqual(module.settings, null);
        }
    });

    mo.utils.addModuleToElement('#div1', 'test-module');
});

test("settings are unique to each element", function () {
    moduler('test-module', {
        init: function (module) {
            if (module.element.id == 'div1')
                equal(module.settings.name, 'Jane Doe');
            else
                equal(module.settings.name, 'Plain Joe');
        }
    });

    mo.utils.addModuleToElement('#div1', 'test-module', { name: 'Jane Doe' }, false);
    mo.utils.addModuleToElement('#div2', 'test-module', { name: 'Plain Joe' });
});

test("settings extend from default values", function () {
    moduler('test-module', {
        defaults: {
            name: 'Joe Doe',
            age: 30
        },
        init: function (module) {
            equal(module.settings.name, 'Jane Doe');
            equal(module.settings.age, 30);
        }
    });

    mo.utils.addModuleToElement('#div1', 'test-module', { name: 'Jane Doe' });
});

test("get settings for element and module", function () {
    moduler('test-module', {
        defaults: {
            name: 'Joe Doe',
            age: 30
        },
        init: function (module) { }
    });

    mo.utils.addModuleToElement('#div1', 'test-module', { name: 'Jane Doe' });

    var settings = mo.utils.getSettings('#div1', 'test-module');
    equal(settings.name, 'Jane Doe', 'Name is equal to Jane Doe');
    equal(settings.age, 30, 'Age is equal to 30');
});


module("Listen Events");

asyncTest("module with listen events", function () {
    moduler('test-module', {
        defaults: { name: 'Jane Doe' },
        init: function () { },

        listen: {
            helloWorld: mo.event(function (module, e, extraParameter) {
                ok(true, 'recived helloWorld event');
                equal(module.name, 'test-module', 'module name is populated');
                equal(module.element.id, 'div1', 'element object is populated');
                equal(module.$element.length, 1, '$element object is populated');
                equal(module.settings.name, 'Jane Doe', 'settings object is populated');
                equal(extraParameter, "hello", 'extra parameters is populated')
                equal(this, module.element, 'this and element are the same')
                start();
            })
        }
    });
    mo.utils.addModuleToElement('#div1', 'test-module');

    $('#div1').trigger('helloWorld', ['hello']);
});

asyncTest("calling event functions directly", function () {
    var testModule = moduler('test-module', {
        defaults: { name: 'Jane Doe' },
        init: function () { },

        listen: {
            helloWorld: mo.event(function (module, e, extraParameter) {
                ok(true, 'recived helloWorld event');
                equal(module.name, 'test-module', 'module name is populated');
                equal(module.element.id, 'div1', 'element object is populated');
                equal(module.$element.length, 1, '$element object is populated');
                equal(module.settings.name, 'Jane Doe', 'settings object is populated');
                equal(extraParameter, "hello", 'extra parameters is populated')
                equal(this, module.element, 'this and element are the same')
                start();
            })
        }
    });
    mo.utils.addModuleToElement('#div1', 'test-module');

    testModule.listen.helloWorld(mo.utils.getModule('#div1', 'test-module'), null, 'hello');
});


module("Change Tracking");

asyncTest("when adding elements to the DOM they should register automatically", function () {
    expect(2);

    moduler('test-module', {
        init: function () {
            ok(true, 'first init method was called');
        }
    });

    moduler('another-module', {
        init: function () {
            ok(true, 'second init method was called');
            start();
        }
    });

    $fixture.append('<div data-module="test-module"></div>')
    $fixture.find('#div2').html('<div data-module="another-module"></div>')
    $fixture.find('#div1').empty().remove();
});


module('Settings Syntax');

test('can parse boolean settings value', function () {
    var settings = Parser.parse('parsing: true')

    equal(settings.parsing, true);
});

test('can parse string settings value in double quotes', function () {
    var settings = Parser.parse('name: "Joe"')

    equal(settings.name, 'Joe');
});

test('can parse string settings value in single quotes', function () {
    var settings = Parser.parse("name: 'Joe'")

    equal(settings.name, 'Joe');
});

test('can parse numeric settings value', function () {
    var settings = Parser.parse("years: 10")

    equal(settings.years, 10);
});

test('can parse three properties', function () {
    var settings = Parser.parse("years: 10, name: 'Joe', male: true")

    equal(settings.years, 10);
    equal(settings.name, 'Joe');
    equal(settings.male, true);
});

test('can parse complex property', function () {
    var settings = Parser.parse("person: { name: 'Joe' }")

    equal(settings.person.name, 'Joe');
});

test('can parse complex property, with other properties', function () {
    var settings = Parser.parse("one: 1, person: { name: 'Joe' }, two: 2")

    equal(settings.person.name, 'Joe');
    equal(settings.one, 1);
    equal(settings.two, 2);
});

test('can parse deep complex property', function () {
    var settings = Parser.parse("person: { name: 'Joe', nested: { one: 1, two: 2 }}");

    equal(settings.person.name, 'Joe');
    equal(settings.nested.one, 1);
    equal(settings.nested.two, 2);
});

test('can parse array property', function () {
    var settings = Parser.parse("ages: [2, 5, 8]")

    equal($.isArray(settings.ages), true);
    equal(settings.ages.length, 3);
    equal(settings.ages[2], 8);
});


var Parser = {
    parse: function (value) {
        return Parser._parseInternal(value, {});
    },

    _parseInternal: function (value, object) {
        var currentPos = 0,
            nextColonPos = value.indexOf(':'),
            nextCommaPos = value.indexOf(',', nextColonPos),
            hasMoreProperties = false;

        if (nextCommaPos < 0) {
            nextCommaPos = value.length;
        } else {
            hasMoreProperties = true;
        }

        var propertyName = value.substring(currentPos, nextColonPos),
            propertyValue = value.substring(nextColonPos + 1, nextCommaPos);

        // trim propertyName for when there is space between comma and property name.
        propertyName = Parser.trimString(propertyName);
        propertyValue = Parser.trimString(propertyValue).replace(/'/g, '"');

        if (Parser.isComplexProperty(propertyValue)) {
            // remove "{" and "}" from propertyValue and then send it through parsing
            var trimmedComplexValue = propertyValue.substring(1, propertyValue.length - 1);
            object[propertyName] = Parser._parseInternal(trimmedComplexValue, {});
        } else {
            // use JSON to parse the propertyValue
            object[propertyName] = JSON.parse(propertyValue);
        }

        if (hasMoreProperties) {
            var remainingValue = value.substring(nextCommaPos + 1);
            return Parser._parseInternal(remainingValue, object);
        } else {
            return object;
        }
    },

    isComplexProperty: function (value) {
        // assumes that value has been trimmed before.
        return (value[0] === '{' && value[value.length-1] === '}');
    },

    trimString: function (value) {
        value = value.replace(/^\s\s*/, '');

        var whitespace = /\s/,
            i = value.length;
        
        while (whitespace.test(value.charAt(--i)));
        
        return value.slice(0, i + 1);
    }
}

