# fast-inverse-sqrt

Computes an approximate reciprocal square root of a 32-bit float using the Quake III bit-hack with one Newton iteration.

```js
import { fastInverseSqrt, fastInverseSqrtNumber } from './src/index.js';

console.log(fastInverseSqrt(4)); // ~0.5
console.log(fastInverseSqrtNumber(2)); // ~0.7071 as a float32
```

## Why this library exists

The reciprocal square root appears in vector normalization, lighting calculations, and other graphics operations where exactness is less important than speed. The Quake III approach replaces an expensive square root and division with integer bit manipulation and a single Newton refinement step, producing a result accurate to about 0.2% relative error. This library provides that approximation for JavaScript code that needs the same trade-off.

Input is treated as a 32-bit float via `Math.fround` before the bit hack is applied. The result is a JavaScript number containing the approximate value. `fastInverseSqrtNumber` additionally rounds the result to a float32, which is useful when the caller needs a value that is exactly representable as a float32.

## Edge cases

Non-positive and non-finite inputs return `NaN`. This includes `0`, `-0`, negative numbers, `Infinity`, `-Infinity`, and `NaN`. The implementation does not attempt to handle these cases, as the reciprocal square root is undefined for them.
