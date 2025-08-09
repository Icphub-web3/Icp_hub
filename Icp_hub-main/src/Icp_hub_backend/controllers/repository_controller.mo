import Types "../types";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Utils "../utils/utils";
import Buffer "mo:base/Buffer";
import Debug "mo:base/Debug";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Float "mo:base/Float";
import State "../models/state_model";
import GitOps "../services/git_operations_service";

module RepositoryManager {
    // Type aliases
    type Repository = Types.Repository;
    type SerializableRepository = Types.SerializableRepository;
    type User = Types.User;
    type FileEntry = Types.FileEntry;
    type CreateRepositoryRequest = Types.CreateRepositoryRequest;
    type UpdateRepositoryRequest = Types.UpdateRepositoryRequest;
    type UploadFileRequest = Types.UploadFileRequest;
    type RepositoryListResponse = Types.RepositoryListResponse;
    type FileListResponse = Types.FileListResponse;
    type PaginationParams = Types.PaginationParams;
    type Result<T, E> = Types.Result<T, E>;
    type Error = Types.Error;

    // Repository search result types
    type RepositorySearchResult = Types.RepositorySearchResult;
    type FileSearchResult = Types.FileSearchResult;

    public class RepositoryManager(stateManager: State.StateManager) {

        // Create repository
        public func createRepository(
            caller: Principal,
            request: CreateRepositoryRequest
        ): Result<SerializableRepository, Error> {
            // Get state from state manager
            let users = stateManager.getUsers();
            let repositories = stateManager.getRepositories();

            // Check if user exists and get user object
            let user = switch (users.get(caller)) {
                case null { return #Err(#Unauthorized("User not registered")) };
                case (?user) { user };
            };

            // Input Validation
            if (not Utils.isValidRepositoryName(request.name)) {
                return #Err(
                    #BadRequest(
                        "Invalid repository name. Use 1-100 characters without leading/trailing special characters."
                    )
                );
            };

            if (switch (request.description) { case null false; case (?d) Text.size(d) > 500 }) {
                return #Err(#BadRequest("Description cannot exceed 500 characters."));
            };

            if (request.targetChains.size() == 0) {
                return #Err(#BadRequest("At least one target chain must be specified"));
            };

            let now = Time.now();
            let repositoryId = stateManager.generateRepositoryId();

            let targetChains = if (request.targetChains.size() == 0) {
                [#ICP];
            } else {
                request.targetChains;
            };

            let chainConfigsBuffer = Buffer.Buffer<(Types.BlockchainType, Types.ChainConfig)>(targetChains.size());
            for (chain in targetChains.vals()) {
                chainConfigsBuffer.add((chain, Utils.getDefaultChainConfig(chain)));
            };

            let defaultSettings: Types.RepositorySettings = {
                defaultBranch = "main";
                allowForking = true;
                allowIssues = true;
                allowWiki = true;
                allowProjects = true;
                visibility = if (request.isPrivate) #Private else #Public;
                license = request.license;
                topics = [];
            };

            let mainBranch: Types.Branch = {
                name = "main";
                commitId = "initial_commit";
                isDefault = true;
                createdAt = now;
                createdBy = caller;
            };

            let repository: Repository = {
                id = repositoryId;
                name = request.name;
                description = request.description;
                owner = caller;
                collaborators = HashMap.HashMap<Principal, Types.Collaborator>(0, Principal.equal, Principal.hash);
                isPrivate = request.isPrivate;
                settings = defaultSettings;
                createdAt = now;
                updatedAt = now;
                files = HashMap.HashMap<Text, FileEntry>(10, Text.equal, Text.hash);
                commits = [];
                branches = [mainBranch];
                stars = 0;
                forks = 0;
                language = null;
                size = 0;
                supportedChains = targetChains;
                deploymentTargets = [];
                chainConfigs = Buffer.toArray(chainConfigsBuffer);
                lastDeployment = null;
            };

            // Update State
            repositories.put(repositoryId, repository);

            // Update user's repository list
            stateManager.updateUserRepositoryList(caller, repositoryId, true);

            return #Ok(Types.repositoryToSerializable(repository));
        };

