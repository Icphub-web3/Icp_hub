import Types "../types";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Result "mo:base/Result";
import Option "mo:base/Option";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Blob "mo:base/Blob";
import Utils "../utils/utils";
import Iter "mo:base/Iter";
import Order "mo:base/Order";

module GitOperations {
    // Type definitions
    type Repository = Types.Repository;
    type FileEntry = Types.FileEntry;
    type Commit = Types.Commit;
    type Branch = Types.Branch;
    type Result<T, E> = Types.Result<T, E>;
    type Error = Types.Error;

    // Git-specific types
    public type CommitRequest = {
        repositoryId: Text;
        branch: Text;
        message: Text;
        files: [{
            path: Text;
            content: ?Blob; // null means delete
            action: FileAction;
        }];
        parentCommit: ?Text;
    };

    public type FileAction = {
        #Add;
        #Modify;
        #Delete;
        #Rename: { from: Text; to: Text };
    };

    public type DiffResult = {
        path: Text;
        action: FileAction;
        oldContent: ?Blob;
        newContent: ?Blob;
        additions: Nat;
        deletions: Nat;
    };

    public type MergeRequest = {
        repositoryId: Text;
        sourceBranch: Text;
        targetBranch: Text;
        title: Text;
        description: ?Text;
    };

    public type MergeConflict = {
        path: Text;
        baseContent: ?Blob;
        sourceContent: ?Blob;
        targetContent: ?Blob;
    };

    public type MergeResult = {
        success: Bool;
        commitId: ?Text;
        conflicts: [MergeConflict];
    };

    public type BranchRequest = {
        repositoryId: Text;
        branchName: Text;
        fromBranch: Text; // Source branch to create from
    };

    public type TagRequest = {
        repositoryId: Text;
        tagName: Text;
        commitId: Text;
        message: ?Text;
    };

    public type Tag = {
        name: Text;
        commitId: Text;
        tagger: Principal;
        message: ?Text;
        createdAt: Int;
    };

    public type GitLog = {
        commits: [Commit];
        totalCount: Nat;
        hasMore: Bool;
    };

    public type CloneRequest = {
        sourceRepositoryId: Text;
        newName: Text;
        isPrivate: Bool;
    };

    public type GitStatus = {
        branch: Text;
        uncommittedChanges: [DiffResult];
        ahead: Nat; // Commits ahead of origin
        behind: Nat; // Commits behind origin
    };

    public type BlockchainType = {
        #ICP;
        #Ethereum;
        #Solana;
        #Bitcoin;
        #Polygon;
        #Arbitrum;
        #BinanceSmartChain;
        #Avalanche;
        #Near;
        #Cosmos;
        #Polkadot;
    };

    public type SmartContractLanguage = {
        #Motoko;
        #Solidity;
        #Rust;
        #Move;
        #Clarity;
        #Cairo;
        #Vyper;
        #Wasm;
        #Plutus;
        #Michelson;
    };

    public type ContractMetadata = {
        blockchain: BlockchainType;
        language: SmartContractLanguage;
        version: Text;
        compiler: ?Text;
        abi: ?Text; // Application Binary Interface
        bytecode: ?Blob;
        sourceFiles: [Text]; // Paths to source files
        dependencies: [Dependency];
        deploymentConfig: ?DeploymentConfig;
    };

    public type Dependency = {
        name: Text;
        version: Text;
        source: DependencySource;
    };

    public type DependencySource = {
        #NPM;
        #Cargo;
        #Maven;
        #GitHub: { owner: Text; repo: Text; commit: Text };
        #IPFS: { cid: Text };
        #Vessel; // Motoko package manager
    };

    public type DeploymentConfig = {
        network: NetworkConfig;
        constructorArgs: ?Text; // JSON encoded
        gasLimit: ?Nat;
        value: ?Nat;
        wallet: ?Text; // Encrypted wallet info
    };

    public type NetworkConfig = {
        #Mainnet;
        #Testnet: { name: Text }; // Goerli, Mumbai, etc.
        #Local: { rpcUrl: Text };
        #Custom: { chainId: Nat; rpcUrl: Text };
    };

