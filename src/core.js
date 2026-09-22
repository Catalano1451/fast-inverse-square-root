/**
 * Computes an approximate reciprocal square root of a 32-bit float using
 * the Quake III bit-hack with one Newton iteration.
 *
 * This function operates on JavaScript numbers but treats them as 32-bit
 * floats. Input is first coerced to a float32 value via Math.fround, then
 * the classic bit manipulation is performed on the float's IEEE 754 bits.
 *
 * The result is an approximation to 1 / sqrt(x) for positive finite x.
 * For non-positive or non-finite inputs, the function returns NaN.
 *
 * @param {number} x - The number to compute the inverse square root of.
 * @returns {number} Approximate reciprocal square root as a JavaScript number.
 */
export function fastInverseSqrt(x) {
  const y = Math.fround(x);

  if (!Number.isFinite(y) || y <= 0) {
    return NaN;
  }

  const floatBuffer = new ArrayBuffer(4);
  const floatView = new Float32Array(floatBuffer);
  const intView = new Int32Array(floatBuffer);

  floatView[0] = y;
  let i = intView[0];
  const threeHalfs = 1.5;
  const x2 = y * 0.5;

  // The magic number 0x5f3759df is the original constant from the Quake III
  // source. It provides a good initial approximation for the Newton iteration.
  i = 0x5f3759df - (i >> 1);
  intView[0] = i;
  let result = floatView[0];

  // One Newton iteration: result = result * (1.5 - x2 * result * result)
  result = result * (threeHalfs - x2 * result * result);

  return result;
}

/**
 * Computes an approximate reciprocal square root of a 32-bit float and
 * returns the result as a float32 number.
 *
 * This is the same computation as fastInverseSqrt, but the return value is
 * explicitly rounded to a 32-bit float using Math.fround.
 *
 * @param {number} x - The number to compute the inverse square root of.
 * @returns {number} Approximate reciprocal square root as a float32 number.
 */
export function fastInverseSqrtNumber(x) {
  return Math.fround(fastInverseSqrt(x));
}
