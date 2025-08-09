// canisters/backend/main.mo
import Array "mo:base/Array";
import Text "mo:base/Text";
import Option "mo:base/Option";
import Iter "mo:base/Iter";

actor Backend {
  // Storage for key-value pairs
  stable var storage : [(Text, Text)] = [];
  
  // Public function to store data
  public func store(key : Text, value : Text) : async () {
    // Check if key already exists
    let existingIndex = Array.indexOf<(Text, Text)>(
      storage,
      func (k, _) { k == key }
    );
    
    switch (existingIndex) {
      case (?index) {
        // Update existing entry
        storage := Array.tabulate<(Text, Text)>(
          storage.size(),
          func i {
            if (i == index) { (key, value) } else { storage[i] }
          }
        );
      };
      case null {
        // Add new entry
        storage := Array.append(storage, [(key, value)]);
      };
    };
  };
  
  // Public query to retrieve data
  public query func retrieve(key : Text) : async ?Text {
    let item = Array.find<(Text, Text)>(
      storage,
      func (k, _) { k == key }
    );
    
    switch (item) {
      case (?(_, value)) { ?value };
      case null { null };
    };
  };
  
  // Public query to list all keys
  public query func listKeys() : async [Text] {
    Array.map<(Text, Text), Text>(
      storage,
      func (k, _) { k }
    );
  };
  
  // Public query to get storage size
  public query func storageSize() : async Nat {
    storage.size();
  };
}
