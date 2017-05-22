/* global test, expect, describe, beforeAll, beforeEach, document */

/*
npm install --save-dev babel-jest regenerator-runtime
npm install --save-dev babel-preset-es2015 babel-polyfill babel-preset-stage-3
For a complete list of matchers, check out the reference docs: https://facebook.github.io/jest/docs/expect.html
*/

import Nightmare from 'nightmare';

const sum = require('./sum');

/**
 * ########################
 * ####                ####
 * #### Using Matchers ####
 * ####                ####
 * ########################
 */

/**
 * First simple test
 */
test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});

/**
 * toBe matcher match exact equality (uses ===)
 */
test('two plus two is four', () => {
  expect(2 + 2).toBe(4);
});

/**
 * toEqual use for matching objects
 * toEqual recursively checks every field of an object or array
 */
test('object assigment', () => {
  const data = {
    one: 1,
  };
  data.two = 2;
  expect(data).toEqual({ one: 1, two: 2 });
});

/**
 * Truthiness:
 *
 * - toBeNull matches only null
 * - toBeUndefined matches only undefined
 * - toBeDefined is the opposite of toBeUndefined
 * - toBeTruthy matches anything that an if statement treats as true
 * - toBeFalsy matches anything that an if statement treats as false
 *
 */
test('null', () => {
  const n = null;
  expect(n).toBeNull();
  expect(n).toBeDefined();
  expect(n).not.toBeUndefined();
  expect(n).not.toBeTruthy();
  expect(n).toBeFalsy();
});

test('zero', () => {
  const z = 0;
  expect(z).not.toBeNull();
  expect(z).toBeDefined();
  expect(z).not.toBeUndefined();
  expect(z).not.toBeTruthy();
  expect(z).toBeFalsy();
});

/**
 * Numbers:
 *
 * - toBeGreaterThan
 * - toBeGreaterThanOrEqual
 * - toBeLessThan
 * - toBeLessThanOrEqual
 *
 * toBe and toEqual are equivalent for numbers
 *
 */
test('two plus two', () => {
  const value = 2 + 2;
  expect(value).toBeGreaterThan(3);
  expect(value).toBeGreaterThanOrEqual(3.5);
  expect(value).toBeLessThan(5);
  expect(value).toBeLessThanOrEqual(4.5);
  expect(value).toBe(4);
  expect(value).toEqual(4);
});

/**
 * For floating point equality,
 * use toBeCloseTo instead of toEqual,
 * because you don't want a test to depend on a tiny rounding error.
 */
test('adding floating point numbers', () => {
  const value = 0.1 + 0.2;
  expect(value).not.toBe(0.3);
  expect(value).toBeCloseTo(0.3);
});

/**
 * Strings:
 *
 * - check strings against regular expressions with toMatch
 *
 */
test('there is no I in team', () => {
  expect('team').not.toMatch(/I/);
});

test('there is "stop" in Christoph', () => {
  expect('Christoph').toMatch(/stop/);
});

/**
 * Arrays:
 *
 * - check if an array contains a particular item using toContain
 *
 */
test('the shopping list has beer on it', () => {
  const shoppingList = [
    'diapers',
    'kleenex',
    'trash bags',
    'paper towels',
    'beer',
  ];
  expect(shoppingList).toContain('beer');
});

/**
 * Exceptions:
 *
 * - toThrow
 *
 */
test('test exception throw', () => {
  function ConfigError(message) {
    return message;
  }
  ConfigError.prototype = Error.prototype;
  const fn = () => {
    throw new ConfigError();
  };
  expect(fn).toThrow();
});

/**
 * ###################################
 * ####                           ####
 * #### Testing Asynchronous Code ####
 * ####                           ####
 * ###################################
 */

function fetchData(callback) {
  const data = 'peanut butter';
  return callback(data);
}

function fetchDataPromiseResolve() {
  return new Promise((resolve, reject) => {
    // We call resolve(...) when what we were doing async succeeded, and reject(...)
    // when it failed. In this example, we use setTimeout(...) to simulate async
    // code. In reality, you will probably be using something like XHR or an HTML5
    // API.
    setTimeout(() => {
      resolve('peanut butter'); // Yay! Everything went well!
    }, 250);
  });
}

