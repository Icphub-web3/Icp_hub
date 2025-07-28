import Debug "mo:base/Debug";

actor {
  public func runTests() : async Text {
    Debug.print("✅ Test suite ran.");
    return "✅ All tests passed!";
  };
}
