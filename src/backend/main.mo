import Text "mo:base/Text";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Result "mo:base/Result";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Nat32 "mo:base/Nat32";
import Blob "mo:base/Blob";
import Hash "mo:base/Hash";

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
    avatar : ?Blob;
    location : ?Text;
    website : ?Text;
    socialLinks : [(Text, Text)];
    externalLinks : [(Text, Text)];
    skills : [Text];
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

  // Serializable version for stable storage
  public type SerializableRepository = {
    id : Text;
    name : Text;
    description : ?Text;
    owner : Principal;
    isPrivate : Bool;
    createdAt : Int;
    updatedAt : Int;
    files : [(Text, FileEntry)];
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
    repositories : [SerializableRepository];
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
  private stable var repositoriesEntries : [(Text, SerializableRepository)] = [];
  private stable var _nextRepositoryId : Nat = 1;
  private stable var repoCollaboratorsEntries : [(Text, [Principal])] = [];
  private stable var repoStarsEntries : [(Text, [Principal])] = [];
  private stable var userCredentialsEntries : [(Principal, [(Text, Text)])] = [];
  // Rate limiting
  private stable var userActionTimestamps : [(Principal, [Int])] = [];

  // In-memory storage
  private var users = HashMap.HashMap<Principal, User>(10, Principal.equal, Principal.hash);
  private var repositories = HashMap.HashMap<Text, Repository>(10, Text.equal, Text.hash);
  private var usernames = HashMap.HashMap<Text, Principal>(10, Text.equal, Text.hash);
  private var nextRepositoryId : Nat = 1;
  
  // Collaboration and social features
  private var repoCollaborators = HashMap.HashMap<Text, [Principal]>(10, Text.equal, Text.hash);
  private var repoStars = HashMap.HashMap<Text, [Principal]>(10, Text.equal, Text.hash);
  private var userCredentials = HashMap.HashMap<Principal, [(Text, Text)]>(10, Principal.equal, Principal.hash);
  
  // Rate limiting
  private var actionLimits = HashMap.HashMap<Principal, [Int]>(10, Principal.equal, Principal.hash);

  // Initialize nextRepositoryId from stable variable
  nextRepositoryId := _nextRepositoryId;

  // Conversion functions
  private func repositoryToSerializable(repo: Repository): SerializableRepository {
    {
      id = repo.id;
      name = repo.name;
      description = repo.description;
      owner = repo.owner;
      isPrivate = repo.isPrivate;
      createdAt = repo.createdAt;
      updatedAt = repo.updatedAt;
      files = Iter.toArray(repo.files.entries());
      stars = repo.stars;
      forks = repo.forks;
      language = repo.language;
      size = repo.size;
    };
  };

  private func serializableToRepository(serRepo: SerializableRepository): Repository {
    let filesMap = HashMap.HashMap<Text, FileEntry>(10, Text.equal, Text.hash);
    for ((path, file) in serRepo.files.vals()) {
      filesMap.put(path, file);
    };
    {
      id = serRepo.id;
      name = serRepo.name;
      description = serRepo.description;
      owner = serRepo.owner;
      isPrivate = serRepo.isPrivate;
      createdAt = serRepo.createdAt;
      updatedAt = serRepo.updatedAt;
      files = filesMap;
      stars = serRepo.stars;
      forks = serRepo.forks;
      language = serRepo.language;
      size = serRepo.size;
    };
  };

  // Helper functions
  private func generateRepositoryId() : Text {
    let id = "repo_" # Nat.toText(nextRepositoryId);
    nextRepositoryId += 1;
    id;
  };

  private func isValidUsername(username: Text): Bool {
    Text.size(username) >= 3 and Text.size(username) <= 20;
  };

  // Proper email validation function
  private func isValidEmail(email: Text): Bool {
    if (Text.size(email) < 5 or Text.size(email) > 254) {
      return false;
    };
    
    let chars = Text.toIter(email);
    var hasAt = false;
    var hasDot = false;
    var atCount = 0;
    var beforeAt = "";
    var afterAt = "";
    var foundAt = false;
    
    for (char in chars) {
      if (char == '@') {
        atCount += 1;
        foundAt := true;
        hasAt := true;
      } else if (not foundAt) {
        beforeAt := beforeAt # Text.fromChar(char);
      } else {
        afterAt := afterAt # Text.fromChar(char);
        if (char == '.') {
          hasDot := true;
        };
      };
    };
    
    // Basic validation rules
    atCount == 1 and hasAt and hasDot and 
    Text.size(beforeAt) >= 1 and Text.size(afterAt) >= 3 and
    Text.size(beforeAt) <= 64 and Text.size(afterAt) <= 253;
  };
  
  // Simple hash function for file integrity
  private func calculateFileHash(content: Blob): Text {
    let contentArray = Blob.toArray(content);
    var hash: Nat32 = 0;
    
    // Simple hash calculation
    for (byte in contentArray.vals()) {
      hash := hash * 31 + Nat32.fromNat(Nat8.toNat(byte));
    };
    
    // Add content size to make hash more unique
    hash := hash + Nat32.fromNat(content.size());
    
    // Convert to hex string
    Nat32.toText(hash);
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
  
  // Rate limiting function
  private func checkRateLimit(caller: Principal): Bool {
    let now = Time.now();
    let oneMinute = 60_000_000_000; // 1 minute in nanoseconds
    
    let recent = switch (actionLimits.get(caller)) {
      case null [];
      case (?actions) Array.filter(actions, func(timestamp: Int): Bool {
        now - timestamp < oneMinute;
      });
    };
    
    if (recent.size() >= 30) { // Max 30 actions per minute
      false;
    } else {
      let updated = Array.append(recent, [now]);
      actionLimits.put(caller, updated);
      true;
    };
  };
  
  // Input sanitization functions
  private func sanitizeText(input: Text): Text {
    var sanitized = Text.replace(input, #char '<', "");
    sanitized := Text.replace(sanitized, #char '>', "");
    sanitized := Text.replace(sanitized, #text "<script", "");
    sanitized := Text.replace(sanitized, #text "javascript:", "");
    sanitized;
  };
  
  private func isValidPath(path: Text): Bool {
    not Text.contains(path, #text "../") and 
    not Text.contains(path, #text "..\\") and
    not Text.contains(path, #text "~") and
    Text.size(path) > 0 and
    Text.size(path) <= 1000;
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
  public shared ({ caller }) func createRepository(request : CreateRepositoryRequest) : async Result<SerializableRepository, Error> {
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

    return #Ok(repositoryToSerializable(repository));
  };

  public shared query ({ caller }) func getRepository(id : Text) : async Result<SerializableRepository, Error> {
    switch (repositories.get(id)) {
      case null { return #Err(#NotFound("Repository not found")) };
      case (?repo) {
        if (canReadRepository(caller, repo)) {
          return #Ok(repositoryToSerializable(repo));
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
      hash = calculateFileHash(request.content);
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

  // Profile Management
  public shared ({ caller }) func updateProfile(
    profile : UserProfile
  ) : async Result<User, Error> {
    switch (users.get(caller)) {
      case null { return #Err(#NotFound("User not found")) };
      case (?user) {
        let updatedUser : User = {
          user with
          profile = profile;
          updatedAt = Time.now();
        };
        users.put(caller, updatedUser);
        return #Ok(updatedUser);
      };
    };
  };

  // Account Linking
  public shared ({ caller }) func linkExternalAccount(
    platform : Text,
    accountId : Text
  ) : async Result<Text, Error> {
    switch (users.get(caller)) {
      case null { return #Err(#NotFound("User not found")) };
      case (?user) {
        let currentCredentials = switch (userCredentials.get(caller)) {
          case null [];
          case (?creds) creds;
        };
        
        let credBuffer = Buffer.fromArray<(Text, Text)>(currentCredentials);
        credBuffer.add((platform, accountId));
        userCredentials.put(caller, Buffer.toArray(credBuffer));
        
        return #Ok("External account linked successfully");
      };
    };
  };

  public shared query ({ caller }) func getLinkedAccounts() : async Result<[(Text, Text)], Error> {
    switch (userCredentials.get(caller)) {
      case null { return #Ok([]) };
      case (?creds) { return #Ok(creds) };
    };
  };

  // Repository Collaboration
  public shared ({ caller }) func addCollaborator(
    repositoryId : Text,
    collaborator : Principal
  ) : async Result<Text, Error> {
    switch (repositories.get(repositoryId)) {
      case null { return #Err(#NotFound("Repository not found")) };
      case (?repo) {
        if (repo.owner != caller) {
          return #Err(#Forbidden("Only repository owner can add collaborators"));
        };
        
        let currentCollaborators = switch (repoCollaborators.get(repositoryId)) {
          case null [];
          case (?collab) collab;
        };
        
        // Check if already a collaborator
        if (Array.find<Principal>(currentCollaborators, func(p) { p == collaborator }) != null) {
          return #Err(#Conflict("User is already a collaborator"));
        };
        
        let collabBuffer = Buffer.fromArray<Principal>(currentCollaborators);
        collabBuffer.add(collaborator);
        repoCollaborators.put(repositoryId, Buffer.toArray(collabBuffer));
        
        return #Ok("Collaborator added successfully");
      };
    };
  };

  public shared query ({ caller }) func getCollaborators(
    repositoryId : Text
  ) : async Result<[Principal], Error> {
    switch (repositories.get(repositoryId)) {
      case null { return #Err(#NotFound("Repository not found")) };
      case (?repo) {
        if (not canReadRepository(caller, repo)) {
          return #Err(#Forbidden("Access denied"));
        };
        
        switch (repoCollaborators.get(repositoryId)) {
          case null { return #Ok([]) };
          case (?collab) { return #Ok(collab) };
        };
      };
    };
  };

  // Star/Unstar Repository
  public shared ({ caller }) func starRepository(
    repositoryId : Text
  ) : async Result<Text, Error> {
    switch (repositories.get(repositoryId)) {
      case null { return #Err(#NotFound("Repository not found")) };
      case (?repo) {
        if (not canReadRepository(caller, repo)) {
          return #Err(#Forbidden("Access denied"));
        };
        
        let currentStars = switch (repoStars.get(repositoryId)) {
          case null [];
          case (?stars) stars;
        };
        
        // Check if already starred
        if (Array.find<Principal>(currentStars, func(p) { p == caller }) != null) {
          return #Err(#Conflict("Repository already starred"));
        };
        
        let starBuffer = Buffer.fromArray<Principal>(currentStars);
        starBuffer.add(caller);
        repoStars.put(repositoryId, Buffer.toArray(starBuffer));
        
        // Update repository star count
        let updatedRepo : Repository = {
          repo with
          stars = repo.stars + 1;
          updatedAt = Time.now();
        };
        repositories.put(repositoryId, updatedRepo);
        
        return #Ok("Repository starred successfully");
      };
    };
  };

  public shared ({ caller }) func unstarRepository(
    repositoryId : Text
  ) : async Result<Text, Error> {
    switch (repositories.get(repositoryId)) {
      case null { return #Err(#NotFound("Repository not found")) };
      case (?repo) {
        let currentStars = switch (repoStars.get(repositoryId)) {
          case null { return #Err(#NotFound("Repository not starred")) };
          case (?stars) stars;
        };
        
        let starBuffer = Buffer.Buffer<Principal>(currentStars.size());
        for (star in currentStars.vals()) {
          if (star != caller) {
            starBuffer.add(star);
          };
        };
        
        if (starBuffer.size() == currentStars.size()) {
          return #Err(#NotFound("Repository not starred"));
        };
        
        repoStars.put(repositoryId, Buffer.toArray(starBuffer));
        
        // Update repository star count
        let newStarCount = if (repo.stars > 0) { repo.stars - 1 } else { 0 };
        let updatedRepo : Repository = {
          repo with
          stars = newStarCount;
          updatedAt = Time.now();
        };
        repositories.put(repositoryId, updatedRepo);
        
        return #Ok("Repository unstarred successfully");
      };
    };
  };

  // Fork Repository
  public shared ({ caller }) func forkRepository(
    repositoryId : Text,
    newName : ?Text
  ) : async Result<SerializableRepository, Error> {
    let user = switch (users.get(caller)) {
      case null { return #Err(#Unauthorized("User not registered")) };
      case (?user) { user };
    };
    
    switch (repositories.get(repositoryId)) {
      case null { return #Err(#NotFound("Repository not found")) };
      case (?originalRepo) {
        if (not canReadRepository(caller, originalRepo)) {
          return #Err(#Forbidden("Access denied"));
        };
        
        let forkName = switch (newName) {
          case null { originalRepo.name # "_fork" };
          case (?name) { name };
        };
        
        if (not isValidRepositoryName(forkName)) {
          return #Err(#BadRequest("Invalid fork name"));
        };
        
        let now = Time.now();
        let forkId = generateRepositoryId();
        
        // Copy files from original repository
        let forkFiles = HashMap.HashMap<Text, FileEntry>(10, Text.equal, Text.hash);
        for ((path, file) in originalRepo.files.entries()) {
          forkFiles.put(path, file);
        };
        
        let fork : Repository = {
          id = forkId;
          name = forkName;
          description = switch (originalRepo.description) {
            case null { ?("Fork of " # originalRepo.name) };
            case (?desc) { ?("Fork of " # originalRepo.name # ": " # desc) };
          };
          owner = caller;
          isPrivate = false; // Forks are public by default
          createdAt = now;
          updatedAt = now;
          files = forkFiles;
          stars = 0;
          forks = 0;
          language = originalRepo.language;
          size = originalRepo.size;
        };
        
        repositories.put(forkId, fork);
        
        // Update original repository fork count
        let updatedOriginal : Repository = {
          originalRepo with
          forks = originalRepo.forks + 1;
          updatedAt = now;
        };
        repositories.put(repositoryId, updatedOriginal);
        
        // Add fork to user's repositories
        let repoBuffer = Buffer.fromArray<Text>(user.repositories);
        repoBuffer.add(forkId);
        let updatedUser : User = {
          user with
          repositories = Buffer.toArray(repoBuffer);
          updatedAt = now;
        };
        users.put(caller, updatedUser);
        
        return #Ok(repositoryToSerializable(fork));
      };
    };
  };

  // List repositories with pagination
  public query ({ caller }) func listUserRepositories(
    username : ?Text,
    params : ?PaginationParams
  ) : async Result<RepositoryListResponse, Error> {
    let targetPrincipal = switch (username) {
      case null { caller };
      case (?name) {
        switch (usernames.get(name)) {
          case null { return #Err(#NotFound("User not found")) };
          case (?principal) { principal };
        };
      };
    };
    
    switch (users.get(targetPrincipal)) {
      case null { return #Err(#NotFound("User not found")) };
      case (?user) {
        let repoBuffer = Buffer.Buffer<SerializableRepository>(0);
        
        for (repoId in user.repositories.vals()) {
          switch (repositories.get(repoId)) {
            case null {}; // Skip if repository not found
            case (?repo) {
              if (canReadRepository(caller, repo)) {
                repoBuffer.add(repositoryToSerializable(repo));
              };
            };
          };
        };
        
        let allRepos = Buffer.toArray(repoBuffer);
        let totalCount = allRepos.size();
        
        // Apply pagination
        let (page, limit) = switch (params) {
          case null { (0, 10) };
          case (?p) { (p.page, p.limit) };
        };
        
        let startIndex = page * limit;
        let endIndex = Nat.min(startIndex + limit, totalCount);
        
        let paginatedRepos = if (startIndex >= totalCount) {
          [];
        } else {
          Array.tabulate<SerializableRepository>(
            endIndex - startIndex,
            func(i) { allRepos[startIndex + i] }
          );
        };
        
        let response : RepositoryListResponse = {
          repositories = paginatedRepos;
          totalCount = totalCount;
          hasMore = endIndex < totalCount;
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
    
    let repoBuffer = Buffer.Buffer<(Text, SerializableRepository)>(repositories.size());
    for ((id, repo) in repositories.entries()) {
      repoBuffer.add((id, repositoryToSerializable(repo)));
    };
    repositoriesEntries := Buffer.toArray(repoBuffer);
    
    usernamesEntries := Iter.toArray(usernames.entries());
    repoCollaboratorsEntries := Iter.toArray(repoCollaborators.entries());
    repoStarsEntries := Iter.toArray(repoStars.entries());
    userCredentialsEntries := Iter.toArray(userCredentials.entries());
  };

  system func postupgrade() {
    users := HashMap.fromIter<Principal, User>(
      usersEntries.vals(),
      usersEntries.size(),
      Principal.equal,
      Principal.hash,
    );

    let repoBuffer = Buffer.Buffer<(Text, Repository)>(repositoriesEntries.size());
    for ((id, serRepo) in repositoriesEntries.vals()) {
      repoBuffer.add((id, serializableToRepository(serRepo)));
    };
    
    repositories := HashMap.fromIter<Text, Repository>(
      Buffer.toArray(repoBuffer).vals(),
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

    repoCollaborators := HashMap.fromIter<Text, [Principal]>(
      repoCollaboratorsEntries.vals(),
      repoCollaboratorsEntries.size(),
      Text.equal,
      Text.hash,
    );

    repoStars := HashMap.fromIter<Text, [Principal]>(
      repoStarsEntries.vals(),
      repoStarsEntries.size(),
      Text.equal,
      Text.hash,
    );

    userCredentials := HashMap.fromIter<Principal, [(Text, Text)]>(
      userCredentialsEntries.vals(),
      userCredentialsEntries.size(),
      Principal.equal,
      Principal.hash,
    );

    usersEntries := [];
    repositoriesEntries := [];
    usernamesEntries := [];
    repoCollaboratorsEntries := [];
    repoStarsEntries := [];
    userCredentialsEntries := [];
  };
};