    public type BuildConfig = {
        blockchain: BlockchainType;
        entryPoint: Text;
        outputDir: Text;
        optimization: Bool;
        additionalFlags: [Text];
    };

    public type TestConfig = {
        framework: TestFramework;
        testFiles: [Text];
        coverage: Bool;
        network: ?NetworkConfig;
    };

    public type TestFramework = {
        #Hardhat;
        #Truffle;
        #Foundry;
        #Anchor; // Solana
        #MotokoTest;
        #Jest;
        #Mocha;
    };

    public type ContractVerification = {
        blockchain: BlockchainType;
        contractAddress: Text;
        sourceCode: Text;
        compilerVersion: Text;
        optimizationUsed: Bool;
        runs: Nat;
        constructorArguments: ?Text;
        libraries: [(Text, Text)]; // (name, address) pairs
        verifiedAt: Int;
        explorerUrl: Text;
    };

    public type MultiChainCommit = {
        // Extends regular commit
        baseCommit: Commit;
        contractChanges: [ContractChange];
        deployments: [DeploymentRecord];
        crossChainCalls: [CrossChainCall];
    };

    public type ContractChange = {
        path: Text;
        blockchain: BlockchainType;
        language: SmartContractLanguage;
        changeType: {
            #Created;
            #Modified;
            #Deleted;
            #Deployed;
            #Upgraded;
        };
        metadata: ?ContractMetadata;
    };

    public type DeploymentRecord = {
        commitId: Text;
        blockchain: BlockchainType;
        network: NetworkConfig;
        contractAddress: Text;
        transactionHash: Text;
        deployedAt: Int;
        deployer: Principal;
        gasUsed: ?Nat;
        status: DeploymentStatus;
    };

    public type DeploymentStatus = {
        #Pending;
        #Success;
        #Failed: { reason: Text };
        #Verified;
    };

    public type CrossChainCall = {
        fromChain: BlockchainType;
        toChain: BlockchainType;
        method: Text;
        params: Text; // JSON encoded
        protocol: CrossChainProtocol;
    };

    public type CrossChainProtocol = {
        #ChainFusion; // ICP's native
        #LayerZero;
        #Axelar;
        #Wormhole;
        #Chainlink_CCIP;
        #Cosmos_IBC;
    };

    public type SecurityAudit = {
        commitId: Text;
        auditor: Text;
        findings: [SecurityFinding];
        score: Nat; // 0-100
        auditedAt: Int;
        reportUrl: ?Text;
    };

    public type SecurityFinding = {
        severity: {
            #Critical;
            #High;
            #Medium;
            #Low;
            #Info;
        };
        category: Text;
        description: Text;
        location: Text; // File:line
        recommendation: Text;
        fixed: Bool;
    };

    // Enhanced repository type for multi-chain
    public type MultiChainRepository = {
        baseRepository: Repository;
        supportedBlockchains: [BlockchainType];
        contractMetadata: HashMap.HashMap<Text, ContractMetadata>; // path -> metadata
        deployments: [DeploymentRecord];
        buildConfigs: HashMap.HashMap<BlockchainType, BuildConfig>;
        testConfigs: HashMap.HashMap<BlockchainType, TestConfig>;
        securityAudits: [SecurityAudit];
    };


    // Helper functions

