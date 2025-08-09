import Types "./types";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Principal "mo:base/Principal";

actor {
  public query func healthCheck() : async Text {
    return "OK - Backend is running";
  };

  public query func greet(name: Text) : async Text {
    return "Hello, " # name # "!";
  };
}
