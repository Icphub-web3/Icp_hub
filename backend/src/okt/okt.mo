import Array "mo:base/Array";
import Principal "mo:base/Principal";

actor {
  // Token metadata
  let name = "OpenKey Token";
  let symbol = "OKT";
  let decimals = 8;
  let totalSupplyValue : Nat = 100_000_000 * (10 ** decimals);

  // Owner (replace with your II principal)
  let owner_result = Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai");
  let owner : Principal =
    switch (owner_result) {
      case (?p) p;
      case null { Principal.fromBlob(blob ""); };
    };

  // Balance storage
  var balances : [(Principal, Nat)] = [(owner, totalSupplyValue)];

  // Get balance of an account
  public query func balanceOf(account : Principal) : async Nat {
    var sum : Nat = 0;
    for ((principal, amount) in Array.vals(balances)) {
      if (Principal.equal(principal, account)) {
        sum += amount;
      };
    };
    sum;
  };

  // Get total supply
  public query func totalSupply() : async Nat {
    totalSupplyValue;
  };

  // Get token name
  public query func getName() : async Text {
    name;
  };

  // Get symbol
  public query func getSymbol() : async Text {
    symbol;
  };

  // Mint tokens (owner only)
  public shared ({ caller }) func mint(to : Principal, amount : Nat) : async Nat {
    assert (caller == owner);
    let value = amount * (10 ** decimals);
    balances := Array.append<(Principal, Nat)>(balances, [(to, value)]);
    value;
  };
}
