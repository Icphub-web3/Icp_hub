import Text "mo:base/Text";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Result "mo:base/Result";

actor ICPHub {
  // Define basic types internally to avoid dependencies
  public type Result<T, E> = { #Ok : T; #Err : E };
  
  public type Error = {
    #NotFound : Text;
    #Unauthorized : Text;
    #BadRequest : Text;
    #Forbidden : Text;
    #Conflict : Text;
    #InternalError : Text;
  };
  
  public type UserProfile = {
    displayName : ?Text;
    bio : ?Text;
    avatar : ?Text;
    location : ?Text;
    website : ?Text;
    socialLinks : [(Text, Text)];
  };
  
  public type User = {
    principal : Principal;
    username : Text;
    email : ?Text;
    profile : UserProfile;
    repositories : [Text];
    createdAt : Int;
    updatedAt : Int;
  };
  
  public type FileEntry = {
    path : Text;
    content : Blob;
    size : Nat;
    hash : Text;
    version : Nat;
    lastModified : Int;
    author : Principal;
    commitMessage : ?Text;
  };
  
  public type Repository = {
    id : Text;
    name : Text;
    description : ?Text;
    owner : Principal;
    isPrivate : Bool;
    createdAt : Int;
    updatedAt : Int;
    files : HashMap.HashMap<Text, FileEntry>;
    stars : Nat;
    forks : Nat;
    language : ?Text;
    size : Nat;
  };
  
  public type RegisterUserRequest = {
    username : Text;
    email : ?Text;
    profile : UserProfile;
  };
  
  public type CreateRepositoryRequest = {
    name : Text;
    description : ?Text;
    isPrivate : Bool;
    license : ?Text;
  };
  
  public type UploadFileRequest = {
    repositoryId : Text;
    path : Text;
    content : Blob;
    commitMessage : Text;
  };
  
  public type PaginationParams = {
    page : Nat;
    limit : Nat;
  };
  
  public type RepositoryListResponse = {
    repositories : [Repository];
    totalCount : Nat;
    hasMore : Bool;
  };
  
  public type FileListResponse = {
    files : [FileEntry];
    totalCount : Nat;
    path : Text;
  };
  
  public type MemoryStats = {
    totalMemory : Nat;
    usedMemory : Nat;
    availableMemory : Nat;
    heapSize : Nat;
    cycles : Nat;
  };

  // Stable variables for upgrade persistence
  private stable var usernamesEntries : [(Text, Principal)] = [];
  private stable var usersEntries : [(Principal, User)] = [];
  private stable var repositoriesEntries : [(Text, Repository)] = [];
  private stable var nextRepositoryId : Nat = 1;

  // In-memory storage
  private var users = HashMap.HashMap<Principal, User>(10, Principal.equal, Principal.hash);
  private var repositories = HashMap.HashMap<Text, Repository>(10, Text.equal, Text.hash);
  private var usernames = HashMap.HashMap<Text, Principal>(10, Text.equal, Text.hash);

  // Helper functions
  private func generateRepositoryId() : Text {
    let id = "repo_" # Nat.toText(nextRepositoryId);
    nextRepositoryId += 1;
    id;
  };

  private func isValidUsername(username: Text): Bool {
    Text.size(username) >= 3 and Text.size(username) <= 20;
  };

  private func isValidEmail(email: Text): Bool {
    Text.contains(email, #char '@');
  };

  private func isValidRepositoryName(name: Text): Bool {
    Text.size(name) >= 1 and Text.size(name) <= 100;
  };

  private func canReadRepository(caller: Principal, repo: Repository): Bool {
    not repo.isPrivate or repo.owner == caller;
  };

  private func canWriteRepository(caller: Principal, repo: Repository): Bool {
    repo.owner == caller;
  };

  // User Management APIs
  public shared ({ caller }) func registerUser(
    request : RegisterUserRequest
  ) : async Result<User, Error> {
    if (users.get(caller) != null) {
      return #Err(#Conflict("This Principal is already registered."));
    };

    if (not isValidUsername(request.username)) {
      return #Err(#BadRequest("Invalid username format."));
    };

    if (usernames.get(request.username) != null) {
      return #Err(#Conflict("Username is already taken."));
    };

    switch (request.email) {
      case null {};
      case (?email) {
        if (not isValidEmail(email)) {
          return #Err(#BadRequest("Invalid email format."));
        };
      };
    };

    let now = Time.now();
    let newUser : User = {
      principal = caller;
      username = request.username;
      email = request.email;
      profile = request.profile;
      repositories = [];
      createdAt = now;
      updatedAt = now;
    };

    users.put(caller, newUser);
    usernames.put(newUser.username, newUser.principal);

    return #Ok(newUser);
  };

  public query func getUser(principal : Principal) : async Result<User, Error> {
    switch (users.get(principal)) {
      case null #Err(#NotFound("User not found"));
      case (?user) #Ok(user);
    };
  };

  // Repository Management APIs
  public shared ({ caller }) func createRepository(request : CreateRepositoryRequest) : async Result<Repository, Error> {
    let user = switch (users.get(caller)) {
      case null { return #Err(#Unauthorized("User not registered")) };
      case (?user) { user };
    };

    if (not isValidRepositoryName(request.name)) {
      return #Err(#BadRequest("Invalid repository name."));
    };

    if (switch (request.description) { case null false; case (?d) Text.size(d) > 500 }) {
      return #Err(#BadRequest("Description cannot exceed 500 characters."));
    };

    let now = Time.now();
    let repositoryId = generateRepositoryId();

    let repository : Repository = {
      id = repositoryId;
      name = request.name;
      description = request.description;
      owner = caller;
      isPrivate = request.isPrivate;
      createdAt = now;
      updatedAt = now;
      files = HashMap.HashMap<Text, FileEntry>(10, Text.equal, Text.hash);
      stars = 0;
      forks = 0;
      language = null;
      size = 0;
    };

    repositories.put(repositoryId, repository);

    let repoBuffer = Buffer.fromArray<Text>(user.repositories);
    repoBuffer.add(repositoryId);
    let updatedUser : User = {
      user with
      repositories = Buffer.toArray(repoBuffer);
      updatedAt = now;
    };
    users.put(caller, updatedUser);

    return #Ok(repository);
  };

  public shared query ({ caller }) func getRepository(id : Text) : async Result<Repository, Error> {
    switch (repositories.get(id)) {
      case null { return #Err(#NotFound("Repository not found")) };
      case (?repo) {
        if (canReadRepository(caller, repo)) {
          return #Ok(repo);
        } else {
          return #Err(#Forbidden("Access denied"));
        };
      };
    };
  };

  public shared ({ caller }) func uploadFile(
    request : UploadFileRequest
) : async Result<FileEntry, Error> {
    let repo = switch (repositories.get(request.repositoryId)) {
      case null { return #Err(#NotFound("Repository not found")) };
      case (?repo) { repo };
    };

    if (not canWriteRepository(caller, repo)) {
      return #Err(#Forbidden("You do not have write permission for this repository."));
    };

    let contentSize = request.content.size();
    if (contentSize > 10_000_000) {
      return #Err(#BadRequest("File size cannot exceed 10 MB."));
    };

    let now = Time.now();
    
    let fileEntry : FileEntry = {
      path = request.path;
      content = request.content;
      size = contentSize;
      hash = "hash_placeholder";
      version = 1;
      lastModified = now;
      author = caller;
      commitMessage = ?request.commitMessage;
    };

    repo.files.put(request.path, fileEntry);

    let updatedRepo : Repository = {
      repo with
      updatedAt = now;
      size = repo.size + contentSize;
    };

    repositories.put(request.repositoryId, updatedRepo);

    return #Ok(fileEntry);
  };

  public shared query ({ caller }) func getFile(repositoryId : Text, path : Text) : async Result<FileEntry, Error> {
    switch (repositories.get(repositoryId)) {
      case null { return #Err(#NotFound("Repository not found")) };
      case (?repo) {
        if (not canReadRepository(caller, repo)) {
          return #Err(#Forbidden("Access denied"));
        };

        switch (repo.files.get(path)) {
          case null { return #Err(#NotFound("File not found")) };
          case (?file) { return #Ok(file) };
        };
      };
    };
  };

  public shared query ({ caller }) func listFiles(
    repositoryId : Text,
    path : ?Text,
  ) : async Result<FileListResponse, Error> {
    switch (repositories.get(repositoryId)) {
      case null { return #Err(#NotFound("Repository not found")) };
      case (?repo) {
        if (not canReadRepository(caller, repo)) {
          return #Err(#Forbidden("Access denied"));
        };

        let searchPath = switch (path) {
          case null "";
          case (?p) p;
        };

        let filesBuffer = Buffer.Buffer<FileEntry>(0);
        for ((filePath, file) in repo.files.entries()) {
          if (Text.startsWith(filePath, #text searchPath)) {
            filesBuffer.add(file);
          };
        };
        let files = Buffer.toArray(filesBuffer);

        let response : FileListResponse = {
          files = files;
          totalCount = files.size();
          path = searchPath;
        };

        return #Ok(response);
      };
    };
  };

  // System monitoring
  public query func getMemoryStats() : async MemoryStats {
    {
      totalMemory = 0;
      usedMemory = 0;
      availableMemory = 0;
      heapSize = 0;
      cycles = 0;
    };
  };

  // Health check
  public query func health() : async Bool {
    true;
  };

  // System functions for upgrades
  system func preupgrade() {
    usersEntries := Iter.toArray(users.entries());
    repositoriesEntries := Iter.toArray(repositories.entries());
    usernamesEntries := Iter.toArray(usernames.entries());
  };

  system func postupgrade() {
    users := HashMap.fromIter<Principal, User>(
      usersEntries.vals(),
      usersEntries.size(),
      Principal.equal,
      Principal.hash,
    );

    repositories := HashMap.fromIter<Text, Repository>(
      repositoriesEntries.vals(),
      repositoriesEntries.size(),
      Text.equal,
      Text.hash,
    );

    usernames := HashMap.fromIter<Text, Principal>(
      usernamesEntries.vals(),
      usernamesEntries.size(),
      Text.equal,
      Text.hash,
    );

    usersEntries := [];
    repositoriesEntries := [];
    usernamesEntries := [];
  };
};
