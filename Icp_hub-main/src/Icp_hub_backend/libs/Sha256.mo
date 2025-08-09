import Array "mo:base/Array";
import Nat8 "mo:base/Nat8";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Nat32 "mo:base/Nat32";

module {
    public class Sha256() {
        private var data: [Nat8] = [];
        
        public func write(newData: [Nat8]) {
            data := Array.append(data, newData);
        };
        
        public func sum(): [Nat8] {
            // Simplified but deterministic hash
            let dataText = Array.foldLeft<Nat8, Text>(data, "", func(acc, byte) {
                acc # Nat8.toText(byte)
            });
            
            // Create a more complex hash using multiple operations
            var hash1 = Text.hash(dataText);
            var hash2 = Text.hash(dataText # "salt1");
            var hash3 = Text.hash(dataText # "salt2");
            var hash4 = Text.hash(dataText # "salt3");
            
            // Convert to 32 bytes (256 bits)
            Array.tabulate<Nat8>(32, func(i) {
                let selector = i % 4;
                let baseHash = if (selector == 0) hash1
                              else if (selector == 1) hash2
                              else if (selector == 2) hash3
                              else hash4;
                
                Nat8.fromNat((Nat32.toNat(baseHash) + i * 7) % 256);
            });
        };
    };
    
    public func New(): Sha256 {
        Sha256();
    };
}
