## The Sha2 package

[![ci](https://github.com/timohanke/motoko-sha2/actions/workflows/ci.yml/badge.svg)](https://github.com/timohanke/motoko-sha2/actions/workflows/ci.yml)

This package provides an implementation of the Sha2 family of hash functions implemented in Motoko. The supported algorithms are:

* sha224
* sha256
* sha512-224
* sha512-256
* sha384
* sha512

### Usage 

The code was derived from https://github.com/enzoh/motoko-sha/. In contrast to the functions there, this code can hash type `Blob`. 
More generally, it can hash type `Iter<Nat8>`. Hence, for `data` of any of the types `Blob`, `[Nat8]` or `[var Nat8]` one can make the same call `SHA2.fromIter(#sha512,data.vals())`. For type `Blob` there is also the shorthand form `SHA2.fromBlob(#sha512,data)`. The allowed algorithms are `#sha224, #sha256, #sha384, #sha512, #sha512_224, #sha512_256`.