    // Generate commit hash
    public func generateCommitHash(
        repositoryId: Text,
        author: Principal,
        message: Text,
        files: [(Text, Blob)],
        parentCommit: ?Text
    ): Text {
        let filesHash = Array.foldLeft<(Text, Blob), Text>(
            files,
            "",
            func(acc, (path, _)) { acc # path }
        );
        
        let parentHash = switch (parentCommit) {
            case null "";
            case (?parent) parent;
        };
        
        Utils.generateCommitHash(
            repositoryId # filesHash # parentHash,
            author,
            message,
            Time.now()
        );
    };

    // Calculate diff between two file versions
    public func calculateDiff(
        oldContent: ?Blob,
        newContent: ?Blob,
        path: Text
    ): DiffResult {
        let action = switch (oldContent, newContent) {
            case (null, null) { #Modify }; // Shouldn't happen
            case (null, ?_) { #Add };
            case (?_, null) { #Delete };
            case (?_, ?_) { #Modify };
        };

        // Simple line count for additions/deletions
        let oldLines = switch (oldContent) {
            case null 0;
            case (?content) countLines(content);
        };

        let newLines = switch (newContent) {
            case null 0;
            case (?content) countLines(content);
        };

        {
            path = path;
            action = action;
            oldContent = oldContent;
            newContent = newContent;
            additions = if (newLines > oldLines) { newLines - oldLines } else { 0 };
            deletions = if (oldLines > newLines) { oldLines - newLines } else { 0 };
        };
    };

    // Count lines in a blob (simplified)
    private func countLines(content: Blob): Nat {
        let bytes = Blob.toArray(content);
        var lines = 1;
        for (byte in bytes.vals()) {
            if (byte == 10) { // newline character
                lines += 1;
            };
        };
        lines;
    };

    // Main Git operations

    // Create a commit
    public func createCommit(
        caller: Principal,
        request: CommitRequest,
        repositories: HashMap.HashMap<Text, Repository>
    ): Result<Commit, Error> {
        // Get repository
        let repo = switch (repositories.get(request.repositoryId)) {
            case null { return #Err(#NotFound("Repository not found")); };
            case (?r) r;
        };

        // Check write permission
        if (not Utils.canWriteRepository(caller, repo)) {
            return #Err(#Forbidden("No write permission"));
        };

        // Validate branch exists
        let branchExists = Array.find<Branch>(
            repo.branches,
            func(b) { b.name == request.branch }
        );

        if (branchExists == null) {
            return #Err(#NotFound("Branch not found"));
        };

        // Process file changes
        let changedFiles = Buffer.Buffer<Text>(request.files.size());
        let filesList = Buffer.Buffer<(Text, Blob)>(request.files.size());

        for (file in request.files.vals()) {
            changedFiles.add(file.path);
            
            switch (file.action) {
                case (#Add or #Modify) {
                    switch (file.content) {
                        case null { return #Err(#BadRequest("Content required for add/modify")); };
                        case (?content) {
                            // Create a new FileEntry object properly
                            let newFileEntry: FileEntry = {
                                path = file.path;
                                content = content;
                                size = content.size();
                                hash = Utils.generateFileHash(content);
                                version = switch (repo.files.get(file.path)) {
                                    case null 1;
                                    case (?existing) existing.version + 1;
                                };
                                lastModified = Time.now();
                                author = caller;
                                commitMessage = ?request.message;
                                fileType = null;
                                contractMetadata = null;
                                targetChain = null;
                            };

                            // Then put it in the files HashMap
                            repo.files.put(file.path, newFileEntry);
                            filesList.add((file.path, content));
                        };
                    };
                };
                case (#Delete) {
                    repo.files.delete(file.path);
                };
                case (#Rename(rename)) {
                    switch (repo.files.get(rename.from)) {
                        case null { return #Err(#NotFound("Source file not found")); };
                        case (?fileEntry) {
                            repo.files.delete(rename.from);
                            repo.files.put(rename.to, {
                                fileEntry with
                                path = rename.to;
                                lastModified = Time.now();
                                author = caller;
                            });
                        };
                    };
                };
            };
        };

        // Create commit
        let commitId = generateCommitHash(
            request.repositoryId,
            caller,
            request.message,
            Buffer.toArray(filesList),
            request.parentCommit
        );

        let newCommit: Commit = {
            id = commitId;
            message = request.message;
            author = caller;
            timestamp = Time.now();
            parentCommits = switch (request.parentCommit) {
                case null [];
                case (?parent) [parent];
            };
            changedFiles = Buffer.toArray(changedFiles);
            hash = commitId;
        };

        // Update repository
        let updatedCommits = Array.append(repo.commits, [newCommit]);
        let updatedBranches = Array.map<Branch, Branch>(
            repo.branches,
            func(b) {
                if (b.name == request.branch) {
                    { b with commitId = commitId }
                } else { b }
            }
        );

        let updatedRepo = {
            repo with
            commits = updatedCommits;
            branches = updatedBranches;
            updatedAt = Time.now();
        };

        repositories.put(request.repositoryId, updatedRepo);
        #Ok(newCommit);
    };

    // Create a new branch
    public func createBranch(
        caller: Principal,
        request: BranchRequest,
        repositories: HashMap.HashMap<Text, Repository>
    ): Result<Branch, Error> {
        // Get repository
        let repo = switch (repositories.get(request.repositoryId)) {
            case null { return #Err(#NotFound("Repository not found")); };
            case (?r) r;
        };

        // Check write permission
        if (not Utils.canWriteRepository(caller, repo)) {
            return #Err(#Forbidden("No write permission"));
        };

        // Validate branch name
        if (not Utils.isValidBranchName(request.branchName)) {
            return #Err(#BadRequest("Invalid branch name"));
        };

        // Check if branch already exists
        let exists = Array.find<Branch>(
            repo.branches,
            func(b) { b.name == request.branchName }
        );

        if (exists != null) {
            return #Err(#Conflict("Branch already exists"));
        };

        // Find source branch
        let sourceBranch = switch (Array.find<Branch>(
            repo.branches,
            func(b) { b.name == request.fromBranch }
        )) {
            case null { return #Err(#NotFound("Source branch not found")); };
            case (?branch) branch;
        };

        // Create new branch
        let newBranch: Branch = {
            name = request.branchName;
            commitId = sourceBranch.commitId;
            isDefault = false;
            createdAt = Time.now();
            createdBy = caller;
        };

        // Update repository
        let updatedRepo = {
            repo with
            branches = Array.append(repo.branches, [newBranch]);
            updatedAt = Time.now();
        };

        repositories.put(request.repositoryId, updatedRepo);
        #Ok(newBranch);
    };

    // Delete a branch
    public func deleteBranch(
        caller: Principal,
        repositoryId: Text,
        branchName: Text,
        repositories: HashMap.HashMap<Text, Repository>
    ): Result<Bool, Error> {
        // Get repository
        let repo = switch (repositories.get(repositoryId)) {
            case null { return #Err(#NotFound("Repository not found")); };
            case (?r) r;
        };

        // Check admin permission
        if (not Utils.canAdminRepository(caller, repo)) {
            return #Err(#Forbidden("Admin permission required"));
        };

        // Find branch
        let branch = Array.find<Branch>(
            repo.branches,
            func(b) { b.name == branchName }
        );

        switch (branch) {
            case null { return #Err(#NotFound("Branch not found")); };
            case (?b) {
                if (b.isDefault) {
                    return #Err(#BadRequest("Cannot delete default branch"));
                };
            };
        };

        // Remove branch
        let updatedBranches = Array.filter<Branch>(
            repo.branches,
            func(b) { b.name != branchName }
        );

        let updatedRepo = {
            repo with
            branches = updatedBranches;
            updatedAt = Time.now();
        };

        repositories.put(repositoryId, updatedRepo);
        #Ok(true);
    };

    // Get commit history
    public func getCommitHistory(
        repositoryId: Text,
        branch: ?Text,
        limit: Nat,
        offset: Nat,
        repositories: HashMap.HashMap<Text, Repository>
    ): Result<GitLog, Error> {
        // Get repository
        let repo = switch (repositories.get(repositoryId)) {
            case null { return #Err(#NotFound("Repository not found")); };
            case (?r) r;
        };

        // Sort commits by timestamp (newest first)
        let sortedCommits = Array.sort<Commit>(
            repo.commits,
            func(a, b) { Int.compare(b.timestamp, a.timestamp) }
        );

        // Paginate
        let totalCount = sortedCommits.size();
        let startIndex = offset;
        let endIndex = Nat.min(offset + limit, totalCount);

        let paginatedCommits = if (startIndex < totalCount) {
            Array.subArray<Commit>(sortedCommits, startIndex, endIndex - startIndex)
        } else {
            []
        };

        #Ok({
            commits = paginatedCommits;
            totalCount = totalCount;
            hasMore = endIndex < totalCount;
        });
    };

    // Get diff between commits
    public func getCommitDiff(
        repositoryId: Text,
        commitId: Text,
        repositories: HashMap.HashMap<Text, Repository>
    ): Result<[DiffResult], Error> {
        // Get repository
        let repo = switch (repositories.get(repositoryId)) {
            case null { return #Err(#NotFound("Repository not found")); };
            case (?r) r;
        };

        // Find commit
        let commit = Array.find<Commit>(
            repo.commits,
            func(c) { c.id == commitId }
        );

        switch (commit) {
            case null { return #Err(#NotFound("Commit not found")); };
            case (?c) {
                let diffs = Buffer.Buffer<DiffResult>(c.changedFiles.size());
                
                // For each changed file, create a diff
                for (path in c.changedFiles.vals()) {
                    let currentFile = repo.files.get(path);
                    
                    // Simplified diff - in production, compare with parent commit
                    let diff = calculateDiff(
                        null, // Would be parent commit's file version
                        switch (currentFile) {
                            case null null;
                            case (?f) ?f.content;
                        },
                        path
                    );
                    
                    diffs.add(diff);
                };
                
                #Ok(Buffer.toArray(diffs));
            };
        };
    };

    // Merge branches (simplified)
    public func mergeBranches(
        caller: Principal,
        request: MergeRequest,
        repositories: HashMap.HashMap<Text, Repository>
    ): Result<MergeResult, Error> {
        // Get repository
        let repo = switch (repositories.get(request.repositoryId)) {
            case null { return #Err(#NotFound("Repository not found")); };
            case (?r) r;
        };

        // Check write permission
        if (not Utils.canWriteRepository(caller, repo)) {
            return #Err(#Forbidden("No write permission"));
        };

        // Find branches
        let sourceBranch = Array.find<Branch>(
            repo.branches,
            func(b) { b.name == request.sourceBranch }
        );

        let targetBranch = Array.find<Branch>(
            repo.branches,
            func(b) { b.name == request.targetBranch }
        );

        switch (sourceBranch, targetBranch) {
            case (null, _) { return #Err(#NotFound("Source branch not found")); };
            case (_, null) { return #Err(#NotFound("Target branch not found")); };
            case (?source, ?target) {
                // Simplified merge - in production, implement proper 3-way merge
                // For now, just update target branch to source commit
                
                let mergeCommit: Commit = {
                    id = Utils.generateCommitHash(
                        request.repositoryId,
                        caller,
                        "Merge " # source.name # " into " # target.name,
                        Time.now()
                    );
                    message = "Merge " # source.name # " into " # target.name;
                    author = caller;
                    timestamp = Time.now();
                    parentCommits = [source.commitId, target.commitId];
                    changedFiles = [];
                    hash = "";
                };

                // Update target branch
                let updatedBranches = Array.map<Branch, Branch>(
                    repo.branches,
                    func(b) {
                        if (b.name == target.name) {
                            { b with commitId = mergeCommit.id }
                        } else { b }
                    }
                );

                let updatedRepo = {
                    repo with
                    commits = Array.append(repo.commits, [mergeCommit]);
                    branches = updatedBranches;
                    updatedAt = Time.now();
                };

                repositories.put(request.repositoryId, updatedRepo);

                #Ok({
                    success = true;
                    commitId = ?mergeCommit.id;
                    conflicts = [];
                });
            };
        };
    };

    // Clone repository
    public func cloneRepository(
        caller: Principal,
        request: CloneRequest,
        repositories: HashMap.HashMap<Text, Repository>,
        generateRepoId: () -> Text
    ): Result<Repository, Error> {
        // Get source repository
        let sourceRepo = switch (repositories.get(request.sourceRepositoryId)) {
            case null { return #Err(#NotFound("Source repository not found")); };
            case (?r) r;
        };

        // Check read permission
        if (not Utils.canReadRepository(caller, sourceRepo)) {
            return #Err(#Forbidden("No read permission on source repository"));
        };

        // Create new repository with cloned data
        let newRepoId = generateRepoId();
        let now = Time.now();

        // Clone files
        let clonedFiles = HashMap.HashMap<Text, FileEntry>(
            sourceRepo.files.size(),
            Text.equal,
            Text.hash
        );

        for ((path, file) in sourceRepo.files.entries()) {
            clonedFiles.put(path, {
                file with
                author = caller;
                lastModified = now;
            });
        };

        // Create clone with new ownership
        let newCollaborators = HashMap.HashMap<Principal, Types.Collaborator>(0, Principal.equal, Principal.hash);

        let clonedRepo: Repository = {
            id = newRepoId;
            name = request.newName;
            description = ?("Cloned from " # sourceRepo.name);
            owner = caller;
            collaborators = newCollaborators;
            isPrivate = request.isPrivate;
            settings = sourceRepo.settings;
            createdAt = now;
            updatedAt = now;
            files = clonedFiles;
            commits = [{
                id = Utils.generateCommitHash(newRepoId, caller, "Initial clone", now);
                message = "Initial clone from " # sourceRepo.name;
                author = caller;
                timestamp = now;
                parentCommits = [];
                changedFiles = Iter.toArray(Iter.map<(Text, FileEntry), Text>(
                    sourceRepo.files.entries(),
                    func((path, _)) { path }
                ));
                hash = "";
            }];
            branches = [{
                name = "main";
                commitId = "initial_clone";
                isDefault = true;
                createdAt = now;
                createdBy = caller;
            }];
            stars = 0;
            forks = sourceRepo.forks + 1;
            language = sourceRepo.language;
            size = sourceRepo.size;

            chainConfigs = [];
            deploymentTargets = [];
            lastDeployment = null;
            supportedChains = [];
        };

        repositories.put(newRepoId, clonedRepo);

        // Update source repo fork count
        let updatedSourceRepo = {
            sourceRepo with
            forks = sourceRepo.forks + 1;
        };
        repositories.put(request.sourceRepositoryId, updatedSourceRepo);

        #Ok(clonedRepo);
    };

    // Get repository status
    public func getStatus(
        repositoryId: Text,
        branch: Text,
        repositories: HashMap.HashMap<Text, Repository>
    ): Result<GitStatus, Error> {
        // Get repository
        let repo = switch (repositories.get(repositoryId)) {
            case null { return #Err(#NotFound("Repository not found")); };
            case (?r) r;
        };

        // Find branch
        let currentBranch = Array.find<Branch>(
            repo.branches,
            func(b) { b.name == branch }
        );

        switch (currentBranch) {
            case null { return #Err(#NotFound("Branch not found")); };
            case (?b) {
                #Ok({
                    branch = b.name;
                    uncommittedChanges = []; // Simplified - no staging area
                    ahead = 0; // Simplified - no remote tracking
                    behind = 0;
                });
            };
        };
    };

    // Create tag
    public func createTag(
        caller: Principal,
        request: TagRequest,
        repositories: HashMap.HashMap<Text, Repository>
    ): Result<Tag, Error> {
        // Get repository
        let repo = switch (repositories.get(request.repositoryId)) {
            case null { return #Err(#NotFound("Repository not found")); };
            case (?r) r;
        };

        // Check write permission
        if (not Utils.canWriteRepository(caller, repo)) {
            return #Err(#Forbidden("No write permission"));
        };

        // Validate tag name
        if (Text.size(request.tagName) == 0 or Text.size(request.tagName) > 50) {
            return #Err(#BadRequest("Invalid tag name"));
        };

        // Verify commit exists
        let commitExists = Array.find<Commit>(
            repo.commits,
            func(c) { c.id == request.commitId }
        );

        if (commitExists == null) {
            return #Err(#NotFound("Commit not found"));
        };

        let tag: Tag = {
            name = request.tagName;
            commitId = request.commitId;
            tagger = caller;
            message = request.message;
            createdAt = Time.now();
        };

        // Note: Tags should be stored separately in production
        // For now, returning the created tag
        #Ok(tag);
    };

     public func detectBlockchainFromFile(path: Text, content: Blob): ?(BlockchainType, SmartContractLanguage) {
        let extension = Utils.getFileExtension(path);
        
        switch (extension) {
            case (?ext) {
                switch (ext) {
                    case "mo" { ?(#ICP, #Motoko) };
                    case "sol" { ?(#Ethereum, #Solidity) };
                    case "rs" {
                        // Check if it's Solana or Near by looking at imports
                        switch (Text.decodeUtf8(content)) {
                            case (?code) {
                                if (Utils.containsSubstring(code, "use anchor_lang") or 
                                    Utils.containsSubstring(code, "use solana_program")) {
                                    ?(#Solana, #Rust)
                                } else if (Utils.containsSubstring(code, "use near_sdk")) {
                                    ?(#Near, #Rust)
                                } else {
                                    null
                                };
                            };
                            case null { null };
                        };
                    };
                    case "vy" { ?(#Ethereum, #Vyper) };
                    case "move" { ?(#Ethereum, #Move) }; // For Sui/Aptos
                    case "clar" { ?(#Bitcoin, #Clarity) }; // Stacks
                    case "cairo" { ?(#Ethereum, #Cairo) }; // StarkNet
                    case _ { null };
                };
            };
            case null { null };
        };
    };

    // Parse contract metadata from source
    public func parseContractMetadata(
        path: Text,
        content: Blob,
        blockchain: BlockchainType,
        language: SmartContractLanguage
    ): Result<ContractMetadata, Error> {
        // Parse dependencies, compiler directives, etc.
        switch (language) {
            case (#Solidity) {
                // Parse pragma, imports, etc.
                switch (Text.decodeUtf8(content)) {
                    case (?code) {
                        let version = parseSolidityVersion(code);
                        let imports = parseSolidityImports(code);
                        
                        #Ok({
                            blockchain = blockchain;
                            language = language;
                            version = switch (version) {
                                case (?v) v;
                                case null "unknown";
                            };
                            compiler = ?("solc");
                            abi = null; // Would be generated during compilation
                            bytecode = null;
                            sourceFiles = [path];
                            dependencies = imports;
                            deploymentConfig = null;
                        });
                    };
                    case null { #Err(#BadRequest("Cannot decode file content")); };
                };
            };
            case (#Motoko) {
                // Parse Motoko imports
                #Ok({
                    blockchain = #ICP;
                    language = #Motoko;
                    version = "0.11.0"; // Current Motoko version
                    compiler = ?("moc");
                    abi = null;
                    bytecode = null;
                    sourceFiles = [path];
                    dependencies = [];
                    deploymentConfig = null;
                });
            };
            case _ {
                // Basic metadata for other languages
                #Ok({
                    blockchain = blockchain;
                    language = language;
                    version = "unknown";
                    compiler = null;
                    abi = null;
                    bytecode = null;
                    sourceFiles = [path];
                    dependencies = [];
                    deploymentConfig = null;
                });
            };
        };
    };

    // Helper to parse Solidity version
    private func parseSolidityVersion(code: Text): ?Text {
        // Look for pragma solidity ^0.8.0;
        if (Utils.containsSubstring(code, "pragma solidity")) {
            // Simplified - in production, use proper regex
            ?"0.8.0"
        } else {
            null
        };
    };

    // Helper to parse Solidity imports
    private func parseSolidityImports(code: Text): [Dependency] {
        // Simplified - look for import statements
        let deps = Buffer.Buffer<Dependency>(0);
        
        if (Utils.containsSubstring(code, "@openzeppelin")) {
            deps.add({
                name = "@openzeppelin/contracts";
                version = "4.9.0";
                source = #NPM;
            });
        };
        
        Buffer.toArray(deps);
    };

    // Create multi-chain aware commit
    public func createMultiChainCommit(
        caller: Principal,
        request: CommitRequest,
        repositories: HashMap.HashMap<Text, Repository>,
        multiChainRepos: HashMap.HashMap<Text, MultiChainRepository>
    ): Result<MultiChainCommit, Error> {
        // First create base commit
        let baseCommitResult = createCommit(caller, request, repositories);
        
        switch (baseCommitResult) {
            case (#Err(e)) { return #Err(e); };
            case (#Ok(baseCommit)) {
                let contractChanges = Buffer.Buffer<ContractChange>(0);
                
                // Analyze file changes for blockchain-specific content
                for (file in request.files.vals()) {
                    switch (file.content) {
                        case (?content) {
                            switch (detectBlockchainFromFile(file.path, content)) {
                                case (?(blockchain, language)) {
                                    let change: ContractChange = {
                                        path = file.path;
                                        blockchain = blockchain;
                                        language = language;
                                        changeType = switch (file.action) {
                                            case (#Add) #Created;
                                            case (#Modify) #Modified;
                                            case (#Delete) #Deleted;
                                            case (#Rename(_)) #Modified;
                                        };
                                        metadata = switch (parseContractMetadata(file.path, content, blockchain, language)) {
                                            case (#Ok(meta)) ?meta;
                                            case (#Err(_)) null;
                                        };
                                    };
                                    contractChanges.add(change);
                                };
                                case null {};
                            };
                        };
                        case null {};
                    };
                };
                
                #Ok({
                    baseCommit = baseCommit;
                    contractChanges = Buffer.toArray(contractChanges);
                    deployments = [];
                    crossChainCalls = [];
                });
            };
        };
    };

    // Get multi-chain repository stats
    public func getMultiChainStats(
        repositoryId: Text,
        repositories: HashMap.HashMap<Text, Repository>,
        multiChainRepos: HashMap.HashMap<Text, MultiChainRepository>
    ): Result<{
        blockchains: [(BlockchainType, Nat)]; // blockchain -> file count
        languages: [(SmartContractLanguage, Nat)];
        deployments: Nat;
        crossChainCalls: Nat;
        securityScore: ?Nat;
    }, Error> {
        switch (repositories.get(repositoryId)) {
            case null { #Err(#NotFound("Repository not found")); };
            case (?repo) {
                switch (multiChainRepos.get(repositoryId)) {
                    case null {
                        // Not a multi-chain repo yet
                        #Ok({
                            blockchains = [];
                            languages = [];
                            deployments = 0;
                            crossChainCalls = 0;
                            securityScore = null;
                        });
                    };
                    case (?multiRepo) {
                        // Calculate stats
                        let blockchainCounts = HashMap.HashMap<BlockchainType, Nat>(10, func(a, b) { a == b }, func(b) { 0 });
                        let languageCounts = HashMap.HashMap<SmartContractLanguage, Nat>(10, func(a, b) { a == b }, func(l) { 0 });
                        
                        // Count files by blockchain and language
                        for ((path, metadata) in multiRepo.contractMetadata.entries()) {
                            let currentBlockchainCount = switch (blockchainCounts.get(metadata.blockchain)) {
                                case null 0;
                                case (?count) count;
                            };
                            blockchainCounts.put(metadata.blockchain, currentBlockchainCount + 1);
                            
                            let currentLangCount = switch (languageCounts.get(metadata.language)) {
                                case null 0;
                                case (?count) count;
                            };
                            languageCounts.put(metadata.language, currentLangCount + 1);
                        };
                        
                        // Calculate average security score
                        let avgScore = if (multiRepo.securityAudits.size() > 0) {
                            var total = 0;
                            for (audit in multiRepo.securityAudits.vals()) {
                                total += audit.score;
                            };
                            ?(total / multiRepo.securityAudits.size());
                        } else {
                            null
                        };
                        
                        #Ok({
                            blockchains = Iter.toArray(blockchainCounts.entries());
                            languages = Iter.toArray(languageCounts.entries());
                            deployments = multiRepo.deployments.size();
                            crossChainCalls = 0; // Would need to count from commits
                            securityScore = avgScore;
                        });
                    };
                };
            };
        };
    };
};
