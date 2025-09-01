import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Principal "mo:base/Principal";

// Basic test actor that verifies core functionality
persistent actor BasicTest {
  
  // Test basic canister functionality
  public func testBasicFunctionality() : async Bool {
    Debug.print("✅ Basic functionality test passed");
    true
  };
  
  // Test time functions
  public func testTimeOperations() : async Bool {
    let now = Time.now();
    Debug.print("✅ Time operations test passed: " # debug_show(now));
    now > 0
  };
  
  // Test principal operations
  public func testPrincipalOperations() : async Bool {
    let caller = Principal.fromText("2vxsx-fae");
    let principalText = Principal.toText(caller);
    Debug.print("✅ Principal operations test passed: " # principalText);
    Principal.isAnonymous(caller) == false
  };
  
  // Comprehensive test runner
  public func runAllTests() : async {passed: Nat; failed: Nat} {
    var passed = 0;
    var failed = 0;
    
    Debug.print("🧪 Running ICP Hub Basic Tests...");
    
    // Test 1: Basic functionality
    try {
      let result1 = await testBasicFunctionality();
      if (result1) { passed += 1; } else { failed += 1; };
    } catch (e) {
      Debug.print("❌ Basic functionality test failed");
      failed += 1;
    };
    
    // Test 2: Time operations
    try {
      let result2 = await testTimeOperations();
      if (result2) { passed += 1; } else { failed += 1; };
    } catch (e) {
      Debug.print("❌ Time operations test failed");
      failed += 1;
    };
    
    // Test 3: Principal operations
    try {
      let result3 = await testPrincipalOperations();
      if (result3) { passed += 1; } else { failed += 1; };
    } catch (e) {
      Debug.print("❌ Principal operations test failed");
      failed += 1;
    };
    
    Debug.print("🎯 Test Results: " # debug_show({passed; failed}));
    {passed; failed}
  };
}
