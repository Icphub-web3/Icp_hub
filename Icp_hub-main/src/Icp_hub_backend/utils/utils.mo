import Types "../types";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Hash "mo:base/Hash";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Char "mo:base/Char";
import Nat32 "mo:base/Nat32";
import Int "mo:base/Int";
import Debug "mo:base/Debug";
import Buffer "mo:base/Buffer";
import Nat8 "mo:base/Nat8";

module {
    // helper functions
    //Find first index of a char in Text
    public func findCharIndex(t: Text, target: Char): ?Nat {
        var i = 0;
        for (c in Text.toIter(t)) {
            if (c == target) { return ?i };
            i += 1;
        };
        return null;
    };

    // Find last index of a char in Text
    public func rfindCharIndex(t: Text, target: Char): ?Nat {
        var i = 0;
        var last : ?Nat = null;
        for (c in Text.toIter(t)) {
            if (c == target) { last := ?i };
            i += 1;
        };
        return last;
    };

    // Check if Text contains a substring
    public func containsSubstring(t: Text, sub: Text): Bool {
        let n = Text.size(t);
        let m = Text.size(sub);
        if (m == 0 or m > n) return false;

        let tArr = Text.toArray(t);
        let subArr = Text.toArray(sub);

        for (i in Iter.range(0, n - m)) {
            var isMatch : Bool = true;
            label inner for (j in Iter.range(0, m - 1)) {
                if (tArr[i + j] != subArr[j]) {
                    isMatch := false;
                    break inner;
                }
            };
            if (isMatch) return true;
        };

        return false;
    };

    // Get substring from index to end
    public func textDrop(t: Text, start: Nat): Text {
        let arr = Text.toArray(t);
        let sub = Array.subArray<Char>(arr, start, arr.size() - start);
        Text.fromArray(sub);
    };

    // Get substring from start to index (exclusive)
    public func textTake(t: Text, end_: Nat): Text {
        let arr = Text.toArray(t);
        let sub = Array.subArray<Char>(arr, 0, end_);
        Text.fromArray(sub);    
    };

    // Convert text to lowercase
    public func toLower(t: Text): Text {
        Text.map(t, func(c) {
            if (c >= 'A' and c <= 'Z') {
                Char.fromNat32(Char.toNat32(c) + 32);
            } else {
                c;
            };
        });
    };

    // Validation utilities
    public func isValidUsername(username: Text): Bool {
        let usernameLength = Text.size(username);
        if (usernameLength < 3 or usernameLength > 20) {
            return false;
        };

        // Check if username contains only allowed characters
        let chars = Text.toIter(username);
        for (char in chars) {
            let c = Nat32.toNat(Char.toNat32(char));
            if (not (
                (c >= 48 and c <= 57) or  // 0-9
                (c >= 65 and c <= 90) or  // A-Z
                (c >= 97 and c <= 122) or // a-z
                c == 45 or c == 95        // - and _
            )) {
                return false;
            };
        };
        
        return true;
    };

    public func isValidRepositoryName(name: Text): Bool {
        let nameLength = Text.size(name);
        if (nameLength < 1 or nameLength > 100) {
            return false;
        };

        // Repository name should not start or end with special characters
        let chars = Text.toArray(name);
        if (chars.size() == 0) return false;
        
        let firstChar = chars[0];
        let lastChar = chars[chars.size() - 1];
        
        if (firstChar == '-' or firstChar == '_' or firstChar == '.') return false;
        if (lastChar == '-' or lastChar == '_' or lastChar == '.') return false;
        
        return true;
    };

    public func isValidEmail(email: Text): Bool {
        // Basic email validation
        let atIndex = findCharIndex(email, '@');
        let dotIndex = rfindCharIndex(email, '.');
        
        switch (atIndex, dotIndex) {
            case (?at, ?dot) {
                at > 0 and dot > at + 1 and dot < Text.size(email) - 1;
            };
            case _ false;
        };
    };

    public func isValidPath(path: Text): Bool {
        if (Text.size(path) == 0) return false;
        
        // Check for invalid characters in path
        let chars = Text.toIter(path);
        for (char in chars) {
            let c = Nat32.toNat(Char.toNat32(char));
            // Allow alphanumeric, slash, dot, dash, underscore
            if (not (
                (c >= 48 and c <= 57) or  // 0-9
                (c >= 65 and c <= 90) or  // A-Z
                (c >= 97 and c <= 122) or // a-z
                c == 47 or c == 46 or c == 45 or c == 95  // / . - _
            )) {
                return false;
            };
        };
        
        // Check for path traversal attempts
        return not containsSubstring(path, "..");
    };

    public func isValidCommitMessage(message: Text): Bool {
        let messageLength = Text.size(message);
        messageLength > 0 and messageLength <= 1000;
    };

    // Hash utilities
    public func hashText(text: Text): Nat {
        Nat32.toNat(Text.hash(text));
    };

    public func generateFileHash(content: Blob): Text {
        // Simplified hash - in production, use proper SHA-256
        let contentSize = content.size();
        let timestamp = Time.now();
        "sha256_" # Nat.toText(contentSize) # "_" # Int.toText(timestamp);
    };

    public func generateRepositoryId(owner: Principal, name: Text): Text {
        let ownerText = Principal.toText(owner);
        let combined = ownerText # "_" # name # "_" # Int.toText(Time.now());
        "repo_" # Nat.toText(Nat32.toNat(Text.hash(combined)));
    };

    public func generateCommitHash(
        repositoryId: Text,
        author: Principal,
        message: Text,
        timestamp: Int
    ): Text {
        let combined = repositoryId # Principal.toText(author) # message # Int.toText(timestamp);
        "commit_" # Nat.toText(Nat32.toNat(Text.hash(combined)));
    };

    // Time utilities
    public func formatTimestamp(timestamp: Int): Text {
        // Basic timestamp formatting - in production, use proper date formatting
        Int.toText(timestamp);
    };

    public func isRecentTimestamp(timestamp: Int, hoursAgo: Int): Bool {
        let now = Time.now();
        let hoursInNanoseconds = hoursAgo * 60 * 60 * 1_000_000_000;
        timestamp >= (now - hoursInNanoseconds);
    };

    public func timestampToReadable(timestamp: Int): Text {
        // Convert nanoseconds to seconds for readability
        let seconds = timestamp / 1_000_000_000;
        Int.toText(seconds) # "s";
    };

    // Array utilities
    public func arrayContains<T>(array: [T], item: T, equal: (T, T) -> Bool): Bool {
        switch (Array.find<T>(array, func(x) { equal(x, item) })) {
            case null false;
            case (?_) true;
        };
    };

    public func arrayRemove<T>(array: [T], item: T, equal: (T, T) -> Bool): [T] {
        Array.filter<T>(array, func(x) { not equal(x, item) });
    };

    public func arrayUnique<T>(array: [T], equal: (T, T) -> Bool): [T] {
        let result = Array.foldLeft<T, [T]>(array, [], func(acc, item) {
            if (arrayContains<T>(acc, item, equal)) {
                acc;
            } else {
                Array.append<T>(acc, [item]);
            };
        });
        return result;
    };

    public func arrayUpdate<T>(array: [T], index: Nat, newItem: T): [T] {
        Array.tabulate<T>(array.size(), func(i) {
            if (i == index) newItem else array[i];
        });
    };

    public func arrayInsert<T>(array: [T], index: Nat, item: T): [T] {
        let buffer = Buffer.fromArray<T>(array);
        buffer.insert(index, item);
        Buffer.toArray(buffer);
    };

    // Permission utilities
    public func hasPermission(
        user: Principal,
        repo: Types.Repository,
        requiredPermission: Types.CollaboratorPermission
    ): Bool {
        // Owner has all permissions
        if (repo.owner == user) return true;

        // Check collaborator permissions
        switch (repo.collaborators.get(user)) {
            case null false;
            case (?collab) {
                switch (requiredPermission, collab.permission) {
                    case (#Read, _) true;
                    case (#Write, #Write or #Admin or #Owner) true;
                    case (#Admin, #Admin or #Owner) true;
                    case (#Owner, #Owner) true;
                    case _ false;
                };
            };
        };
    };

    public func canReadRepository(user: Principal, repo: Types.Repository): Bool {
    if (not repo.isPrivate) { 
        true 
    } else if (repo.owner == user) { 
        true 
    } else {
        switch(repo.collaborators.get(user)) {
            case null { false };
            case(?_) { true };
        }
    }
};

    public func canWriteRepository(user: Principal, repo: Types.Repository): Bool {
        hasPermission(user, repo, #Write);
    };

    public func canAdminRepository(user: Principal, repo: Types.Repository): Bool {
        hasPermission(user, repo, #Admin);
    };

    public func isRepositoryOwner(user: Principal, repo: Types.Repository): Bool {
        repo.owner == user;
    };

    // File utilities
    public func getFileExtension(path: Text): ?Text {
        let lastDotIndex = rfindCharIndex(path, '.');
        switch (lastDotIndex) {
            case null null;
            case (?index) {
                if (index == Text.size(path) - 1) {
                    null;
                } else {
                    let extension = textDrop(path, index + 1);
                    ?extension;
                };
            };
        };
    };

    public func getFileName(path: Text): Text {
        let lastSlashIndex = rfindCharIndex(path, '/');
        switch (lastSlashIndex) {
            case null path;
            case (?index) {
                if (index == Text.size(path) - 1) {
                    "";
                } else {
                    textDrop(path, index + 1);
                };
            };
        };
    };

    public func getDirectoryPath(path: Text): Text {
        let lastSlashIndex = rfindCharIndex(path, '/');
        switch (lastSlashIndex) {
            case null "";
            case (?index) {
                if (index == 0) {
                    "/";
                } else {
                    textTake(path, index);
                };
            };
        };
    };

    public func isImageFile(path: Text): Bool {
        switch (getFileExtension(path)) {
            case null false;
            case (?ext) {
                let lowerExt = toLower(ext);
                lowerExt == "jpg" or lowerExt == "jpeg" or lowerExt == "png" or 
                lowerExt == "gif" or lowerExt == "bmp" or lowerExt == "webp" or lowerExt == "svg";
            };
        };
    };

    public func isCodeFile(path: Text): Bool {
        let lowerPath = toLower(path);
        Text.endsWith(lowerPath, #text ".mo") or
        Text.endsWith(lowerPath, #text ".js") or
        Text.endsWith(lowerPath, #text ".ts") or
        Text.endsWith(lowerPath, #text ".py") or
        Text.endsWith(lowerPath, #text ".rs") or
        Text.endsWith(lowerPath, #text ".go") or
        Text.endsWith(lowerPath, #text ".java") or
        Text.endsWith(lowerPath, #text ".cpp") or
        Text.endsWith(lowerPath, #text ".c") or
        Text.endsWith(lowerPath, #text ".h");
    };

    public func getFileSize(content: Blob): Nat {
        content.size();
    };

    public func formatFileSize(size: Nat): Text {
        if (size < 1024) {
            Nat.toText(size) # " B";
        } else if (size < 1024 * 1024) {
            Nat.toText(size / 1024) # " KB";
        } else if (size < 1024 * 1024 * 1024) {
            Nat.toText(size / (1024 * 1024)) # " MB";
        } else {
            Nat.toText(size / (1024 * 1024 * 1024)) # " GB";
        };
    };

    // Repository utilities
    public func sortRepositoriesByName(repos: [Types.Repository]): [Types.Repository] {
        Array.sort<Types.Repository>(repos, func(a, b) {
            Text.compare(a.name, b.name);
        });
    };

    public func sortRepositoriesByDate(repos: [Types.Repository]): [Types.Repository] {
        Array.sort<Types.Repository>(repos, func(a, b) {
            Int.compare(b.createdAt, a.createdAt); // Newest first
        });
    };

    public func filterRepositoriesByVisibility(repos: [Types.Repository], showPrivate: Bool): [Types.Repository] {
        Array.filter<Types.Repository>(repos, func(repo) {
            if (showPrivate) true else not repo.isPrivate;
        });
    };

    public func searchRepositories(repos: [Types.Repository], searchRepositories: Text): [Types.Repository] {
        let lowerQuery = toLower(searchRepositories);
        Array.filter<Types.Repository>(repos, func(repo) {
            let lowerName = toLower(repo.name);
            let lowerDesc = switch (repo.description) {
                case null "";
                case (?desc) toLower(desc);
            };
            containsSubstring(lowerName, lowerQuery) or containsSubstring(lowerDesc, lowerQuery);
        });
    };

    // User utilities
    public func formatUserProfile(user: Types.User): Text {
        let repoCount = Array.size(user.repositories);
        user.username # " (" # Nat.toText(repoCount) # " repositories)";
    };

    // Error handling utilities
    public func createErrorResult<T>(message: Text): {#err: Text} {
        #err(message);
    };

    public func createSuccessResult<T>(data: T): {#ok: T} {
        #ok(data);
    };

    // Logging utilities
    public func logInfo(message: Text) {
        Debug.print("[INFO] " # message);
    };

    public func logError(message: Text) {
        Debug.print("[ERROR] " # message);
    };

    public func logDebug(message: Text) {
        Debug.print("[DEBUG] " # message);
    };

    // Pagination utilities
    public func paginateArray<T>(array: [T], page: Nat, pageSize: Nat): [T] {
        let startIndex = page * pageSize;
        let endIndex = startIndex + pageSize;
        let arraySize = Array.size(array);
        
        if (startIndex >= arraySize) {
            return [];
        };
        
        let actualEndIndex = if (endIndex > arraySize) arraySize else endIndex;
        Array.subArray<T>(array, startIndex, actualEndIndex - startIndex);
    };

    public func getTotalPages(totalItems: Nat, pageSize: Nat): Nat {
        if (pageSize == 0) return 0;
        (totalItems + pageSize - 1) / pageSize;
    };

    // Branch utilities
    public func isValidBranchName(name: Text): Bool {
        let nameLength = Text.size(name);
        if (nameLength < 1 or nameLength > 100) {
            return false;
        };
        
        // Branch names cannot start with dash or contain certain characters
        let chars = Text.toArray(name);
        if (chars.size() == 0) return false;
        
        let firstChar = chars[0];
        if (firstChar == '-' or firstChar == '.') return false;
        
        // Check for invalid characters
        let iter = Text.toIter(name);
        for (char in iter) {
            let c = Nat32.toNat(Char.toNat32(char));
            if (c == 32 or c == 126 or c == 94 or c == 58 or c == 63 or c == 42 or c == 91) {
                return false; // space, ~, ^, :, ?, *, [
            };
        };
        
        return true;
    };

    public func getDefaultBranch(): Text {
        "main";
    };

    // Collaboration utilities
    public func addCollaborator(
        repo: Types.Repository,
        newCollaborator: Types.Collaborator
    ): Types.Repository {
        // Add or update collaborator in the HashMap
        repo.collaborators.put(newCollaborator.principal, newCollaborator);
        
        {
            repo with
            updatedAt = Time.now();
        };
    };

    public func removeCollaborator(
        repo: Types.Repository,
        principal: Principal
    ): Types.Repository {
        // Use HashMap's remove method instead of filtering
        let _ = repo.collaborators.remove(principal);
        
        {
            repo with
            updatedAt = Time.now();
        };
    };


    // Detect file type and blockchain
    public func detectFileType(path: Text, content: Blob): ?Types.FileType {
    let ext = getFileExtension(path);
    switch (ext) {
        case (?extension) {
            switch (extension) {
                case "sol" { 
                    ?#SmartContract({ 
                        chain = #Ethereum; 
                        language = "Solidity";
                        compiler = ?"solc";
                        version = ?"0.8.0";
                    }) 
                };
                case "mo" { 
                    ?#SmartContract({ 
                        chain = #ICP; 
                        language = "Motoko";
                        compiler = ?"moc";
                        version = ?"0.10.0";
                    }) 
                };
                case "rs" {
                    // Check content for blockchain-specific imports
                    switch (Text.decodeUtf8(content)) {
                        case (?code) {
                            if (containsSubstring(code, "anchor_lang") or containsSubstring(code, "solana_program")) {
                                ?#SmartContract({ 
                                    chain = #Solana; 
                                    language = "Rust";
                                    compiler = ?"rustc";
                                    version = ?"1.70.0";
                                })
                            } else if (containsSubstring(code, "near_sdk")) {
                                ?#SmartContract({ 
                                    chain = #Near; 
                                    language = "Rust";
                                    compiler = ?"rustc";
                                    version = ?"1.70.0";
                                })
                            } else {
                                ?#Backend
                            };
                        };
                        case null { ?#Other };
                    };
                };
                case "vy" { 
                    ?#SmartContract({ 
                        chain = #Ethereum; 
                        language = "Vyper";
                        compiler = ?"vyper";
                        version = ?"0.3.0";
                    }) 
                };
                case "cairo" { 
                    ?#SmartContract({ 
                        chain = #Ethereum; 
                        language = "Cairo";
                        compiler = ?"cairo-compile";
                        version = ?"1.0.0";
                    }) 
                };
                case "clar" { 
                    ?#SmartContract({ 
                        chain = #Bitcoin; 
                        language = "Clarity";
                        compiler = ?"clarinet";
                        version = ?"1.0.0";
                    }) 
                };
                case "move" { 
                    ?#SmartContract({ 
                        chain = #Solana; 
                        language = "Move";
                        compiler = ?"move";
                        version = ?"1.0.0";
                    }) 
                };
                case "json" {
                    let fileName = getFileName(path);
                    if (containsSubstring(fileName, "deploy") or containsSubstring(fileName, "config")) {
                        ?#DeploymentConfig
                    } else {
                        ?#Other
                    };
                };
                case "js" { 
                    if (containsSubstring(path, "test") or containsSubstring(path, "spec")) {
                        ?#Test
                    } else {
                        ?#Frontend
                    };
                };
                case "jsx" { 
                    if (containsSubstring(path, "test") or containsSubstring(path, "spec")) {
                        ?#Test
                    } else {
                        ?#Frontend
                    };
                };
                case "ts" { 
                    if (containsSubstring(path, "test") or containsSubstring(path, "spec")) {
                        ?#Test
                    } else {
                        ?#Frontend
                    };
                };
                case "tsx" { 
                    if (containsSubstring(path, "test") or containsSubstring(path, "spec")) {
                        ?#Test
                    } else {
                        ?#Frontend
                    };
                };
                case "py" { 
                    if (containsSubstring(path, "test") or containsSubstring(path, "spec")) {
                        ?#Test
                    } else {
                        ?#Backend
                    };
                };
                case "md" { ?#Documentation };
                case _ { ?#Other };
            };
        };
        case null { ?#Other };
    };
};
    
    // Get default chain configuration
    public func getDefaultChainConfig(chain: Types.BlockchainType): Types.ChainConfig {
    switch (chain) {
        case (#Ethereum) {
            {
                rpcUrl = "https://eth-mainnet.g.alchemy.com/v2/";
                chainId = 1;
                explorerUrl = "https://etherscan.io";
                nativeCurrency = { name = "Ether"; symbol = "ETH"; decimals = 18 };
                gasSettings = ?{
                    gasLimit = 3000000;
                    maxFeePerGas = null;
                    maxPriorityFeePerGas = null;
                };
                defaultAccount = null;
                gasLimit = 21000;
                gasPrice = 20000000000; // 20 gwei
                blockTime = 12; // 12 seconds
                confirmations = 6;
            };
        };
        case (#Solana) {
            {
                rpcUrl = "https://api.mainnet-beta.solana.com";
                chainId = 1;
                explorerUrl = "https://explorer.solana.com";
                nativeCurrency = { name = "SOL"; symbol = "SOL"; decimals = 9 };
                gasSettings = null;
                defaultAccount = null;
                gasLimit = 200000; // Compute units
                gasPrice = 5000; // Lamports per compute unit
                blockTime = 400; // ~400ms
                confirmations = 32;
            };
        };
        case (#ICP) {
            {
                rpcUrl = "https://ic0.app";
                chainId = 1;
                explorerUrl = "https://dashboard.internetcomputer.org";
                nativeCurrency = { name = "ICP"; symbol = "ICP"; decimals = 8 };
                gasSettings = null;
                defaultAccount = null;
                gasLimit = 2000000000; // 2B cycles
                gasPrice = 1; // 1 cycle per instruction
                blockTime = 1; // ~1 second
                confirmations = 1;
            };
        };
        case (#Polygon) {
            {
                rpcUrl = "https://polygon-rpc.com";
                chainId = 137;
                explorerUrl = "https://polygonscan.com";
                nativeCurrency = { name = "MATIC"; symbol = "MATIC"; decimals = 18 };
                gasSettings = ?{
                    gasLimit = 3000000;
                    maxFeePerGas = null;
                    maxPriorityFeePerGas = null;
                };
                defaultAccount = null;
                gasLimit = 21000;
                gasPrice = 30000000000; // 30 gwei
                blockTime = 2; // 2 seconds
                confirmations = 10;
            };
        };
        case (#BinanceSmartChain) {
            {
                rpcUrl = "https://bsc-dataseed.binance.org";
                chainId = 56;
                explorerUrl = "https://bscscan.com";
                nativeCurrency = { name = "BNB"; symbol = "BNB"; decimals = 18 };
                gasSettings = ?{
                    gasLimit = 3000000;
                    maxFeePerGas = null;
                    maxPriorityFeePerGas = null;
                };
                defaultAccount = null;
                gasLimit = 21000;
                gasPrice = 5000000000; // 5 gwei
                blockTime = 3; // 3 seconds
                confirmations = 15;
            };
        };
        case (#Arbitrum) {
            {
                rpcUrl = "https://arb1.arbitrum.io/rpc";
                chainId = 42161;
                explorerUrl = "https://arbiscan.io";
                nativeCurrency = { name = "Ether"; symbol = "ETH"; decimals = 18 };
                gasSettings = ?{
                    gasLimit = 3000000;
                    maxFeePerGas = null;
                    maxPriorityFeePerGas = null;
                };
                defaultAccount = null;
                gasLimit = 21000;
                gasPrice = 100000000; // 0.1 gwei (much cheaper)
                blockTime = 1; // ~1 second
                confirmations = 1;
            };
        };
        case (#Avalanche) {
            {
                rpcUrl = "https://api.avax.network/ext/bc/C/rpc";
                chainId = 43114;
                explorerUrl = "https://snowtrace.io";
                nativeCurrency = { name = "AVAX"; symbol = "AVAX"; decimals = 18 };
                gasSettings = ?{
                    gasLimit = 3000000;
                    maxFeePerGas = null;
                    maxPriorityFeePerGas = null;
                };
                defaultAccount = null;
                gasLimit = 21000;
                gasPrice = 25000000000; // 25 gwei
                blockTime = 2; // 2 seconds
                confirmations = 5;
            };
        };
        case (#Near) {
            {
                rpcUrl = "https://rpc.mainnet.near.org";
                chainId = 1;
                explorerUrl = "https://explorer.near.org";
                nativeCurrency = { name = "NEAR"; symbol = "NEAR"; decimals = 24 };
                gasSettings = null;
                defaultAccount = null;
                gasLimit = 300000000000000; // 300 TGas
                gasPrice = 100000000; // 0.0001 NEAR per gas
                blockTime = 1; // ~1 second
                confirmations = 1;
            };
        };
        case (#Bitcoin) {
            {
                rpcUrl = "https://btc.ic0.app";
                chainId = 0;
                explorerUrl = "https://blockchain.info";
                nativeCurrency = { name = "Bitcoin"; symbol = "BTC"; decimals = 8 };
                gasSettings = null;
                defaultAccount = null;
                gasLimit = 1; // Not applicable for Bitcoin
                gasPrice = 10; // Satoshis per byte
                blockTime = 600; // 10 minutes
                confirmations = 6;
            };
        };
        case (#Cosmos) {
            {
                rpcUrl = "https://cosmos-rpc.quickapi.com";
                chainId = 1;
                explorerUrl = "https://www.mintscan.io/cosmos";
                nativeCurrency = { name = "ATOM"; symbol = "ATOM"; decimals = 6 };
                gasSettings = null;
                defaultAccount = null;
                gasLimit = 200000;
                gasPrice = 1000; // uatom
                blockTime = 7; // ~7 seconds
                confirmations = 1;
            };
        };
        case (#Polkadot) {
            {
                rpcUrl = "wss://rpc.polkadot.io";
                chainId = 0;
                explorerUrl = "https://polkadot.subscan.io";
                nativeCurrency = { name = "DOT"; symbol = "DOT"; decimals = 10 };
                gasSettings = null;
                defaultAccount = null;
                gasLimit = 1000000000; // Weight units
                gasPrice = 1000000; // Planck per weight unit
                blockTime = 6; // 6 seconds
                confirmations = 2;
            };
        };
    };
};

    // Check if file is a smart contract
    public func isSmartContract(fileType: ?Types.FileType): Bool {
        switch (fileType) {
            case (?#SmartContract(_)) true;
            case _ false;
        };
    };

    // Get blockchain from file type
    public func getBlockchainFromFileType(fileType: ?Types.FileType): ?Types.BlockchainType {
        switch (fileType) {
            case (?#SmartContract(info)) ?info.chain;
            case _ null;
        };
    };

    // Validate contract deployment readiness
    public func isContractDeployable(metadata: ?Types.ContractMetadata): Bool {
        switch (metadata) {
            case null false;
            case (?meta) {
                switch (meta.bytecode) {
                    case null false;
                    case (?_) true;
                };
            };
        };
    };
};
