## The iterext Package

[![ci](https://github.com/timohanke/motoko-iterext/actions/workflows/ci.yml/badge.svg)](https://github.com/timohanke/motoko-iterext/actions/workflows/ci.yml)

Extensions for the Motoko Iter package

### Reading multiple values at once

Sometimes it is required to multiple values at once from an iterator. The `Iter` package provides the function `next` which only gets one value, if available. 

Moreover, it cannot be known in advance how many values an interator has available. The `Iter` package provides the function `size` but calling it will consume and discard all values from the iterator, i.e. the values cannot be obtained anymore after calling `size`.

In this extension package we provide a fixed length buffer. The buffer provides a method `fill` which can be called on an iterator. Then the buffer will be filled with values from the iterator until the buffer is full or the iterator is exhausted. If the buffer is full then it can be later reset and used again to be filled from the same iterator. If the iterator is exhausted but the buffer not yet full then the buffer can be continued to be filled from the current fill level onwards with values from another iterator.

Example:
```
import Iter "mo:base/Iter";
import IterExt "iterext.mo";
let buffer : BlockBuffer<Nat> = BlockBuffer(64);
let iter = Iter.range(1,100);
let n = buffer.fill(iter);
let a : [Nat8] = buffer.toArray(#fwd);
assert (n == a.size()); 
```
This will create an array `a` of length `64` filled with `1,2,...,64`.

Other methods are:

* `reset()`: Resets the fill level to the beginning. Subsequent `fill` will overwrite values already in the buffer.
* `refill(iter)`: Shorthand for `reset(); fill(iter);`.
* `isFull()`: Returns a `Bool` indicating whether the buffer is full or not.
* `get(i)`: Get the i-th value in the buffer.
