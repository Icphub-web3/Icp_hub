import Iter "mo:base/Iter";
import Nat8 "mo:base/Nat8";
import Array "mo:base/Array";
import IterExt "../src";

let buf = IterExt.BlockBuffer<Nat8>(64);

let iter1 = Iter.range(1,10);
assert(buf.fill(Iter.map(iter1, Nat8.fromNat)) == 10);
assert(buf.isFull() == false);
assert(buf.get(0) == 1);
assert(buf.get(9) == 10);
let arr_fwd = buf.toArray(#fwd);
assert(arr_fwd.size() == 10);
assert(Array.equal<Nat8>(arr_fwd, [1,2,3,4,5,6,7,8,9,10] : [Nat8], Nat8.equal));
let arr_bwd = buf.toArray(#bwd);
assert(arr_bwd.size() == 10);
assert(Array.equal<Nat8>(arr_bwd, [10,9,8,7,6,5,4,3,2,1] : [Nat8], Nat8.equal));

let iter2 = Iter.range(1,100);
assert(buf.fill(Iter.map(iter2, Nat8.fromNat)) == 54);
assert(buf.isFull() == true);
assert(buf.get(63) == 54);
assert(buf.toArray(#fwd).size() == 64);