        // Get repository
        public func getRepository(
            caller: Principal,
            id: Text
        ): Result<SerializableRepository, Error> {
            let repositories = stateManager.getRepositories();
            
            switch (repositories.get(id)) {
                case null { return #Err(#NotFound("Repository not found")) };
                case (?repo) {
                    if (Utils.canReadRepository(caller, repo)) {
                        return #Ok(Types.repositoryToSerializable(repo));
                    } else {
                        return #Err(#Forbidden("Access denied"));
                    };
                };
            };
        };

        // List repositories
        public func listRepositories(
            caller: Principal,
            owner: Principal,
            params: ?PaginationParams
        ): Result<RepositoryListResponse, Error> {
            let users = stateManager.getUsers();
            let repositories = stateManager.getRepositories();
            
            // Get the user object for the specified owner
            let user = switch (users.get(owner)) {
                case null { return #Err(#NotFound("User not found")) };
                case (?user) { user };
            };

            let page = switch (params) { case null 0; case (?p) p.page };
            let limit = switch (params) { case null 10; case (?p) p.limit };
            let startIndex = page * limit;

            var visibleReposCount: Nat = 0;
            let paginatedRepos = Buffer.Buffer<Repository>(limit);

            // Optimized Loop
            for (repoId in user.repositories.vals()) {
                switch (repositories.get(repoId)) {
                    case null {};
                    case (?repo) {
                        // Auth Check
                        if (Utils.canReadRepository(caller, repo)) {
                            // Pagination
                            if (visibleReposCount >= startIndex and paginatedRepos.size() < limit) {
                                paginatedRepos.add(repo);
                            };
                            visibleReposCount += 1;
                        };
                    };
                };
            };

            let response: RepositoryListResponse = {
                repositories = Array.map<Repository, SerializableRepository>(
                    Buffer.toArray(paginatedRepos),
                    func(repo) { Types.repositoryToSerializable(repo) },
                );
                totalCount = visibleReposCount;
                hasMore = (startIndex + paginatedRepos.size()) < visibleReposCount;
            };

            return #Ok(response);
        };

        // Delete repository
        public func deleteRepository(
            caller: Principal,
            id: Text
        ): Result<Bool, Error> {
            let repositories = stateManager.getRepositories();
            
            switch (repositories.get(id)) {
                case null { return #Err(#NotFound("Repository not found")) };
                case (?repo) {
                    // Authorization
                    if (repo.owner != caller) {
                        return #Err(#Forbidden("Only the repository owner can delete it."));
                    };

                    // Delete the repository from the main map.
                    repositories.delete(id);

                    // Update the owner's list of repositories
                    stateManager.updateUserRepositoryList(repo.owner, id, false);

                    return #Ok(true);
                };
            };
        };

        // Search repositories
        public func searchRepositories(
            searchQuery: Text,
            caller: Principal,
            filters: ?Types.SearchFilter
        ): [RepositorySearchResult] {
            let repositories = stateManager.getRepositories();
            let results = Buffer.Buffer<RepositorySearchResult>(0);

            label repo_loop for ((_, repo) in repositories.entries()) {
                if (not Utils.canReadRepository(caller, repo)) {
                    continue repo_loop;
                };

                // Filtering Logic
                let passesFilter = switch (filters) {
                    case null true;
                    case (?f) {
                        let ownerMatch = switch (f.owner) {
                            case null true;
                            case (?owner) repo.owner == owner;
                        };

                        let languageMatch = switch (f.language) {
                            case null true;
                            case (?lang) {
                                switch (repo.language) {
                                    case null false;
                                    case (?repoLang) Utils.toLower(repoLang) == Utils.toLower(lang);
                                };
                            };
                        };

                        let privateMatch = switch (f.isPrivate) {
                            case null true;
                            case (?isPrivate) repo.isPrivate == isPrivate;
                        };

                        let sizeMatch = switch (f.minSize, f.maxSize) {
                            case (null, null) true;
                            case (?minSize, null) repo.size >= minSize;
                            case (null, ?maxSize) repo.size <= maxSize;
                            case (?minSize, ?maxSize) repo.size >= minSize and repo.size <= maxSize;
                        };

                        let dateMatch = switch (f.createdAfter, f.createdBefore) {
                            case (null, null) true;
                            case (?after, null) repo.createdAt >= after;
                            case (null, ?before) repo.createdAt <= before;
                            case (?after, ?before) repo.createdAt >= after and repo.createdAt <= before;
                        };

                        ownerMatch and languageMatch and privateMatch and sizeMatch and dateMatch;
                    };
                };

                if (not passesFilter) {
                    continue repo_loop;
                };

                // Relevance Scoring
                let totalScore = do {
                    var score = 0.0;
                    let matchedFields = Buffer.Buffer<Text>(0);

                    let nameScore = calculateRelevanceScore(searchQuery, repo.name, 3.0);
                    if (nameScore > 0) {
                        score += nameScore;
                        matchedFields.add("name");
                    };

                    switch (repo.description) {
                        case null {};
                        case (?desc) {
                            let descScore = calculateRelevanceScore(searchQuery, desc, 2.0);
                            if (descScore > 0) {
                                score += descScore;
                                matchedFields.add("description");
                            };
                        };
                    };

                    for (topic in repo.settings.topics.vals()) {
                        let topicScore = calculateRelevanceScore(searchQuery, topic, 1.0);
                        if (topicScore > 0) {
                            score += topicScore;
                            if (not Utils.arrayContains(Buffer.toArray(matchedFields), "topics", Text.equal)) {
                                matchedFields.add("topics");
                            };
                        };
                    };

                    // Popularity Boost
                    let popularityBoost = Float.fromInt(repo.stars) * 0.1 + Float.fromInt(repo.forks) * 0.05;
                    score += popularityBoost;

                    // Result Aggregation
                    if (score > 0) {
                        results.add({
                            repository = repo;
                            score = score;
                            matchedFields = Buffer.toArray(matchedFields);
                        });
                    };
                    score;
                };
            };

            // Sorting
            let resultArray = Buffer.toArray(results);
            let sortedResults = Array.sort<RepositorySearchResult>(
                resultArray,
                func(a, b) {
                    if (a.score < b.score) { #greater } else if (a.score > b.score) {
                        #less;
                    } else { #equal };
                },
            );
            sortedResults;
        };

        // Search files and code
        public func searchFiles(
            searchQuery: Text,
            caller: Principal,
            codeOnly: Bool
        ): [FileSearchResult] {
            let repositories = stateManager.getRepositories();
            let results = Buffer.Buffer<FileSearchResult>(0);

            label repo_loop for ((_, repo) in repositories.entries()) {
                // Authorization Check
                if (not Utils.canReadRepository(caller, repo)) {
                    continue repo_loop;
                };

                label file_loop for ((path, file) in repo.files.entries()) {
                    // Code-Only Filter
                    if (codeOnly and not Utils.isCodeFile(file.path)) {
                        continue file_loop;
                    };

                    var totalScore = 0.0;
                    let matchedFields = Buffer.Buffer<Text>(0);
                    let snippets = Buffer.Buffer<Text>(0);

                    // Score File Path
                    let pathScore = calculateRelevanceScore(searchQuery, file.path, 2.0);
                    if (pathScore > 0) {
                        totalScore += pathScore;
                        matchedFields.add("path");
                    };

                    // Score File Content
                    let contentWeight = if (codeOnly) 3.0 else 1.5;

                    switch (Text.decodeUtf8(file.content)) {
                        case null {
                            /* File is not text-based (e.g., an image), so we can't search its content. */
                        };
                        case (?contentText) {
                            let contentScore = calculateRelevanceScore(searchQuery, contentText, contentWeight);
                            if (contentScore > 0) {
                                totalScore += contentScore;
                                matchedFields.add("content");

                                // Create a Snippet
                                let snippet = if (Text.size(contentText) > 150) {
                                    Utils.textTake(contentText, 150) # "...";
                                } else {
                                    contentText;
                                };
                                snippets.add(snippet);
                            };
                        };
                    };

                    // Result Aggregation
                    if (totalScore > 0) {
                        results.add({
                            file = file;
                            repository = repo;
                            score = totalScore;
                            matchedFields = Buffer.toArray(matchedFields);
                            snippets = Buffer.toArray(snippets);
                        });
                    };
                };
            };

            // Sorting
            let sortedResults = Buffer.toArray(results);
            return Array.sort<FileSearchResult>(
                sortedResults,
                func(a, b) {
                    if (a.score < b.score) { #greater } else if (a.score > b.score) {
                        #less;
                    } else { #equal };
                },
            );
        };

        // Search within a specific repository
        public func searchRepository(
            caller: Principal,
            repositoryId: Text,
            searchQuery: Text,
            params: ?PaginationParams
        ): Result<FileListResponse, Error> {
            let repositories = stateManager.getRepositories();
            
            switch (repositories.get(repositoryId)) {
                case null { return #Err(#NotFound("Repository not found")) };
                case (?repo) {
                    // Standardized Authorization
                    if (not Utils.canReadRepository(caller, repo)) {
                        return #Err(#Forbidden("Access denied"));
                    };

                    let lowerQuery = Utils.toLower(searchQuery);

                    // Optimized Search and Pagination
                    let page = switch (params) { case null 0; case (?p) p.page };
                    let limit = switch (params) { case null 20; case (?p) p.limit };
                    let startIndex = page * limit;
                    let endIndex = startIndex + limit;

                    var totalMatches: Nat = 0;
                    let paginatedFiles = Buffer.Buffer<FileEntry>(limit);

                    for ((path, file) in repo.files.entries()) {
                        // Check if the file's path or content matches the query
                        let isMatch = do {
                            if (Utils.containsSubstring(Utils.toLower(file.path), lowerQuery)) {
                                true;
                            } else {
                                switch (Text.decodeUtf8(file.content)) {
                                    case null false;
                                    case (?content) {
                                        Utils.containsSubstring(Utils.toLower(content), lowerQuery);
                                    };
                                };
                            };
                        };

                        if (isMatch) {
                            // If it's a match
                            if (totalMatches >= startIndex and totalMatches < endIndex) {
                                paginatedFiles.add(file);
                            };
                            totalMatches += 1;
                        };
                    };

                    let response: FileListResponse = {
                        files = Buffer.toArray(paginatedFiles);
                        totalCount = totalMatches;
                        path = searchQuery; // Use the original query for the response path
                    };

                    return #Ok(response);
                };
            };
        };
        
        // Upload file to repository
        public func uploadFile(
            caller: Principal,
            request: UploadFileRequest,
            useIPFS: ?Bool
        ): Result<FileEntry, Error> {
            let repositories = stateManager.getRepositories();
            let fileType = Utils.detectFileType(request.path, request.content);
            
            let repo = switch (repositories.get(request.repositoryId)) {
                case null { return #Err(#NotFound("Repository not found")) };
                case (?repo) { repo };
            };
            
            let contractMetadata = switch (fileType) {
                case (?#SmartContract(info)) {
                    let languageVariant = switch (info.language) {
                        case "solidity" { #Solidity };
                        case "motoko" { #Motoko };
                        case "rust" { #Rust };
                        case "vyper" { #Vyper };
                        case "cairo" { #Cairo };
                        case "clarity" { #Clarity };
                        case "michelson" { #Michelson };
                        case "move" { #Move };
                        case "plutus" { #Plutus };
                        case "wasm" { #Wasm };
                        case _ { #Solidity };
                    };
                    
                    switch (GitOps.parseContractMetadata(
                        request.path,
                        request.content,
                        info.chain,
                        languageVariant,
                    )) {
                        case (#Ok(gitMetadata)) {
                            let typesMetadata: Types.ContractMetadata = {
                                blockchain = gitMetadata.blockchain;
                                language = gitMetadata.language;
                                version = gitMetadata.version;
                                compiler = gitMetadata.compiler;
                                abi = gitMetadata.abi;
                                bytecode = gitMetadata.bytecode;
                                sourceFiles = gitMetadata.sourceFiles;
                                dependencies = gitMetadata.dependencies;
                                deploymentConfig = switch (gitMetadata.deploymentConfig) {
                                    case null null;
                                    case (?config) ?{
                                        constructorArgs = config.constructorArgs;
                                        gasLimit = config.gasLimit;
                                        network = config.network;
                                        value = config.value;
                                        wallet = config.wallet;
                                        // Add missing fields required by Types.ContractMetadata
                                        confirmations = null;
                                        gasPrice = null;
                                        timeout = null;
                                    };
                                };
                                sourceMap = null; // Add the missing sourceMap field
                            };
                            ?typesMetadata;
                        };
                        case (#Err(_)) {
                            // Handle error case
                            null;
                        };
                    };
                };
                case _ null;
            };

            if (not Utils.canWriteRepository(caller, repo)) {
                return #Err(#Forbidden("You do not have write permission for this repository."));
            };

            if (not Utils.isValidPath(request.path)) {
                return #Err(#BadRequest("Invalid file path."));
            };
            
            if (not Utils.isValidCommitMessage(request.commitMessage)) {
                return #Err(#BadRequest("Commit message must be between 1 and 1000 characters."));
            };

            let contentSize = request.content.size();
            if (contentSize > 10_000_000) {
                return #Err(#BadRequest("File size cannot exceed 10 MB."));
            };

            // Regular file upload logic (IPFS handling would be in main.mo)
            let now = Time.now();
            var oldFileSize: Nat = 0;

            let fileExists = switch (repo.files.get(request.path)) {
                case (?existingFile) {
                    oldFileSize := existingFile.size;
                    true;
                };
                case null { false };
            };

            let fileEntry: FileEntry = {
                path = request.path;
                content = request.content;
                size = contentSize;
                hash = Utils.generateFileHash(request.content);
                version = if (fileExists) {
                    switch (repo.files.get(request.path)) {
                        case (?file) { file.version + 1 };
                        case null { 1 };
                    };
                } else { 1 };
                lastModified = now;
                author = caller;
                commitMessage = ?request.commitMessage;
                fileType = fileType;
                contractMetadata = contractMetadata;
                targetChain = switch (fileType) {
                    case (?#SmartContract(info)) ?info.chain;
                    case _ null;
                };
            };

            repo.files.put(request.path, fileEntry);

            let newSizeAsInt: Int = repo.size - oldFileSize + contentSize;
            let newSize = if (newSizeAsInt < 0) 0 else intToNat(newSizeAsInt);

            let updatedRepo: Repository = {
                repo with
                updatedAt = now;
                size = newSize;
            };

            repositories.put(request.repositoryId, updatedRepo);

            return #Ok(fileEntry);
        };

        // Get file from repository
        public func getFile(
            caller: Principal,
            repositoryId: Text,
            path: Text
        ): Result<FileEntry, Error> {
            let repositories = stateManager.getRepositories();
            
            switch (repositories.get(repositoryId)) {
                case null { return #Err(#NotFound("Repository not found")) };
                case (?repo) {
                    if (not Utils.canReadRepository(caller, repo)) {
                        return #Err(#Forbidden("Access denied"));
                    };

                    switch (repo.files.get(path)) {
                        case null { return #Err(#NotFound("File not found")) };
                        case (?file) { return #Ok(file) };
                    };
                };
            };
        };

        // List files in repository
        public func listFiles(
            caller: Principal,
            repositoryId: Text,
            path: ?Text
        ): Result<FileListResponse, Error> {
            let repositories = stateManager.getRepositories();
            
            switch (repositories.get(repositoryId)) {
                case null { return #Err(#NotFound("Repository not found")) };
                case (?repo) {
                    // Caller Access & Authorization
                    if (not Utils.canReadRepository(caller, repo)) {
                        return #Err(#Forbidden("Access denied"));
                    };

                    // HashMap Structure
                    let searchPath = switch (path) {
                        case null "";
                        case (?p) p;
                    };

                    let matchingFiles = Buffer.Buffer<FileEntry>(0);
                    for ((filePath, file) in repo.files.entries()) {
                        if (Text.startsWith(filePath, #text searchPath)) {
                            matchingFiles.add(file);
                        };
                    };

                    let filesArray = Buffer.toArray(matchingFiles);
                    let response: FileListResponse = {
                        files = filesArray;
                        totalCount = filesArray.size();
                        path = searchPath;
                    };

                    return #Ok(response);
                };
            };
        };

        // Delete file from repository
        public func deleteFile(
            caller: Principal,
            repositoryId: Text,
            path: Text
        ): Result<Bool, Error> {
            let repositories = stateManager.getRepositories();
            
            let repo = switch (repositories.get(repositoryId)) {
                case null { return #Err(#NotFound("Repository not found")) };
                case (?repo) { repo };
            };

            if (not Utils.canWriteRepository(caller, repo)) {
                return #Err(#Forbidden("You do not have write permission for this repository."));
            };

            // Get the file to find its size before deleting
            let fileToDelete = switch (repo.files.get(path)) {
                case null { return #Err(#NotFound("File not found in repository.")) };
                case (?file) { file };
            };

            let fileSize = fileToDelete.size;

            // Instantly remove the file from the HashMap
            repo.files.delete(path);

            // Correctly recalculate the new repository size
            let newSizeAsInt: Int = repo.size - fileSize;
            let newSize = if (newSizeAsInt < 0) 0 else intToNat(newSizeAsInt);

            let updatedRepo: Repository = {
                repo with
                // files field is already updated by the .delete() method
                updatedAt = Time.now();
                size = newSize;
            };

            repositories.put(repositoryId, updatedRepo);
            return #Ok(true);
        };

        // Helper function to calculate search relevance score
        private func calculateRelevanceScore(searchQuery: Text, text: Text, fieldWeight: Float): Float {
            let lowerQuery = Utils.toLower(searchQuery);
            let lowerText = Utils.toLower(text);

            if (lowerText == lowerQuery) {
                return 100.0 * fieldWeight; // Exact match
            };

            if (Text.startsWith(lowerText, #text lowerQuery)) {
                return 80.0 * fieldWeight; // Starts with query
            };

            if (Utils.containsSubstring(lowerText, lowerQuery)) {
                return 60.0 * fieldWeight; // Contains query
            };

            // Check for partial word matches
            let queryWords = Text.split(lowerQuery, #char ' ');
            var partialScore: Float = 0.0;

            for (word in queryWords) {
                if (Utils.containsSubstring(lowerText, word)) {
                    partialScore += 20.0;
                };
            };

            return partialScore * fieldWeight;
        };
        
        // Helper function to convert Int to Nat safely
        private func intToNat(i: Int): Nat {
            if (i < 0) { 0 } else {
                Int.abs(i)
            };
        };
    };
}
