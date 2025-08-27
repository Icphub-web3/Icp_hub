module {
  public type Repo = {
    id : Nat;
    name : Text;
    owner : Text;
  };

  private var repos : [Repo] = [];
  private var nextId : Nat = 0;

  public func createRepo(name : Text, owner : Text) : async Repo {
    let repo = { id = nextId; name; owner };
    repos := Array.append(repos, [repo]);
    nextId += 1;
    repo
  };

  public func getRepo(id : Nat) : async ?Repo {
    Array.find<Repo>(repos, func (r) { r.id == id })
  };

  public func updateRepo(id : Nat, name : Text) : async Bool {
    var updated = false;
    repos := Array.map<Repo, Repo>(repos, func (r) {
      if (r.id == id) {
        updated := true;
        { id = r.id; name; owner = r.owner }
      } else {
        r
      }
    });
    updated
  };

  public func deleteRepo(id : Nat) : async Bool {
    let before = repos.size();
    repos := Array.filter<Repo>(repos, func (r) { r.id != id });
    before != repos.size()
  };
}
