import Array "mo:base/Array";
import Nat8 "mo:base/Nat8";
import Text "mo:base/Text";
import Char "mo:base/Char";
import Nat32 "mo:base/Nat32";

module {
    public func encode(bytes: [Nat8]): Text {
        let hexChars = "0123456789abcdef";
        let hexArray = Text.toArray(hexChars);
        var result = "";
        
        for (byte in bytes.vals()) {
            let high = Nat8.toNat(byte) / 16;
            let low = Nat8.toNat(byte) % 16;
            result #= Text.fromChar(hexArray[high]);
            result #= Text.fromChar(hexArray[low]);
        };
        result;
    };
    
    public func decode(hex: Text): ?[Nat8] {
        let chars = Text.toArray(hex);
        if (chars.size() % 2 != 0) return null;
        
        let result = Array.tabulate<Nat8>(chars.size() / 2, func(i) {
            let high = charToHex(chars[i * 2]);
            let low = charToHex(chars[i * 2 + 1]);
            Nat8.fromNat((high * 16) + low);
        });
        ?result;
    };
    
    private func charToHex(c: Char): Nat {
        let code = Nat32.toNat(Char.toNat32(c));
        if (code >= 48 and code <= 57) { // '0'-'9'
            code - 48
        } else if (code >= 65 and code <= 70) { // 'A'-'F'
            code - 65 + 10
        } else if (code >= 97 and code <= 102) { // 'a'-'f'
            code - 97 + 10
        } else {
            0
        };
    };
}