function fetchDataPromiseError() {
  return new Promise((resolve, reject) => {
    throw new Error('error');
  });
}

/**
 * Callbacks:
 *
 * Instead of putting the test in a function with an empty argument,
 * use a single argument called done.
 * Jest will wait until the done callback is called before finishing the test.
 */
test('test async fetch with callback', (done) => {
  function callback(data) {
    expect(data).toBe('peanut butter');
    done();
  }

  fetchData(callback);
});

function fetchDataPromiseResolveReject(flag) {
  return new Promise((resolve, reject) => {
    if (flag) {
      setTimeout(() => {
        resolve('peanut butter');
      }, 250);
    }
    setTimeout(() => {
      reject('error');
    }, 250);
  });
}

/**
 * Promises:
 *
 * Return a promise from your test,
 * and Jest will wait for that promise to resolve.
 * If the promise is rejected, the test will automatically fail.
 */
test('test async fetch with promise', () => {
  expect.assertions(1);
  return fetchDataPromiseResolve().then((data) => {
    expect(data).toBe('peanut butter');
  });
});

test('the fetch fails with an error', () => {
  expect.assertions(1);
  return fetchDataPromiseError().catch((error) => {
    expect(error.message).toMatch('error');
  });
});

test('fetch resolved', () => {
  expect.assertions(1);
  return expect(fetchDataPromiseResolveReject(true)).resolves.toBe(
    'peanut butter',
  );
});

test('fetch rejected', () => {
  expect.assertions(1);
  return expect(fetchDataPromiseResolveReject(false)).rejects.toMatch('error');
});

test('the data is peanut butter', async () => {
  expect.assertions(1);
  await expect(fetchDataPromiseResolveReject(true)).resolves.toBe(
    'peanut butter',
  );
});

test('the fetch fails with an error', async () => {
  expect.assertions(1);
  await expect(fetchDataPromiseResolveReject(false)).rejects.toMatch('error');
});

/**
 * ############################
 * ####                    ####
 * #### Setup and Teardown ####
 * ####                    ####
 * ############################
 */

/**
 * Scoping
 *
 * By default, the before and after blocks apply to every test in a file.
 * You can also group tests together using a describe block.
 * When they are inside a describe block,
 * the before and after blocks only apply to the tests within that describe block.
 *
 */

/**
 * One-Time Setup
 *
 * Use beforeAll and afterAll to handle this situation
 *
 */
describe('this is describe block', () => {
  let initializedObject = null;

  beforeAll(() => {
    initializedObject = {};
    initializedObject.message = 'hello world';
  });

  test('message is "hello world"', () => {
    expect(initializedObject.message).toMatch('hello world');
  });

  test('message is not "hello, world!"', () => {
    expect(initializedObject.message).not.toMatch('hello, world!');
  });
});

/**
 * Repeating Setup For Many Tests
 *
 * If you have some work you need to do repeatedly for many tests,
 * you can use beforeEach and afterEach.
 *
 */
describe('this is another describe block', () => {
  let counterString = '';
  let i = 0;

  beforeEach(() => {
    counterString = `counter = ${i}`;
    i += 1;
  });

  test('counter is 0', () => {
    expect(counterString).toMatch('counter = 0');
  });

  test('counter is 1', () => {
    expect(counterString).toMatch('counter = 1');
  });
});

/**
 * General Advice
 *
 * If a test is failing,
 * one of the first things to check should be whether the
 * test is failing when it's the only test that runs.
 * In Jest it's simple to run only one test - just temporarily
 * change that test command to a test.only:
 *
 * test.only('two plus two is four', () => {
 *  expect(2 + 2).toBe(4);
 * });
 *
 */

/**
 * ############################
 * ####                    ####
 * #### Jest and Nightmare ####
 * ####                    ####
 * ############################
 */

test('first nightmare test', async () => {
  expect.assertions(1);
  const nightmare = Nightmare({ show: true });
  const page = await nightmare.goto('http://google.hr');
  const text = await nightmare.evaluate(() => document.body.textContent).end();

  expect(text).toContain('Google');
});
