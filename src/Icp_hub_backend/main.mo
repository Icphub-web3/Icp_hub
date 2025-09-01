import Types "./types";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Debug "mo:base/Debug";
import Nat "mo:base/Nat";
import Buffer "mo:base/Buffer";
import Utils "./utils/utils";
import Option "mo:base/Option";
import _Order "mo:base/Order";
import Int "mo:base/Int";
import Float "mo:base/Float";
import _Timer "mo:base/Timer";
import _Prim "mo:prim";
import State "./models/state_model";
import User "./controllers/user_controller";
import Repository "./controllers/repository_controller";
import Search "./controllers/search_controller";
import CollaboratorManager "./controllers/collaborator_controller";
import Governance "./controllers/governance_controller";
import Auth "./controllers/auth_controller";
import GitOps "./services/git_operations_service";
import ChainFusion "./services/chain_fusion_service";
import Incentives "./services/incentives_service";
import Storage "./services/storage_service";
import Config "./config/app_config";

persistent actor ICPHub {
  // Type aliases for cleaner code
  type User = Types.User;
  type Repository = Types.Repository;
  type FileEntry = Types.FileEntry;
  type Result<T, E> = Types.Result<T, E>;
  type Error = Types.Error;
  type CreateRepositoryRequest = Types.CreateRepositoryRequest;
  type UploadFileRequest = Types.UploadFileRequest;
  type RegisterUserRequest = Types.RegisterUserRequest;

  // Persistent state using stable var
  stable var stableUsers : [(Principal, User)] = [];
  stable var stableRepositories : [(Text, Repository)] = [];
  stable var stableUsernames : [(Text, Principal)] = [];
  stable var stableNextRepositoryId : Nat = 1;

  // Upgrade hooks
  system func pre_upgrade() {
    stableUsers := Iter.toArray(users.entries());
    stableRepositories := Iter.toArray(repositories.entries());
    stableUsernames := Iter.toArray(usernames.entries());
    stableNextRepositoryId := nextRepositoryId;
  };

  system func post_upgrade() {
    users := HashMap.HashMap<Principal, User>(10, Principal.equal, Principal.hash);
    for ((k, v) in stableUsers.vals()) { users.put(k, v); };
    repositories := HashMap.HashMap<Text, Repository>(10, Text.equal, Text.hash);
    for ((k, v) in stableRepositories.vals()) { repositories.put(k, v); };
    usernames := HashMap.HashMap<Text, Principal>(10, Text.equal, Text.hash);
    for ((k, v) in stableUsernames.vals()) { usernames.put(k, v); };
    nextRepositoryId := stableNextRepositoryId;
  };
  type UpdateRepositoryRequest = Types.UpdateRepositoryRequest;
  type MemoryStats = Types.MemoryStats;
  type RepositoryListResponse = Types.RepositoryListResponse;
  type FileListResponse = Types.FileListResponse;
  type PaginationParams = Types.PaginationParams;
  type UpdateUserProfileRequest = Types.UpdateUserProfileRequest;
  type SerializableRepository = Types.SerializableRepository;
  type SerializableSearchResults = Types.SerializableSearchResults;
  type DeploymentRecord = Types.DeploymentRecord;
  
  // File tree types
  type FileTreeNode = {
    path: Text;
    name: Text;
    isFolder: Bool;
    size: Nat;
    lastModified: Int;
    children: [FileTreeNode];
  };
  
  type FileTreeResponse = {
    repositoryId: Text;
    tree: [FileTreeNode];
    totalFiles: Nat;
    totalFolders: Nat;
    totalSize: Nat;
  };

  // Collaborator types
  type AddCollaboratorRequest = CollaboratorManager.AddCollaboratorRequest;
  type UpdateCollaboratorRequest = CollaboratorManager.UpdateCollaboratorRequest;
  type RemoveCollaboratorRequest = CollaboratorManager.RemoveCollaboratorRequest;
  type CollaboratorListRequest = CollaboratorManager.CollaboratorListRequest;
  type CollaboratorInfo = CollaboratorManager.CollaboratorInfo;
  type CollaboratorListResponse = CollaboratorManager.CollaboratorListResponse;

  // Governance types
  type ProposalId = Governance.ProposalId;
  type VotingPower = Governance.VotingPower;
  type ProposalStatus = Governance.ProposalStatus;
  type ProposalType = Governance.ProposalType;
  type Vote = Governance.Vote;
  type VoteRecord = Governance.VoteRecord;
  type Proposal = Governance.Proposal;
  type GovernanceConfig = Governance.GovernanceConfig;
  type GovernanceToken = Governance.GovernanceToken;
  type VotingStats = Governance.VotingStats;
  type CreateProposalRequest = Governance.CreateProposalRequest;
  type CastVoteRequest = Governance.CastVoteRequest;
  type ProposalListRequest = Governance.ProposalListRequest;
  type ProposalListResponse = Governance.ProposalListResponse;
  type AddDiscussionPostRequest = Governance.AddDiscussionPostRequest;
  type DiscussionPost = Governance.DiscussionPost;

  // Auth types
  type SessionToken = Auth.SessionToken;
  type ApiKey = Auth.ApiKey;
  type ApiPermission = Auth.ApiPermission;
  type AuthMethod = Auth.AuthMethod;
  type AuthContext = Auth.AuthContext;
  type Permission = Auth.Permission;

  // Git operations types
  type CommitRequest = GitOps.CommitRequest;
  type FileAction = GitOps.FileAction;
  type DiffResult = GitOps.DiffResult;
  type MergeRequest = GitOps.MergeRequest;
  type MergeConflict = GitOps.MergeConflict;
  type MergeResult = GitOps.MergeResult;
  type BranchRequest = GitOps.BranchRequest;
  type TagRequest = GitOps.TagRequest;
  type Tag = GitOps.Tag;
  type GitLog = GitOps.GitLog;
  type CloneRequest = GitOps.CloneRequest;
  type GitStatus = GitOps.GitStatus;

  // Chain types
  type ChainType = Types.ChainType;
  type DeploymentConfig = Types.DeploymentConfig;
  type ChainConfig = Types.ChainConfig;

  // ChainFusion types
  type DeployContractRequest = ChainFusion.DeployContractRequest;
  type CrossChainMessage = ChainFusion.CrossChainMessage;
  type BitcoinNetwork = ChainFusion.BitcoinNetwork;
  type BitcoinAddress = ChainFusion.BitcoinAddress;
  type Satoshi = ChainFusion.Satoshi;

  // Incentives types
  type Token = Incentives.Token;
  type TokenAmount = Incentives.TokenAmount;
  type RewardType = Incentives.RewardType;
  type RewardTier = Incentives.RewardTier;
  type Reward = Incentives.Reward;
  type RewardStatus = Incentives.RewardStatus;
  type Bounty = Incentives.Bounty;
  type BountyStatus = Incentives.BountyStatus;
  type BountySubmission = Incentives.BountySubmission;
  type DifficultyLevel = Incentives.DifficultyLevel;
  type StakePosition = Incentives.StakePosition;
  type LeaderboardEntry = Incentives.LeaderboardEntry;
  type Treasury = Incentives.Treasury;
  type ContributionMetrics = Incentives.ContributionMetrics;

  // Storage types
  type StorageProvider = Storage.StorageProvider;
  type StorageLocation = Storage.StorageLocation;
  type FileMetadata = Storage.FileMetadata;
  type UploadRequest = Storage.UploadRequest;
  type DownloadRequest = Storage.DownloadRequest;
  type StorageStats = Storage.StorageStats;
  type IPFSConfig = Storage.IPFSConfig;
  type PinningService = Storage.PinningService;
  type PinStatus = Storage.PinStatus;

  // Search types
  type SearchScope = Types.SearchScope;
  type SearchSortBy = Types.SortBy;
  type SearchFilter = Types.SearchFilter;
  type SearchRequest = Types.SearchRequest;
  type RepositorySearchResult = Types.RepositorySearchResult;
  type UserSearchResult = Types.UserSearchResult;
  type FileSearchResult = Types.FileSearchResult;
  type SearchResults = Types.SearchResults;
  type CombinedSearchResults = Types.CombinedSearchResults;

  // Upload options
  public type UploadOptions = {
    useIPFS: Bool;
    autoDeploy: Bool;
    encrypt: Bool;
    compress: Bool;
    providers: [Storage.StorageProvider];
  };

  // CORE MANAGERS
  private transient let stateManager = State.StateManager();
  private transient let userManager = User.UserManager(stateManager);
  private transient let repositoryManager = Repository.RepositoryManager(stateManager);
  private transient let searchManager = Search.SearchManager(stateManager, userManager, repositoryManager);

  // SUPPORTING MANAGERS
  private transient let incentiveSystem = Incentives.IncentiveSystem();
  private transient let ipfsConfig = Config.ipfsConfig;
  private transient var storageManager = Storage.StorageManager(ipfsConfig);
  private transient var governanceState = Governance.GovernanceState();
  private transient var sessionManager = Auth.SessionManager();
  private transient var apiKeyManager = Auth.ApiKeyManager();

  // Stable variables for upgrade persistence
  private var usernamesEntries : [(Text, Principal)] = [];
  private var usersEntries : [(Principal, User)] = [];
  private var repositoriesEntries : [(Text, SerializableRepository)] = [];
  private var nextRepositoryId : Nat = 1;
  private var deploymentsEntries : [(Text, [DeploymentRecord])] = [];

  // In-memory deployments storage (could be moved to state manager in future)
  private transient var deployments = HashMap.HashMap<Text, [Types.DeploymentRecord]>(10, Text.equal, Text.hash);

  private var storageManagerData: ?{
        fileMetadata: [(Text, FileMetadata)];
        stats: StorageStats;
        pinningServices: [(PinningService, Text)];
    } = null;

  private var governanceStateData : ?{
    proposals : [(ProposalId, Proposal)];
    governanceTokens : [(Principal, GovernanceToken)];
    config : GovernanceConfig;
    treasury : TokenAmount;
    nextProposalId : ProposalId;
  } = null;

  private var sessionManagerData : ?[(Text, SessionToken)] = null;
  private var apiKeyManagerData : ?{
    apiKeys : [(Text, ApiKey)];
    keysByPrincipal : [(Principal, [Text])];
  } = null;

  private var stableIncentiveData : ?{
    token : Token;
    balances : [(Principal, TokenAmount)];
    rewards : [(Text, Reward)];
    rewardConfigs : [(RewardType, Incentives.RewardConfig)];
    bounties : [(Text, Bounty)];
    stakes : [(Principal, [StakePosition])];
    contributionMetrics : [(Text, ContributionMetrics)];
    treasury : Treasury;
  } = null;

  private transient let ADMIN_PRINCIPALS = [
    "rdmx6-jaaaa-aaaah-qcaiq-cai", // Replace with actual admin principal
  ];

  // System functions for upgrades
  system func preupgrade() {
    // Get stable data from state manager
    let stableState = stateManager.prepareForUpgrade();
    usersEntries := stableState.usersEntries;
    repositoriesEntries := stableState.repositoriesEntries;
    usernamesEntries := stableState.usernamesEntries;
    nextRepositoryId := stableState.nextRepoId;
    
    // Prepare other modules for upgrade
    governanceStateData := ?governanceState.preupgrade();
    sessionManagerData := ?sessionManager.getAllSessions();
    apiKeyManagerData := ?apiKeyManager.getUpgradeData();
    deploymentsEntries := Iter.toArray(deployments.entries());
    stableIncentiveData := ?incentiveSystem.preupgrade();
    storageManagerData := ?storageManager.preupgrade();
  };

  system func postupgrade() {
    // Restore state manager from stable storage
    stateManager.restoreFromUpgrade(
      usersEntries,
      repositoriesEntries,
      usernamesEntries,
      nextRepositoryId
    );

    // Clear stable storage
    usersEntries := [];
    repositoriesEntries := [];
    usernamesEntries := [];
    
    // Restore deployments
    deployments := HashMap.fromIter<Text, [DeploymentRecord]>(
      deploymentsEntries.vals(),
      deploymentsEntries.size(),
      Text.equal,
      Text.hash,
    );
    deploymentsEntries := [];

    // Restore other modules
    switch (governanceStateData) {
      case null {};
      case (?data) {
        governanceState.postupgrade(data);
        governanceStateData := null;
      };
    };
    
    switch (sessionManagerData) {
      case (?data) {
        sessionManager.restoreSessions(data);
        sessionManagerData := null;
      };
      case null {};
    };
    
    switch (apiKeyManagerData) {
      case (?data) {
        apiKeyManager.restoreData(data);
        apiKeyManagerData := null;
      };
      case null {};
    };

    switch (storageManagerData) {
      case (?data) {
        storageManager.postupgrade(data);
        storageManagerData := null;
      };
      case null {};
    };
    
    switch (stableIncentiveData) {
      case (?data) {
        incentiveSystem.postupgrade(data);
        stableIncentiveData := null;
      };
      case null {
        incentiveSystem.init();
      };
    };
  };

  // Helper functions
  private func isAdmin(caller : Principal) : Bool {
    Array.find<Text>(ADMIN_PRINCIPALS, func(p) { p == Principal.toText(caller) }) != null;
  };

  private func addDeploymentRecord(repositoryId : Text, deployment : DeploymentRecord) {
    switch (deployments.get(repositoryId)) {
      case (null) {
        deployments.put(repositoryId, [deployment]);
      };
      case (?existing) {
        let updated = Array.append(existing, [deployment]);
        deployments.put(repositoryId, updated);
      };
    };
  };

  // USER MANAGEMENT APIs

  public shared ({ caller }) func registerUser(
    request : RegisterUserRequest
  ) : async Result<User, Error> {
    userManager.registerUser(caller, request)
  };

  public query func getUser(principal : Principal) : async Result<User, Error> {
    userManager.getUser(principal)
  };

  public shared ({ caller }) func updateUser(
    request : UpdateUserProfileRequest
  ) : async Result<User, Error> {
    userManager.updateUser(caller, request)
  };

  // REPOSITORY MANAGEMENT APIs

  public shared ({ caller }) func createRepository(request : CreateRepositoryRequest) : async Result<SerializableRepository, Error> {
    repositoryManager.createRepository(caller, request)
  };

  public shared query ({ caller }) func getRepository(id : Text) : async Result<SerializableRepository, Error> {
    repositoryManager.getRepository(caller, id)
  };

  public shared query ({ caller }) func listRepositories(
    owner : Principal,
    params : ?PaginationParams,
  ) : async Result<RepositoryListResponse, Error> {
    repositoryManager.listRepositories(caller, owner, params)
  };

  public shared ({ caller }) func deleteRepository(id : Text) : async Result<Bool, Error> {
    repositoryManager.deleteRepository(caller, id)
  };

  // FILE MANAGEMENT APIs

  public shared ({ caller }) func uploadFile(
    request : UploadFileRequest,
    useIPFS: ?Bool  
  ) : async Result<FileEntry, Error> {
    let fileResult = repositoryManager.uploadFile(caller, request, useIPFS);
    
    // Handle incentives after successful upload
    switch (fileResult) {
      case (#Ok(fileEntry)) {
        incentiveSystem.updateMetrics(caller, request.repositoryId, #Commit);
        
        let rewardResult = incentiveSystem.distributeReward(
          caller,
          request.repositoryId,
          #CommitReward,
          "File upload: " # request.path,
          ?{
            commitId = ?Utils.generateCommitHash(request.repositoryId, caller, request.commitMessage, Time.now());
            pullRequestId = null;
            issueId = null;
            contributionScore = ?(Float.fromInt(fileEntry.size) / 1000.0);
            impactLevel = if (fileEntry.size > 10000) ?#High else if (fileEntry.size > 1000) ?#Medium else ?#Low;
          },
        );

        // Log reward distribution but don't affect the result
        switch (rewardResult) {
          case (#Ok(reward)) {
            Debug.print("Reward distributed: " # reward.id # " - " # Nat.toText(reward.amount) # " ICPH");
          };
          case (#Err(error)) {
            Debug.print("Reward distribution failed: " # debug_show (error));
          };
        };
      };
      case (#Err(_)) {
        // File upload failed, no rewards
      };
    };

    fileResult
  };

  public shared query ({ caller }) func getFile(repositoryId : Text, path : Text) : async Result<FileEntry, Error> {
    repositoryManager.getFile(caller, repositoryId, path)
  };

  public shared query ({ caller }) func listFiles(
    repositoryId : Text,
    path : ?Text,
  ) : async Result<FileListResponse, Error> {
    repositoryManager.listFiles(caller, repositoryId, path)
  };

  public shared ({ caller }) func deleteFile(repositoryId : Text, path : Text) : async Result<Bool, Error> {
    repositoryManager.deleteFile(caller, repositoryId, path)
  };

  // SEARCH APIs

  public shared ({ caller }) func search(request : SearchRequest) : async Result<SerializableSearchResults, Error> {
    searchManager.search(caller, request)
  };

  public shared query ({ caller }) func searchSuggestions(
    searchQuery : Text,
    maxSuggestions : ?Nat,
  ) : async Result<[Text], Error> {
    searchManager.searchSuggestions(caller, searchQuery, maxSuggestions)
  };

  public shared ({ caller }) func searchRepository(
    repositoryId : Text,
    searchQuery : Text,
    params : ?PaginationParams,
  ) : async Result<FileListResponse, Error> {
    repositoryManager.searchRepository(caller, repositoryId, searchQuery, params)
  };

  // System monitoring
  public query func getMemoryStats() : async MemoryStats {
    {
      totalMemory = 0; // Placeholder - implement actual memory calculation
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

  //
  // CONTRACT DEPLOYMENT APIS
  //

  public shared ({ caller }) func deployContract(
    repositoryId : Text,
    filePath : Text,
    targetChain : Types.BlockchainType,
    network : Types.NetworkConfig,
    constructorArgs : ?Text,
  ) : async Result<DeploymentRecord, Error> {
    // Check permissions
    let repositories = stateManager.getRepositories();
    
    switch (repositories.get(repositoryId)) {
      case null { #Err(#NotFound("Repository not found")) };
      case (?repo) {
        if (not Utils.canWriteRepository(caller, repo)) {
          return #Err(#Forbidden("No deployment permission"));
        };

        // Check if chain is supported by repo
        let chainSupported = Array.find<Types.BlockchainType>(
          repo.supportedChains,
          func(c) { c == targetChain },
        );

        if (chainSupported == null) {
          return #Err(#BadRequest("Repository doesn't support " # debug_show (targetChain)));
        };

        // Get the contract file
        switch (repo.files.get(filePath)) {
          case null { #Err(#NotFound("Contract file not found")) };
          case (?file) {
            // Verify it's a smart contract
            switch (file.fileType) {
              case (?#SmartContract(contractInfo)) {
                if (contractInfo.chain != targetChain) {
                  return #Err(#BadRequest("Contract not compatible with target chain"));
                };

                // Prepare deployment request for ChainFusion
                let deployRequest : DeployContractRequest = {
                  chain = targetChain;
                  bytecode = file.content;
                  abi = switch (file.contractMetadata) {
                    case (?meta) meta.abi;
                    case null null;
                  };
                  constructorArgs = constructorArgs;
                  network = network;
                  gasLimit = null; // Use default
                  value = null;
                };

                // Deploy via Chain Fusion
                let deploymentResult = await ChainFusion.deployContract(
                  deployRequest,
                  caller,
                );

                switch (deploymentResult) {
                  case (#Ok(deployment)) {
                    // Track deployment
                    addDeploymentRecord(repositoryId, deployment);

                    // Update repository with last deployment
                    let updatedRepo = {
                      repo with
                      lastDeployment = ?deployment;
                      updatedAt = Time.now();
                    };
                    repositories.put(repositoryId, updatedRepo);

                    #Ok(deployment);
                  };
                  case (#Err(e)) { #Err(e) };
                };
              };
              case _ { #Err(#BadRequest("File is not a smart contract")) };
            };
          };
        };
      };
    };
  };

  public func autoDeployOnCommit(
  repositoryId : Text,
  commitId : Text,
  changedFiles : [Text],
) : async () {
  let repositories = stateManager.getRepositories();
  
  switch (repositories.get(repositoryId)) {
    case null {};
    case (?repo) {
      // Log the commit being processed
      Debug.print("Auto-deploying changes from commit: " # commitId);
      
      // Check each deployment target
      for (target in repo.deploymentTargets.vals()) {
        if (target.autoDeploy) {
          // Find contract files for this chain
          for (filePath in changedFiles.vals()) {
            switch (repo.files.get(filePath)) {
              case null {};
              case (?file) {
                switch (file.fileType) {
                  case (?#SmartContract(contractInfo)) {
                    if (contractInfo.chain == target.chain) {
                      // Auto-deploy with commit reference
                      let _ = await deployContract(
                        repositoryId,
                        filePath,
                        target.chain,
                        target.network,
                        null,
                      );
                      Debug.print("Auto-deployed " # filePath # " from commit " # commitId);
                    };
                  };
                  case _ {};
                };
              };
            };
          };
        };
      };
    };
  };
};

  // COLLABORATOR MANAGEMENT APIs

  public shared ({ caller }) func addCollaborator(request : AddCollaboratorRequest) : async Result<CollaboratorInfo, Error> {
    return CollaboratorManager.addCollaborator(
      caller,
      request,
      stateManager.getRepositories(),
      stateManager.getUsers(),
      stateManager.getUsernames(),
    );
  };

  public shared ({ caller }) func removeCollaborator(request : RemoveCollaboratorRequest) : async Result<Bool, Error> {
    return CollaboratorManager.removeCollaborator(
      caller,
      request,
      stateManager.getRepositories(),
      stateManager.getUsernames(),
    );
  };

  public shared ({ caller }) func updateCollaboratorPermission(request : UpdateCollaboratorRequest) : async Result<CollaboratorInfo, Error> {
    return CollaboratorManager.updateCollaboratorPermission(
      caller,
      request,
      stateManager.getRepositories(),
      stateManager.getUsernames(),
      stateManager.getUsers(),
    );
  };

  public shared ({ caller }) func listCollaborators(request : CollaboratorListRequest) : async Result<CollaboratorListResponse, Error> {
    return CollaboratorManager.listCollaborators(
      caller,
      request,
      stateManager.getRepositories(),
      stateManager.getUsers(),
    );
  };

  // GOVERNANCE APIs

  public shared ({ caller }) func initializeGovernanceTokens(amount : TokenAmount) : async Result<Bool, Error> {
  // Check if user is registered
    switch (stateManager.getUsers().get(caller)) {
      case null { return #Err(#Unauthorized("User not registered")) };
      case (?_) { // Use wildcard since we only need to verify existence
        governanceState.initializeGovernanceToken(caller, amount);
        return #Ok(true);
      };
    };
  };

  // Get user's voting power
  public query ({ caller }) func getVotingPower(user : ?Principal) : async VotingPower {
    let targetUser = switch (user) {
      case null { caller };
      case (?p) { p };
    };
    governanceState.getVotingPower(targetUser);
  };

  // Create a new proposal
  public shared ({ caller }) func createProposal(request : CreateProposalRequest) : async Result<Proposal, Error> {
    return governanceState.createProposal(caller, request, stateManager.getUsers());
  };

  // Cast a vote on a proposal
  public shared ({ caller }) func castVote(request : CastVoteRequest) : async Result<Bool, Error> {
    return governanceState.castVote(caller, request);
  };

  // Get a specific proposal
  public query func getProposal(proposalId : ProposalId) : async Result<Proposal, Error> {
    switch (governanceState.getProposal(proposalId)) {
      case null { #Err(#NotFound("Proposal not found")) };
      case (?proposal) { #Ok(proposal) };
    };
  };

  // List proposals with filters
  public query func listProposals(request : ProposalListRequest) : async ProposalListResponse {
    governanceState.listProposals(request);
  };

  // Process proposal results (should be called periodically)
  public shared func processProposalResults() : async [ProposalId] {
    governanceState.processProposalResults();
  };

  // Execute a passed proposal
  public shared ({ caller }) func executeProposal(proposalId : ProposalId) : async Result<Bool, Error> {
    return governanceState.executeProposal(caller, proposalId, stateManager.getRepositories());
  };

  // Add a discussion post to a proposal
  public shared ({ caller }) func addDiscussionPost(request : AddDiscussionPostRequest) : async Result<DiscussionPost, Error> {
    return governanceState.addDiscussionPost(caller, request);
  };

  // Get voting statistics
  public query func getVotingStats() : async VotingStats {
    governanceState.getVotingStats();
  };

  // Helper function to check if a user can create proposals
  public query ({ caller }) func canCreateProposal() : async Bool {
    switch (stateManager.getUsers().get(caller)) {
      case null { false };
      case (?_) {
        let votingPower = governanceState.getVotingPower(caller);
        votingPower >= 10;
      };
    };
  };

  // Get user's governance token balance
  public query ({ caller }) func getGovernanceTokenBalance(user : ?Principal) : async Result<{ balance : TokenAmount; staked : TokenAmount; votingPower : VotingPower }, Error> {
    let targetUser = switch (user) {
      case null { caller };
      case (?p) { p };
    };

    let votingPower = governanceState.getVotingPower(targetUser);

    // returning voting power as both balance and staked
    #Ok({
      balance = votingPower;
      staked = 0;
      votingPower = votingPower;
    });
  };

  // Create a repository update proposal
  public shared ({ caller }) func proposeRepositoryUpdate(
    repositoryId : Text,
    newSettings : Types.RepositorySettings,
    title : Text,
    description : Text,
  ) : async Result<Proposal, Error> {
    // Verify repository exists and caller has permission
    let repositories = stateManager.getRepositories();
    
    switch (repositories.get(repositoryId)) {
      case null { return #Err(#NotFound("Repository not found")) };
      case (?repo) {
        if (not Utils.canWriteRepository(caller, repo)) {
          return #Err(#Forbidden("You don't have permission to propose updates for this repository"));
        };

        let proposalRequest : CreateProposalRequest = {
          proposalType = #RepositoryUpdate({
            repositoryId = repositoryId;
            newSettings = newSettings;
          });
          title = title;
          description = description;
          votingDuration = null;
          executionDelay = null;
        };

        return governanceState.createProposal(caller, proposalRequest, stateManager.getUsers());
      };
    };
  };

  // Create a collaborator promotion proposal
  public shared ({ caller }) func proposeCollaboratorPromotion(
  repositoryId : Text,
  collaboratorUsername : Text,
  newPermission : Types.CollaboratorPermission,
  title : Text,
  description : Text,
) : async Result<Proposal, Error> {
  let repositories = stateManager.getRepositories();
  let usernames = stateManager.getUsernames();
  let users = stateManager.getUsers();
  
  // Verify repository exists
  switch (repositories.get(repositoryId)) {
    case null { return #Err(#NotFound("Repository not found")) };
    case (?repo) {
      // Check if caller can manage collaborators
      if (not CollaboratorManager.canManageCollaborators(caller, repo)) {
        return #Err(#Forbidden("You don't have permission to propose collaborator changes"));
      };

      // Get collaborator principal from username
      let collaboratorPrincipal = switch (usernames.get(collaboratorUsername)) {
        case null { return #Err(#NotFound("User not found")) };
        case (?principal) { principal };
      };

      // Verify collaborator exists
      switch (repo.collaborators.get(collaboratorPrincipal)) {
        case null { return #Err(#NotFound("User is not a collaborator")) };
        case (?_) { 
          let proposalRequest : CreateProposalRequest = {
            proposalType = #CollaboratorPromotion({
              repositoryId = repositoryId;
              collaborator = collaboratorPrincipal;
              newPermission = newPermission;
            });
            title = title;
            description = description;
            votingDuration = null;
            executionDelay = null;
          };

          return governanceState.createProposal(caller, proposalRequest, users);
        };
      };
    };
  };
};

  // Timer function to automatically process proposals (call this periodically)
  public shared func processGovernanceTimers() : async () {
    let processedProposals = governanceState.processProposalResults();
    
    // Log processed proposals for monitoring
    if (processedProposals.size() > 0) {
      Debug.print("Processed " # Nat.toText(processedProposals.size()) # " governance proposals");
      for (proposalId in processedProposals.vals()) {
        Debug.print("Processed proposal: " # Nat.toText(proposalId));
      };
    };
  };

  // AUTHENTICATION APIs

  public shared ({ caller }) func login() : async Result<SessionToken, Error> {
    if (Principal.isAnonymous(caller)) {
      return #Err(#Unauthorized("Anonymous principals cannot login"));
    };

    // Check if user is registered
    switch (stateManager.getUsers().get(caller)) {
      case null {
        return #Err(#NotFound("User not registered. Please register first."));
      };
      case (?_) { // Use wildcard since we only need to verify existence
        let session = sessionManager.createSession(caller);
        #Ok(session);
      };
    };
  };

  // Logout
  public shared func logout(sessionToken : Text) : async Bool {
    sessionManager.deleteSession(sessionToken);
  };

  // Validate session
  public query func validateSession(sessionToken : Text) : async Result<Principal, Error> {
    sessionManager.validateSession(sessionToken);
  };

  // Create API key
  public shared ({ caller }) func createApiKey(
    name : Text,
    permissions : [ApiPermission],
    expiresInDays : ?Nat,
  ) : async Result<Text, Error> {
    // Check if user is registered
    switch (stateManager.getUsers().get(caller)) {
      case null {
        return #Err(#Unauthorized("User not registered"));
      };
      case (?_) { // Use wildcard since we only need to verify existence
        let expiresAt = switch (expiresInDays) {
          case null { null };
          case (?days) {
            // Convert days to nanoseconds and add to current time
            let durationNanos : Int = days * 24 * 60 * 60 * 1_000_000_000;
            let expirationTime : Int = Time.now() + durationNanos;
            ?expirationTime;
          };
        };

        return apiKeyManager.createApiKey(caller, name, permissions, expiresAt);
      };
    };
  };

  // List user's API keys
  public query ({ caller }) func listApiKeys() : async [ApiKey] {
    apiKeyManager.listApiKeys(caller);
  };

  // Revoke API key
  public shared ({ caller }) func revokeApiKey(keyId : Text) : async Result<Bool, Error> {
    apiKeyManager.revokeApiKey(caller, keyId);
  };

  // Check permissions
  public query ({ caller }) func checkPermission(permission : Permission) : async Bool {
    Auth.hasPermission(caller, permission, stateManager.getUsers());
  };

  // Get auth context
  public query ({ caller }) func getAuthContext() : async AuthContext {
    Auth.createAuthContext(caller, #InternetIdentity, stateManager.getUsers());
  };

  // Protected endpoint example - update existing functions
  public shared ({ caller }) func createRepositoryWithAuth(
    request : CreateRepositoryRequest,
    sessionToken : ?Text,
  ) : async Result<SerializableRepository, Error> {
    // Validate authentication
    let principal = switch (sessionToken) {
      case null caller;
      case (?token) {
        switch (sessionManager.validateSession(token)) {
          case (#Err(e)) { return #Err(e) };
          case (#Ok(p)) p;
        };
      };
    };

    // Check permission
    if (not Auth.hasPermission(principal, #CreateRepository, stateManager.getUsers())) {
      return #Err(#Forbidden("You don't have permission to create repositories"));
    };

    // Call existing createRepository logic
    return repositoryManager.createRepository(principal, request);
  };

  // Cleanup expired sessions (call periodically)
  public shared func cleanupExpiredSessions() : async Nat {
    sessionManager.cleanupExpiredSessions();
  };

  // Rate limiting example
  private transient var rateLimitStore = HashMap.HashMap<Text, Auth.RateLimitEntry>(100, Text.equal, Text.hash);

  public shared ({ caller }) func rateLimitedEndpoint() : async Result<Text, Error> {
    let config : Auth.RateLimitConfig = {
      maxRequests = 100;
      windowSeconds = 3600; // 1 hour
      identifier = Principal.toText(caller);
    };

    if (not Auth.checkRateLimit(config.identifier, config, rateLimitStore)) {
      return #Err(#BadRequest("Rate limit exceeded"));
    };

    #Ok("Success");
  };

  // GIT OPERATIONS APIs

  // Create a new branch
  public shared ({ caller }) func createBranch(request : BranchRequest) : async Result<Types.Branch, Error> {
    GitOps.createBranch(caller, request, stateManager.getRepositories());
  };

  // Delete a branch
  public shared ({ caller }) func deleteBranch(
    repositoryId : Text,
    branchName : Text,
  ) : async Result<Bool, Error> {
    GitOps.deleteBranch(caller, repositoryId, branchName, stateManager.getRepositories());
  };

  // Get commit history
  public query ({ caller }) func getCommitHistory(
    repositoryId : Text,
    branch : ?Text,
    limit : ?Nat,
    offset : ?Nat,
  ) : async Result<GitLog, Error> {
    let actualLimit = switch (limit) {
      case null 50;
      case (?l) Nat.min(l, 100);
    };
    let actualOffset = switch (offset) {
      case null 0;
      case (?o) o;
    };

    let repositories = stateManager.getRepositories();
    switch (repositories.get(repositoryId)) {
      case null { #Err(#NotFound("Repository not found")) };
      case (?repo) {
        if (not Utils.canReadRepository(caller, repo)) {
          #Err(#Forbidden("No read permission"));
        } else {
          GitOps.getCommitHistory(repositoryId, branch, actualLimit, actualOffset, repositories);
        };
      };
    };
  };

  // Get commit diff
  public query ({ caller }) func getCommitDiff(
    repositoryId : Text,
    commitId : Text,
  ) : async Result<[DiffResult], Error> {
    // Check read permission
    let repositories = stateManager.getRepositories();
    
    switch (repositories.get(repositoryId)) {
      case null { #Err(#NotFound("Repository not found")) };
      case (?repo) {
        if (not Utils.canReadRepository(caller, repo)) {
          #Err(#Forbidden("No read permission"));
        } else {
          GitOps.getCommitDiff(repositoryId, commitId, repositories);
        };
      };
    };
  };

  // Merge branches
  public shared ({ caller }) func mergeBranches(request : MergeRequest) : async Result<MergeResult, Error> {
    GitOps.mergeBranches(caller, request, stateManager.getRepositories());
  };

  // Clone repository
  public shared ({ caller }) func cloneRepository(request : CloneRequest) : async Result<SerializableRepository, Error> {
    // Check if user is registered
    let users = stateManager.getUsers();
    
    switch (users.get(caller)) {
      case null { #Err(#Unauthorized("User not registered")) };
      case (?_) {
        // Validate new repository name
        if (not Utils.isValidRepositoryName(request.newName)) {
          return #Err(#BadRequest("Invalid repository name"));
        };

        let result = GitOps.cloneRepository(
          caller,
          request,
          stateManager.getRepositories(),
          stateManager.generateRepositoryId,
        );

        switch (result) {
          case (#Err(e)) { #Err(e) };
          case (#Ok(clonedRepo)) {
            // Update user's repository list
            stateManager.updateUserRepositoryList(caller, clonedRepo.id, true);
            #Ok(Types.repositoryToSerializable(clonedRepo));
          };
        };
      };
    };
  };

  // Get repository status
  public query ({ caller }) func getGitStatus(
    repositoryId : Text,
    branch : Text,
  ) : async Result<GitStatus, Error> {
    // Check read permission
    let repositories = stateManager.getRepositories();
    
    switch (repositories.get(repositoryId)) {
      case null { #Err(#NotFound("Repository not found")) };
      case (?repo) {
        if (not Utils.canReadRepository(caller, repo)) {
          #Err(#Forbidden("No read permission"));
        } else {
          GitOps.getStatus(repositoryId, branch, repositories);
        };
      };
    };
  };

  // Create tag
  public shared ({ caller }) func createTag(request : TagRequest) : async Result<Tag, Error> {
    GitOps.createTag(caller, request, stateManager.getRepositories());
  };

  // List branches
  public query ({ caller }) func listBranches(repositoryId : Text) : async Result<[Types.Branch], Error> {
    let repositories = stateManager.getRepositories();
    
    switch (repositories.get(repositoryId)) {
      case null { #Err(#NotFound("Repository not found")) };
      case (?repo) {
        if (not Utils.canReadRepository(caller, repo)) {
          #Err(#Forbidden("No read permission"));
        } else {
          #Ok(repo.branches);
        };
      };
    };
  };

  // Get current branch
  public query ({ caller }) func getCurrentBranch(repositoryId : Text) : async Result<Types.Branch, Error> {
    let repositories = stateManager.getRepositories();
    
    switch (repositories.get(repositoryId)) {
      case null { #Err(#NotFound("Repository not found")) };
      case (?repo) {
        if (not Utils.canReadRepository(caller, repo)) {
          #Err(#Forbidden("No read permission"));
        } else {
          switch (Array.find<Types.Branch>(repo.branches, func(b) { b.isDefault })) {
            case null { #Err(#NotFound("No default branch found")) };
            case (?branch) { #Ok(branch) };
          };
        };
      };
    };
  };

  public shared ({ caller }) func switchBranch(
    repositoryId : Text,
    branchName : Text,
  ) : async Result<Bool, Error> {
    let repositories = stateManager.getRepositories();
    
    switch (repositories.get(repositoryId)) {
      case null { #Err(#NotFound("Repository not found")) };
      case (?repo) {
        if (not Utils.canWriteRepository(caller, repo)) {
          return #Err(#Forbidden("No write permission"));
        };

        // Check if branch exists
        let branchExists = Array.find<Types.Branch>(
          repo.branches,
          func(b) { b.name == branchName },
        );

        switch (branchExists) {
          case null { #Err(#NotFound("Branch not found")) };
          case (?_) {
            // Update branches
            let updatedBranches = Array.map<Types.Branch, Types.Branch>(
              repo.branches,
              func(b) {
                if (b.name == branchName) { { b with isDefault = true } } else {
                  { b with isDefault = false };
                };
              },
            );

            let updatedRepo = {
              repo with
              branches = updatedBranches;
              updatedAt = Time.now();
            };

            repositories.put(repositoryId, updatedRepo);
            #Ok(true);
          };
        };
      };
    };
  };

  // Get file history
  public query ({ caller }) func getFileHistory(
    repositoryId : Text,
    filePath : Text,
    limit : ?Nat,
  ) : async Result<[Types.Commit], Error> {
    let repositories = stateManager.getRepositories();
    
    switch (repositories.get(repositoryId)) {
      case null { #Err(#NotFound("Repository not found")) };
      case (?repo) {
        if (not Utils.canReadRepository(caller, repo)) {
          return #Err(#Forbidden("No read permission"));
        };

        // Filter commits that changed this file
        let fileCommits = Array.filter<Types.Commit>(
          repo.commits,
          func(commit) {
            Array.find<Text>(
              commit.changedFiles,
              func(path) { path == filePath },
            ) != null;
          },
        );

        // Sort by timestamp
        let sortedCommits = Array.sort<Types.Commit>(
          fileCommits,
          func(a, b) { Int.compare(b.timestamp, a.timestamp) },
        );

        // Apply limit
        let actualLimit = switch (limit) {
          case null sortedCommits.size();
          case (?l) Nat.min(l, sortedCommits.size());
        };

        #Ok(Array.subArray(sortedCommits, 0, actualLimit));
      };
    };
  };

  // Compare two branches
  public query ({ caller }) func compareBranches(
    repositoryId : Text,
    baseBranch : Text,
    compareBranch : Text,
  ) : async Result<{ ahead : Nat; behind : Nat; commits : [Types.Commit] }, Error> {
    let repositories = stateManager.getRepositories();
    
    switch (repositories.get(repositoryId)) {
      case null { #Err(#NotFound("Repository not found")) };
      case (?repo) {
        if (not Utils.canReadRepository(caller, repo)) {
          return #Err(#Forbidden("No read permission"));
        };

        // Find branches
        let base = Array.find<Types.Branch>(
          repo.branches,
          func(b) { b.name == baseBranch },
        );

        let compare = Array.find<Types.Branch>(
          repo.branches,
          func(b) { b.name == compareBranch },
        );

        switch (base, compare) {
          case (null, _) { #Err(#NotFound("Base branch not found")) };
          case (_, null) { #Err(#NotFound("Compare branch not found")) };
          case (?_, ?_) {
            // Simplified comparison
            #Ok({
              ahead = 0;
              behind = 0;
              commits = [];
            });
          };
        };
      };
    };
  };

  // Revert a commit
  public shared ({ caller }) func revertCommit(
    repositoryId : Text,
    commitId : Text,
    message : ?Text,
  ) : async Result<Types.Commit, Error> {
    let repositories = stateManager.getRepositories();
    
    switch (repositories.get(repositoryId)) {
      case null { #Err(#NotFound("Repository not found")) };
      case (?repo) {
        if (not Utils.canWriteRepository(caller, repo)) {
          return #Err(#Forbidden("No write permission"));
        };

        // Find the commit to revert
        let commitToRevert = Array.find<Types.Commit>(
          repo.commits,
          func(c) { c.id == commitId },
        );

        switch (commitToRevert) {
          case null { #Err(#NotFound("Commit not found")) };
          case (?commit) {
            // Create revert commit
            let revertMessage = switch (message) {
              case null { "Revert \"" # commit.message # "\"" };
              case (?msg) { msg };
            };

            // Get current default branch
            let defaultBranch = Array.find<Types.Branch>(
              repo.branches,
              func(b) { b.isDefault },
            );

            switch (defaultBranch) {
              case null { #Err(#NotFound("No default branch")) };
              case (?branch) {
                // Create a commit that reverts the changes
                let revertRequest : CommitRequest = {
                  repositoryId = repositoryId;
                  branch = branch.name;
                  message = revertMessage;
                  files = [];
                  parentCommit = ?branch.commitId;
                };

                GitOps.createCommit(caller, revertRequest, repositories);
              };
            };
          };
        };
      };
    };
  };

  // Get repository statistics
  public query ({ caller }) func getRepositoryStats(repositoryId : Text) : async Result<{ totalCommits : Nat; totalBranches : Nat; totalFiles : Nat; contributors : [Principal]; languages : [Text] }, Error> {
    let repositories = stateManager.getRepositories();
    
    switch (repositories.get(repositoryId)) {
      case null { #Err(#NotFound("Repository not found")) };
      case (?repo) {
        if (not Utils.canReadRepository(caller, repo)) {
          return #Err(#Forbidden("No read permission"));
        };

        // Get unique contributors
        let contributorsBuffer = Buffer.Buffer<Principal>(10);
        contributorsBuffer.add(repo.owner);

        for (commit in repo.commits.vals()) {
          let exists = Buffer.contains<Principal>(
            contributorsBuffer,
            commit.author,
            Principal.equal,
          );
          if (not exists) {
            contributorsBuffer.add(commit.author);
          };
        };

        // Get languages
        let languagesBuffer = Buffer.Buffer<Text>(5);
        for ((path, _) in repo.files.entries()) {
          switch (Utils.getFileExtension(path)) {
            case null {};
            case (?ext) {
              let lang = switch (ext) {
                case "mo" { "Motoko" };
                case "js" { "JavaScript" };
                case "ts" { "TypeScript" };
                case "py" { "Python" };
                case "rs" { "Rust" };
                case "go" { "Go" };
                case "java" { "Java" };
                case "cpp" { "C++" };
                case "cc" { "C++" };
                case "c" { "C" };
                case "h" { "C" };
                case _ { ext };
              };

              let exists = Buffer.contains<Text>(
                languagesBuffer,
                lang,
                Text.equal,
              );
              if (not exists) {
                languagesBuffer.add(lang);
              };
            };
          };
        };

        #Ok({
          totalCommits = repo.commits.size();
          totalBranches = repo.branches.size();
          totalFiles = repo.files.size();
          contributors = Buffer.toArray(contributorsBuffer);
          languages = Buffer.toArray(languagesBuffer);
        });
      };
    };
  };

  // DEPLOYMENT APIs

  public query ({ caller }) func getDeploymentHistory(
    repositoryId : Text
  ) : async Result<[Types.DeploymentRecord], Error> {
    let repositories = stateManager.getRepositories();
    
    switch (repositories.get(repositoryId)) {
      case null { #Err(#NotFound("Repository not found")) };
      case (?repo) {
        if (not Utils.canReadRepository(caller, repo)) {
          return #Err(#Forbidden("No read permission"));
        };

        switch (deployments.get(repositoryId)) {
          case null { #Ok([]) };
          case (?history) { #Ok(history) };
        };
      };
    };
  };

  public shared func checkDeploymentStatus(
    deploymentId : Text,
    chain : Types.BlockchainType,
    transactionHash : Text,
  ) : async Result<Types.DeploymentStatus, Error> {
    Debug.print("Checking deployment status id = " # deploymentId);
    await ChainFusion.getDeploymentStatus(chain, transactionHash);
  };

  public shared ({ caller }) func sendCrossChainMessage(
    fromRepositoryId : Text,
    message : CrossChainMessage,
  ) : async Result<Text, Error> {
    // Verify caller has permission
    let repositories = stateManager.getRepositories();
    
    switch (repositories.get(fromRepositoryId)) {
      case null { #Err(#NotFound("Repository not found")) };
      case (?repo) {
        if (not Utils.canWriteRepository(caller, repo)) {
          return #Err(#Forbidden("No write permission"));
        };

        await ChainFusion.sendCrossChainMessage(message);
      };
    };
  };

  public shared func getBitcoinBalance(
    address : BitcoinAddress,
    network : BitcoinNetwork,
  ) : async Result<Satoshi, Error> {
    await ChainFusion.getBitcoinBalance(address, network);
  };

  public shared ({ caller }) func deriveBlockchainAddress(
    chain : Types.BlockchainType
  ) : async Result<Text, Error> {
    let derivationPath = [
      Text.encodeUtf8("icphub"),
      Principal.toBlob(caller),
    ];

    await ChainFusion.deriveAddress(chain, derivationPath);
  };

  public shared ({ caller }) func configureDeploymentTargets(
    repositoryId : Text,
    targets : [Types.DeploymentTarget],
  ) : async Result<Bool, Error> {
    let repositories = stateManager.getRepositories();
    
    switch (repositories.get(repositoryId)) {
      case null { #Err(#NotFound("Repository not found")) };
      case (?repo) {
        if (not Utils.canAdminRepository(caller, repo)) {
          return #Err(#Forbidden("Admin permission required"));
        };

        let updatedRepo = {
          repo with
          deploymentTargets = targets;
          updatedAt = Time.now();
        };

        repositories.put(repositoryId, updatedRepo);
        #Ok(true);
      };
    };
  };

  public shared func uploadFileWithAutoDeploy(
    request : UploadFileRequest
  ) : async Result<FileEntry, Error> {
    // First upload the file using existing logic
    let uploadResult = await uploadFile(request, null);

    switch (uploadResult) {
      case (#Err(e)) { #Err(e) };
      case (#Ok(fileEntry)) {
        // Check if it's a smart contract and auto-deploy is enabled
        switch (fileEntry.fileType) {
          case (?#SmartContract(contractInfo)) {
            let repositories = stateManager.getRepositories();
            
            switch (repositories.get(request.repositoryId)) {
              case null { #Ok(fileEntry) };
              case (?repo) {
                // Check if auto-deploy is configured for this chain
                for (target in repo.deploymentTargets.vals()) {
                  if (target.chain == contractInfo.chain and target.autoDeploy) {
                    // Trigger async deployment (don't wait for result)
                    ignore deployContract(
                      request.repositoryId,
                      request.path,
                      target.chain,
                      target.network,
                      null,
                    );
                  };
                };
                #Ok(fileEntry);
              };
            };
          };
          case _ { #Ok(fileEntry) };
        };
      };
    };
  };

  public shared ({ caller }) func verifyDeployment(
    repositoryId : Text,
    deploymentId : Text,
    chain : Types.BlockchainType,
  ) : async Result<Bool, Error> {
    let repositories = stateManager.getRepositories();
    
    switch (repositories.get(repositoryId)) {
      case null { #Err(#NotFound("Repository not found")) };
      case (?repo) {
        if (not Utils.canReadRepository(caller, repo)) {
          return #Err(#Forbidden("No read permission"));
        };
        switch (deployments.get(repositoryId)) {
          case null { #Err(#NotFound("No deployments found")) };
          case (?history) {
            let deployment = Array.find<DeploymentRecord>(
              history,
              func(d) { d.id == deploymentId },
            );

            switch (deployment) {
              case null { #Err(#NotFound("Deployment not found")) };
              case (?dep) {
                // Verify on the blockchain
                switch (dep.transactionHash) {
                  case null {
                    #Err(#BadRequest("No transaction hash available"));
                  };
                  case (?txHash) {
                    let statusResult = await ChainFusion.getDeploymentStatus(chain, txHash);
                    switch (statusResult) {
                      case (#Ok(#Success)) { #Ok(true) };
                      case (#Ok(_)) { #Ok(false) };
                      case (#Err(e)) { #Err(e) };
                    };
                  };
                };
              };
            };
          };
        };
      };
    };
  };

  public query ({ caller }) func getMultiChainDeploymentStatus(
    repositoryId : Text
  ) : async Result<[(Types.BlockchainType, ?DeploymentRecord)], Error> {
    let repositories = stateManager.getRepositories();
    
    switch (repositories.get(repositoryId)) {
      case null { #Err(#NotFound("Repository not found")) };
      case (?repo) {
        if (not Utils.canReadRepository(caller, repo)) {
          return #Err(#Forbidden("No read permission"));
        };

        let results = Buffer.Buffer<(Types.BlockchainType, ?DeploymentRecord)>(repo.supportedChains.size());

        for (chain in repo.supportedChains.vals()) {
          // Find latest deployment for this chain
          let latestDeployment = switch (deployments.get(repositoryId)) {
            case null null;
            case (?history) {
              Array.find<DeploymentRecord>(
                Array.reverse(history), // Get latest first
                func(d) { d.chain == chain },
              );
            };
          };

          results.add((chain, latestDeployment));
        };

        #Ok(Buffer.toArray(results));
      };
    };
  };

  // INCENTIVE SYSTEM APIs

  public shared (msg) func initializeIncentiveSystem() : async Result<Bool, Error> {
    if (not isAdmin(msg.caller)) {
      return #Err(#Forbidden("Admin access required"));
    };

    incentiveSystem.init();
    #Ok(true);
  };

  // Get user token balance
  public query (msg) func getBalance() : async Incentives.TokenAmount {
    incentiveSystem.getBalance(msg.caller);
  };

  // Get balance for specific user
  public query (msg) func getBalanceOf(user : Principal) : async Result<Incentives.TokenAmount, Error> {
    if (not isAdmin(msg.caller)) {
      return #Err(#Forbidden("Admin access required"));
    };

    #Ok(incentiveSystem.getBalance(user));
  };

  public shared (msg) func transfer(to : Principal, amount : Incentives.TokenAmount) : async Result<Bool, Error> {
    if (Principal.isAnonymous(msg.caller)) {
      return #Err(#Unauthorized("Authentication required"));
    };

    incentiveSystem.transfer(msg.caller, to, amount);
  };

  // Manual contribution recording
  public shared (msg) func recordContribution(
    repositoryId : Text,
    contributionType : {
      #Commit : { commitId : Text; linesChanged : Nat };
      #PullRequest : { prId : Text; complexity : Text };
      #IssueResolved : { issueId : Text; severity : Text };
      #CodeReview : { prId : Text; quality : Text };
    },
    reason : Text,
  ) : async Result<Incentives.Reward, Error> {
    if (Principal.isAnonymous(msg.caller)) {
      return #Err(#Unauthorized("Authentication required"));
    };

    // Validate repository exists
    let repositories = stateManager.getRepositories();
    
    switch (repositories.get(repositoryId)) {
      case (null) return #Err(#NotFound("Repository not found"));
      case (?_) {
        // Update metrics based on contribution type
        let metricType = switch (contributionType) {
          case (#Commit(_)) #Commit;
          case (#PullRequest(_)) #PullRequest;
          case (#IssueResolved(_)) #IssueResolved;
          case (#CodeReview(_)) #CodeReview;
        };

        incentiveSystem.updateMetrics(msg.caller, repositoryId, metricType);

        // Determine reward type and metadata
        let (rewardType, metadata) = switch (contributionType) {
          case (#Commit(data)) {
            (
              #CommitReward,
              ?{
                commitId = ?data.commitId;
                pullRequestId = null;
                issueId = null;
                contributionScore = ?(Float.fromInt(data.linesChanged) / 10.0);
                impactLevel = if (data.linesChanged > 100) ?#High else if (data.linesChanged > 50) ?#Medium else ?#Low;
              },
            );
          };
          case (#PullRequest(data)) {
            (
              #PullRequestMerged,
              ?{
                commitId = null;
                pullRequestId = ?data.prId;
                issueId = null;
                contributionScore = switch (data.complexity) {
                  case ("high") ?3.0;
                  case ("medium") ?2.0;
                  case (_) ?1.0;
                };
                impactLevel = switch (data.complexity) {
                  case ("high") ?#High;
                  case ("medium") ?#Medium;
                  case (_) ?#Low;
                };
              },
            );
          };
          case (#IssueResolved(data)) {
            (
              #IssueResolved,
              ?{
                commitId = null;
                pullRequestId = null;
                issueId = ?data.issueId;
                contributionScore = switch (data.severity) {
                  case ("critical") ?4.0;
                  case ("high") ?3.0;
                  case ("medium") ?2.0;
                  case (_) ?1.0;
                };
                impactLevel = switch (data.severity) {
                  case ("critical") ?#Critical;
                  case ("high") ?#High;
                  case ("medium") ?#Medium;
                  case (_) ?#Low;
                };
              },
            );
          };
          case (#CodeReview(data)) {
            (
              #CodeReview,
              ?{
                commitId = null;
                pullRequestId = ?data.prId;
                issueId = null;
                contributionScore = switch (data.quality) {
                  case ("excellent") ?3.0;
                  case ("good") ?2.0;
                  case (_) ?1.0;
                };
                impactLevel = switch (data.quality) {
                  case ("excellent") ?#High;
                  case ("good") ?#Medium;
                  case (_) ?#Low;
                };
              },
            );
          };
        };

        incentiveSystem.distributeReward(
          msg.caller,
          repositoryId,
          rewardType,
          reason,
          metadata,
        );
      };
    };
  };

  // Bounty management
  public shared (msg) func stakeTokens(
    amount: TokenAmount,
    lockDays: Nat,
  ) : async Result<Incentives.StakePosition, Error> {
    if (Principal.isAnonymous(msg.caller)) {
        return #Err(#Unauthorized("Authentication required"));
    };

    // Validate input
    if (amount == 0) {
        return #Err(#BadRequest("Amount must be greater than 0"));
    };

    if (lockDays == 0) {
        return #Err(#BadRequest("Lock period must be at least 1 day"));
    };

    // Convert days to nanoseconds
    let lockPeriod = lockDays * 24 * 60 * 60 * 1_000_000_000;
    
    incentiveSystem.stake(msg.caller, amount, lockPeriod);
  };

  public shared (msg) func claimStakingRewards() : async Result<Incentives.TokenAmount, Error> {
    if (Principal.isAnonymous(msg.caller)) {
      return #Err(#Unauthorized("Authentication required"));
    };

    incentiveSystem.claimStakingRewards(msg.caller);
  };
  
  public query func getGlobalLeaderboard(limit : ?Nat) : async [Incentives.LeaderboardEntry] {
    let actualLimit = Option.get(limit, 50);
    incentiveSystem.getLeaderboard(null, null, actualLimit);
  };

  public query func getRepositoryLeaderboard(
    repositoryId : Text,
    limit : ?Nat,
  ) : async [Incentives.LeaderboardEntry] {
    let actualLimit = Option.get(limit, 50);
    incentiveSystem.getLeaderboard(?repositoryId, null, actualLimit);
  };

  public query func getTimeframedLeaderboard(
    repositoryId : ?Text,
    days : Nat,
    limit : ?Nat,
  ) : async [Incentives.LeaderboardEntry] {
    let actualLimit = Option.get(limit, 50);
    let timeframe = days * 24 * 60 * 60 * 1_000_000_000;
    incentiveSystem.getLeaderboard(repositoryId, ?timeframe, actualLimit);
  };

  // Admin functions
  public shared (msg) func resetMonthlyBudget() : async Result<Bool, Error> {
    if (not isAdmin(msg.caller)) {
      return #Err(#Forbidden("Admin access required"));
    };

    incentiveSystem.resetMonthlyBudget();
    #Ok(true);
  };

  public query (msg) func getTreasuryStatus() : async Result<Incentives.Treasury, Error> {
    if (not isAdmin(msg.caller)) {
      return #Err(#Forbidden("Admin access required"));
    };

    // This needs to be implemented in your incentives module
    #Err(#InternalError("Treasury status not yet implemented"));
  };

  public shared ({ caller }) func commitWithRewards(request : CommitRequest) : async Result<Types.Commit, Error> {
    // First create the commit using existing logic
    let commitResult = GitOps.createCommit(caller, request, stateManager.getRepositories());

    switch (commitResult) {
      case (#Err(e)) { #Err(e) };
      case (#Ok(commit)) {
        // Auto-distribute commit reward
        incentiveSystem.updateMetrics(caller, request.repositoryId, #Commit);

        let rewardResult = incentiveSystem.distributeReward(
          caller,
          request.repositoryId,
          #CommitReward,
          "Git commit: " # commit.message,
          ?{
            commitId = ?commit.id;
            pullRequestId = null;
            issueId = null;
            contributionScore = ?(Float.fromInt(request.files.size()) * 1.5);
            impactLevel = if (request.files.size() > 5) ?#High else if (request.files.size() > 2) ?#Medium else ?#Low;
          },
        );

        switch (rewardResult) {
          case (#Ok(reward)) {
            Debug.print("Commit reward: " # Nat.toText(reward.amount) # " ICPH");
          };
          case (#Err(_)) {
            Debug.print("Commit reward failed");
          };
        };

        #Ok(commit);
      };
    };
  };

  //
  // STORAGE MANAGEMENT APIs
  //
  
  public shared({ caller }) func uploadFileToIPFS(
    repositoryId: Text,
    path: Text,
    content: Blob,
    encrypt: Bool
  ): async Result<FileMetadata, Error> {
    // Check repository access
    let repositories = stateManager.getRepositories();
    
    switch (repositories.get(repositoryId)) {
      case null { #Err(#NotFound("Repository not found")); };
      case (?repo) {
        if (not Utils.canWriteRepository(caller, repo)) {
          return #Err(#Forbidden("No write permission"));
        };
        
        let uploadRequest: UploadRequest = {
          repositoryId = repositoryId;
          path = path;
          content = content;
          mimeType = null;
          encrypt = encrypt;
          compress = content.size() > 1024 * 1024; // Compress if > 1MB
          providers = [#IPFS, #ICP]; // Store on both IPFS and ICP
        };
        
        let result = await storageManager.uploadFile(uploadRequest, caller);
        
        // Update contribution metrics
        switch (result) {
          case (#Ok(_)) {
            incentiveSystem.updateMetrics(caller, repositoryId, #Commit);
          };
          case (#Err(_)) {};
        };
        
        result;
      };
    };
  };
    
  // Download file from storage
  public shared({ caller }) func downloadFileFromStorage(
    repositoryId: Text,
    path: Text,
    provider: ?StorageProvider
  ): async Result<Blob, Error> {
    // Check repository access
    let repositories = stateManager.getRepositories();
    
    switch (repositories.get(repositoryId)) {
      case null { #Err(#NotFound("Repository not found")); };
      case (?repo) {
        if (not Utils.canReadRepository(caller, repo)) {
          return #Err(#Forbidden("No read permission"));
        };
        
        let downloadRequest: DownloadRequest = {
          repositoryId = repositoryId;
          path = path;
          provider = provider;
          decrypt = true;
        };
        
        await storageManager.downloadFile(downloadRequest, caller);
      };
    };
  };
  
  // Pin file to IPFS pinning service
  public shared({ caller }) func pinFile(
    cid: Text,
    service: PinningService
  ): async Result<PinStatus, Error> {
    // Verify caller owns a repository containing this CID
    var hasAccess = false;
    let repositories = stateManager.getRepositories();
    
    label checkAccess for ((repoId, repo) in repositories.entries()) {
      if (repo.owner == caller) {
        let files = storageManager.listFiles(repoId, null);
        for (file in files.vals()) {
          switch (file.cid) {
            case (?fileCid) {
              if (fileCid == cid) {
                hasAccess := true;
                break checkAccess;
              };
            };
            case null {};
          };
        };
      };
    };
    
    if (not hasAccess) {
      return #Err(#Forbidden("You don't have access to this file"));
    };
    
    await storageManager.pinFile(cid, service);
  };
  
  // Get storage statistics
  public query func getStorageStats(): async StorageStats {
    storageManager.getStats();
  };
  
  // Verify file integrity
  public shared({ caller }) func verifyFileIntegrity(
    repositoryId: Text,
    path: Text
  ): async Result<Bool, Error> {
    // Check repository access
    let repositories = stateManager.getRepositories();
    
    switch (repositories.get(repositoryId)) {
      case null { #Err(#NotFound("Repository not found")); };
      case (?repo) {
        if (not Utils.canReadRepository(caller, repo)) {
          return #Err(#Forbidden("No read permission"));
        };
        
        await storageManager.verifyIntegrity(repositoryId, path, caller);
      };
    };
  };

  // Get token balance
  public query({ caller }) func getTokenBalance(user: ?Principal): async TokenAmount {
    let target = switch (user) {
      case null caller;
      case (?p) p;
    };
    incentiveSystem.getBalance(target);
  };
  
  // Transfer tokens
  public shared({ caller }) func transferTokens(
    to: Principal,
    amount: TokenAmount
  ): async Result<Bool, Error> {
    incentiveSystem.transfer(caller, to, amount);
  };
  
  // Create bounty
  public shared({ caller }) func createBounty(
    repositoryId: Text,
    title: Text,
    description: Text,
    amount: TokenAmount,
    requirements: [Text],
    difficulty: Incentives.DifficultyLevel,
    expiresInDays: ?Nat
  ): async Result<Incentives.Bounty, Error> {
    if (Principal.isAnonymous(caller)) {
        return #Err(#Unauthorized("Authentication required"));
    };

    // Validate input
    if (Text.size(title) == 0 or Text.size(title) > 100) {
        return #Err(#BadRequest("Title must be 1-100 characters"));
    };

    if (Text.size(description) == 0 or Text.size(description) > 1000) {
        return #Err(#BadRequest("Description must be 1-1000 characters"));
    };

    // Check repository ownership
    let repositories = stateManager.getRepositories();
    
    switch (repositories.get(repositoryId)) {
        case null { #Err(#NotFound("Repository not found")); };
        case (?repo) {
            if (repo.owner != caller) {
                return #Err(#Forbidden("Only repository owner can create bounties"));
            };
            
            incentiveSystem.createBounty(
                caller,
                repositoryId,
                title,
                description,
                amount,
                requirements,
                difficulty,
                expiresInDays
            );
        };
    };
  };
    
  // Submit bounty solution
  public shared({ caller }) func submitBounty(
    bountyId: Text,
    pullRequestId: ?Text,
    commitIds: [Text],
    description: Text
  ): async Result<Incentives.BountySubmission, Error> {
    incentiveSystem.submitBounty(caller, bountyId, pullRequestId, commitIds, description);
  };
  
  // Get leaderboard
  public query func getLeaderboard(
    repositoryId: ?Text,
    timeframe: ?Int,
    limit: ?Nat
  ): async [LeaderboardEntry] {
    let actualLimit = switch (limit) {
        case null 10;
        case (?l) Nat.min(l, 100);
    };
    incentiveSystem.getLeaderboard(repositoryId, timeframe, actualLimit);
  };
  
  // Enhanced Search APIs
  public shared func searchWithCache(
    request: SearchRequest
  ): async Result<Types.SerializableSearchResults, Error> {
    // Use the regular search function
    let result = await search(request);
    return result;
  };
  
  // Override commit to trigger rewards
  public shared({ caller }) func commit(request: CommitRequest): async Result<Types.Commit, Error> {
    let result = GitOps.createCommit(caller, request, stateManager.getRepositories());
    
    switch (result) {
        case (#Ok(commit)) {
            // Award tokens for commit
            let _ = incentiveSystem.distributeReward(
                caller,
                request.repositoryId,
                #CommitReward,
                "Commit: " # commit.message,
                ?{
                    commitId = ?commit.id;
                    pullRequestId = null;
                    issueId = null;
                    contributionScore = ?Float.fromInt(request.files.size());
                    impactLevel = if (request.files.size() > 10) { ?#High } 
                                 else if (request.files.size() > 5) { ?#Medium }
                                 else { ?#Low };
                }
            );
            
            // Update metrics
            incentiveSystem.updateMetrics(caller, request.repositoryId, #Commit);
            
            #Ok(commit);
        };
        case (#Err(e)) { #Err(e) };
    };
  };

  // List all public repositories without authentication requirement
  public query func listPublicRepositories(
    pagination: ?PaginationParams
  ): async Result<RepositoryListResponse, Error> {
    let repositories = stateManager.getRepositories();
    
    let page = switch (pagination) { 
      case null 0; 
      case (?p) p.page 
    };
    let limit = switch (pagination) { 
      case null 20; 
      case (?p) Nat.min(p.limit, 100) 
    };
    let startIndex = page * limit;
    
    // Collect all public repositories
    var publicRepos = Buffer.Buffer<Repository>(0);
    
    for ((_, repo) in repositories.entries()) {
      if (not repo.isPrivate) {
        publicRepos.add(repo);
      };
    };
    
    // Sort by updatedAt (most recent first)
    let sortedRepos = Array.sort<Repository>(
      Buffer.toArray(publicRepos),
      func(a, b) {
        if (a.updatedAt > b.updatedAt) { #less }
        else if (a.updatedAt < b.updatedAt) { #greater }
        else { #equal }
      }
    );
    
    // Apply pagination
    let totalCount = sortedRepos.size();
    let endIndex = Nat.min(startIndex + limit, totalCount);
    let paginatedRepos = if (startIndex >= totalCount) {
      []
    } else {
      Array.tabulate<Repository>(
        endIndex - startIndex,
        func(i) { sortedRepos[startIndex + i] }
      )
    };
    
    let response: RepositoryListResponse = {
      repositories = Array.map<Repository, SerializableRepository>(
        paginatedRepos,
        func(repo) { Types.repositoryToSerializable(repo) }
      );
      totalCount = totalCount;
      hasMore = endIndex < totalCount;
    };
    
    #Ok(response);
  };

  // Search public repositories without authentication
  public query func searchPublicRepositories(
    searchQuery: Text,
    pagination: ?PaginationParams
  ): async Result<RepositoryListResponse, Error> {
    let repositories = stateManager.getRepositories();
    let lowerQuery = Utils.toLower(searchQuery);
    
    let page = switch (pagination) { 
      case null 0; 
      case (?p) p.page 
    };
    let limit = switch (pagination) { 
      case null 20; 
      case (?p) Nat.min(p.limit, 100) 
    };
    let startIndex = page * limit;
    
    var matchingRepos = Buffer.Buffer<Repository>(0);
    
    for ((_, repo) in repositories.entries()) {
      if (not repo.isPrivate) {
        let nameMatch = Utils.containsSubstring(Utils.toLower(repo.name), lowerQuery);
        let descMatch = switch (repo.description) {
          case null false;
          case (?desc) Utils.containsSubstring(Utils.toLower(desc), lowerQuery);
        };
        
        if (nameMatch or descMatch) {
          matchingRepos.add(repo);
        };
      };
    };
    
    // Sort by relevance (name matches first, then by update time)
    let sortedRepos = Array.sort<Repository>(
      Buffer.toArray(matchingRepos),
      func(a, b) {
        let aNameMatch = Utils.containsSubstring(Utils.toLower(a.name), lowerQuery);
        let bNameMatch = Utils.containsSubstring(Utils.toLower(b.name), lowerQuery);
        
        if (aNameMatch and not bNameMatch) { #less }
        else if (not aNameMatch and bNameMatch) { #greater }
        else if (a.updatedAt > b.updatedAt) { #less }
        else if (a.updatedAt < b.updatedAt) { #greater }
        else { #equal }
      }
    );
    
    // Apply pagination
    let totalCount = sortedRepos.size();
    let endIndex = Nat.min(startIndex + limit, totalCount);
    let paginatedRepos = if (startIndex >= totalCount) {
      []
    } else {
      Array.tabulate<Repository>(
        endIndex - startIndex,
        func(i) { sortedRepos[startIndex + i] }
      )
    };
    
    let response: RepositoryListResponse = {
      repositories = Array.map<Repository, SerializableRepository>(
        paginatedRepos,
        func(repo) { Types.repositoryToSerializable(repo) }
      );
      totalCount = totalCount;
      hasMore = endIndex < totalCount;
    };
    
    #Ok(response);
  };

  // Get repository stats without authentication
    public query func getGlobalStats(): async {
    totalRepositories: Nat;
    publicRepositories: Nat;
    totalUsers: Nat;
    totalStars: Nat;
    totalForks: Nat;
  } {
    let repositories = stateManager.getRepositories();
    let users = stateManager.getUsers();
    
    var publicCount = 0;
    var totalStars = 0;
    var totalForks = 0;
    
    for ((_, repo) in repositories.entries()) {
      if (not repo.isPrivate) {
        publicCount += 1;
      };
      totalStars += repo.stars;
      totalForks += repo.forks;
    };
    
    {
      totalRepositories = repositories.size();
      publicRepositories = publicCount;
      totalUsers = users.size();
      totalStars = totalStars;
      totalForks = totalForks;
    };
  };
  
  public shared ({ caller }) func createFolder(
    repositoryId: Text,
    folderPath: Text,
    folderName: Text
): async Result<FileEntry, Error> {
    let repositories = stateManager.getRepositories();
    
    switch (repositories.get(repositoryId)) {
        case null { #Err(#NotFound("Repository not found")) };
        case (?repo) {
            if (not Utils.canWriteRepository(caller, repo)) {
                return #Err(#Forbidden("No write permission"));
            };
            
            // Validate folder name
            if (not Utils.isValidFolderName(folderName)) {
                return #Err(#BadRequest("Invalid folder name"));
            };
            
            // Build full path
            let fullPath = if (folderPath == "/" or folderPath == "") {
                folderName
            } else {
                folderPath # "/" # folderName
            };
            
            // Check if folder already exists
            switch (repo.files.get(fullPath)) {
                case (?existing) {
                    if (existing.isFolder) {
                        return #Err(#Conflict("Folder already exists"));
                    };
                };
                case null {};
            };
            
            // Create folder entry
            let folderEntry: FileEntry = {
                path = fullPath;
                content = "";  // Empty text is coerced to an empty Blob
                size = 0;
                hash = Utils.generateFileHash(Text.encodeUtf8(fullPath # Int.toText(Time.now())));
                version = 1;
                lastModified = Time.now();
                author = caller;
                commitMessage = ?("Created folder: " # folderName);
                isFolder = true;
                mimeType = null;
                parentPath = if (folderPath == "/" or folderPath == "") null else ?folderPath;
                fileType = null;
                contractMetadata = null;
                targetChain = null;
            };
            
            // Add folder to repository
            repo.files.put(fullPath, folderEntry);
            
            // Update repository
            let updatedRepo = {
                repo with
                updatedAt = Time.now();
            };
            repositories.put(repositoryId, updatedRepo);
            
            #Ok(folderEntry);
        };
    };
};

// Get file tree structure for repository
public query ({ caller }) func getFileTree(
    repositoryId: Text,
    path: ?Text
): async Result<FileTreeResponse, Error> {
    let repositories = stateManager.getRepositories();
    
    switch (repositories.get(repositoryId)) {
        case null { #Err(#NotFound("Repository not found")) };
        case (?repo) {
            if (not Utils.canReadRepository(caller, repo)) {
                return #Err(#Forbidden("No read permission"));
            };
            
            // Build tree structure
            let basePath = switch (path) {
                case null "";
                case (?p) p;
            };
            
            var totalFiles = 0;
            var totalFolders = 0;
            var totalSize: Nat = 0;
            
            // First pass: collect all files and folders
            for ((filePath, file) in repo.files.entries()) {
                if (basePath == "" or Text.startsWith(filePath, #text basePath)) {
                    if (file.isFolder) {
                        totalFolders += 1;
                    } else {
                        totalFiles += 1;
                        totalSize += file.size;
                    };
                };
            };
            
            // Build tree structure (simplified for now)
            let rootNodes = Buffer.Buffer<FileTreeNode>(10);
            
            for ((filePath, file) in repo.files.entries()) {
                if (basePath == "" or filePath == basePath) {
                    // Root level files/folders
                    if (Text.contains(filePath, #char '/') == false or filePath == basePath) {
                        rootNodes.add({
                            path = file.path;
                            name = Utils.getFileName(file.path);
                            isFolder = file.isFolder;
                            size = file.size;
                            lastModified = file.lastModified;
                            children = [];
                        });
                    };
                };
            };
            
            #Ok({
                repositoryId = repositoryId;
                tree = Buffer.toArray(rootNodes);
                totalFiles = totalFiles;
                totalFolders = totalFolders;
                totalSize = totalSize;
            });
        };
    };
};

// Enhanced upload file with folder support
public shared ({ caller }) func uploadFileToFolder(
    request: UploadFileRequest,
    folderPath: ?Text
): async Result<FileEntry, Error> {
    let repositories = stateManager.getRepositories();
    
    switch (repositories.get(request.repositoryId)) {
        case null { #Err(#NotFound("Repository not found")) };
        case (?repo) {
            if (not Utils.canWriteRepository(caller, repo)) {
                return #Err(#Forbidden("No write permission"));
            };
            
            // Build full path with folder
            let fullPath = switch (folderPath) {
                case null request.path;
                case (?folder) {
                    if (folder == "/" or folder == "") {
                        request.path;
                    } else {
                        folder # "/" # request.path;
                    };
                };
            };
            
            // Extract file name from path
            let fileName = Utils.getFileName(request.path);
            let mimeType = Utils.getMimeType(fileName);
            
            let fileEntry: FileEntry = {
                path = fullPath;
                content = request.content;
                size = request.content.size();
                hash = Utils.generateFileHash(request.content);
                version = switch (repo.files.get(fullPath)) {
                    case (?existing) existing.version + 1;
                    case null 1;
                };
                lastModified = Time.now();
                author = caller;
                commitMessage = ?request.commitMessage;
                isFolder = false;
                mimeType = ?mimeType;
                parentPath = folderPath;
                fileType = Utils.detectFileType(fileName, request.content);
                contractMetadata = null;
                targetChain = null;
            };
            
            // Add file to repository
            repo.files.put(fullPath, fileEntry);
            
            // Update repository size
            let updatedRepo = {
                repo with
                size = repo.size + fileEntry.size;
                updatedAt = Time.now();
            };
            repositories.put(request.repositoryId, updatedRepo);
            
            #Ok(fileEntry);
        };
    };
};

// Delete folder and all its contents
public shared ({ caller }) func deleteFolder(
    repositoryId: Text,
    folderPath: Text
): async Result<Bool, Error> {
    let repositories = stateManager.getRepositories();
    
    switch (repositories.get(repositoryId)) {
        case null { #Err(#NotFound("Repository not found")) };
        case (?repo) {
            if (not Utils.canWriteRepository(caller, repo)) {
                return #Err(#Forbidden("No write permission"));
            };
            
            // Check if folder exists
            switch (repo.files.get(folderPath)) {
                case null { return #Err(#NotFound("Folder not found")) };
                case (?folder) {
                    if (not folder.isFolder) {
                        return #Err(#BadRequest("Path is not a folder"));
                    };
                };
            };
            
            // Delete folder and all contents
            var deletedSize: Nat = 0;
            let toDelete = Buffer.Buffer<Text>(10);
            
            for ((path, file) in repo.files.entries()) {
                if (path == folderPath or Text.startsWith(path, #text (folderPath # "/"))) {
                    toDelete.add(path);
                    if (not file.isFolder) {
                        deletedSize += file.size;
                    };
                };
            };
            
            // Remove all files and folders
            for (path in toDelete.vals()) {
                repo.files.delete(path);
            };
            
            // Update repository
            let updatedRepo = {
                repo with
                size = Nat.sub(repo.size, deletedSize);
                updatedAt = Time.now();
            };
            repositories.put(repositoryId, updatedRepo);
            
            #Ok(true);
        };
    };
};

};
