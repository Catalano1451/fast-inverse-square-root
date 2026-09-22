import { test } from 'node:test';
import assert from 'node:assert/strict';

import { fastInverseSqrt, fastInverseSqrtNumber } from '../src/core.js';

function assertClose(actual, expected, tolerance, message) {
  const diff = Math.abs(actual - expected);
  const maxDiff = Math.abs(expected) * tolerance;
  assert.ok(
    diff <= maxDiff,
    `${message || 'values not close'}: expected ${expected}, got ${actual}, diff ${diff}, max allowed diff ${maxDiff}`
  );
}

test('fastInverseSqrt approximates 1/sqrt(x) for normal positive numbers', () => {
  const cases = [
    [1, 1],
    [4, 0.5],
    [16, 0.25],
    [2, 0.7071067811865476],
    [0.25, 2],
    [100, 0.1],
    [0.01, 10]
  ];

  for (const [input, expected] of cases) {
    const result = fastInverseSqrt(input);
    // The bit hack plus one Newton iteration typically gives relative error
    // below 0.2% for the float32 range.
    assertClose(result, expected, 0.002, `fastInverseSqrt(${input})`);
  }
});

test('fastInverseSqrt handles positive subnormal inputs', () => {
  const x = 1e-40;
  const result = fastInverseSqrt(x);
  assert.ok(Number.isFinite(result), 'result should be finite');
  assert.ok(result > 0, 'result should be positive');
  // The bit hack does not maintain the same relative accuracy for subnormal
  // inputs because Math.fround maps them to zero or loses precision.
  assertClose(result, 1 / Math.sqrt(x), 1, 'fastInverseSqrt(1e-40)');
});

test('fastInverseSqrt returns NaN for zero and negative inputs', () => {
  assert.ok(Number.isNaN(fastInverseSqrt(0)), 'zero should be NaN');
  assert.ok(Number.isNaN(fastInverseSqrt(-0)), 'negative zero should be NaN');
  assert.ok(Number.isNaN(fastInverseSqrt(-1)), 'negative one should be NaN');
  assert.ok(Number.isNaN(fastInverseSqrt(-100)), 'negative hundred should be NaN');
});

test('fastInverseSqrt returns NaN for non-finite inputs', () => {
  assert.ok(Number.isNaN(fastInverseSqrt(Infinity)), 'Infinity should be NaN');
  assert.ok(Number.isNaN(fastInverseSqrt(-Infinity)), '-Infinity should be NaN');
  assert.ok(Number.isNaN(fastInverseSqrt(NaN)), 'NaN should be NaN');
});

test('fastInverseSqrt handles large finite float32 values', () => {
  const x = 3.4e38; // near max float32
  const result = fastInverseSqrt(x);
  assert.ok(Number.isFinite(result), 'result should be finite');
  assert.ok(result > 0, 'result should be positive');
  assertClose(result, 1 / Math.sqrt(x), 0.002, 'fastInverseSqrt(3.4e38)');
});

test('fastInverseSqrtNumber returns a float32 number', () => {
  const result = fastInverseSqrtNumber(2);
  assert.ok(Number.isFinite(result), 'result should be finite');
  assert.ok(result > 0, 'result should be positive');
  // Should be exactly a float32 value, so fround should be identity.
  assert.equal(Math.fround(result), result, 'result should be a float32 value');
  assertClose(result, 1 / Math.sqrt(2), 0.002, 'fastInverseSqrtNumber(2)');
});

test('fastInverseSqrtNumber returns NaN for invalid inputs', () => {
  assert.ok(Number.isNaN(fastInverseSqrtNumber(-1)), 'negative should be NaN');
  assert.ok(Number.isNaN(fastInverseSqrtNumber(0)), 'zero should be NaN');
  assert.ok(Number.isNaN(fastInverseSqrtNumber(Infinity)), 'Infinity should be NaN');
});

test('fastInverseSqrt is deterministic for repeated calls', () => {
  const first = fastInverseSqrt(3.14);
  const second = fastInverseSqrt(3.14);
  assert.equal(first, second, 'same input should produce same output');
});

test('fastInverseSqrt approximates for many values within tolerance', () => {
  const inputs = [0.1, 0.5, 0.9, 1.1, 2.2, 3.3, 5.5, 7.7, 10, 100, 1000, 1e10, 1e20];
  for (const x of inputs) {
    const result = fastInverseSqrt(x);
    const expected = 1 / Math.sqrt(x);
    assertClose(result, expected, 0.002, `fastInverseSqrt(${x})`);
  }
});
