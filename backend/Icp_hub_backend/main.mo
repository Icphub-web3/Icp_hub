import Debug "mo:base/Debug";
import Text "mo:base/Text";

actor {
  public func greet(name: Text) : async Text {
    Debug.print("Hello, " # name);
    return "Hello, " # name # "!";
  };
}

