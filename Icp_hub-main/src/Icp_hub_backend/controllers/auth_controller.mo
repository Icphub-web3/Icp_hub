import Types "../types";
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Option "mo:base/Option";
import Int "mo:base/Int";
import Char "mo:base/Char";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Iter "mo:base/Iter";
import Utils "../utils/utils";

module Auth {
    // Type definitions
    type User = Types.User;
    type Repository = Types.Repository;
    type Result<T, E> = Types.Result<T, E>;
    type Error = Types.Error;
    type CollaboratorPermission = Types.CollaboratorPermission;

    // Session management types
    public type SessionToken = {
        token: Text;
        principal: Principal;
        createdAt: Int;
        expiresAt: Int;
        lastActivity: Int;
    };

    public type ApiKey = {
        id: Text;
        name: Text;
        key: Text; // Hashed
        principal: Principal;
        permissions: [ApiPermission];
        createdAt: Int;
        lastUsed: ?Int;
        expiresAt: ?Int;
        isActive: Bool;
    };

    public type ApiPermission = {
        #ReadRepository;
        #WriteRepository;
        #DeleteRepository;
        #ManageCollaborators;
        #CreateRepository;
        #ManageApiKeys;
        #All;
    };

    public type AuthMethod = {
        #InternetIdentity;
        #ApiKey;
        #Session;
    };

    public type AuthContext = {
        principal: Principal;
        method: AuthMethod;
        permissions: [Permission];
        isAuthenticated: Bool;
    };

    public type Permission = {
        #SystemAdmin;
        #CreateRepository;
        #DeleteOwnRepository;
        #ManageOwnProfile;
        #ViewPublicRepositories;
        #CreateProposal;
        #Vote;
        #ManageTokens;
    };

    // Rate limiting types
    public type RateLimitConfig = {
        maxRequests: Nat;
        windowSeconds: Nat;
        identifier: Text; // IP, Principal, or API key
    };

    public type RateLimitEntry = {
        requests: Nat;
        windowStart: Int;
    };

    // Two-factor authentication
    public type TwoFactorMethod = {
        #TOTP;
        #BackupCodes;
    };

    public type TwoFactorSetup = {
        method: TwoFactorMethod;
        secret: Text; // Encrypted
        backupCodes: [Text]; // Hashed
        isEnabled: Bool;
        enabledAt: ?Int;
    };

    // Helper functions

    // Check if a principal has a specific system-wide permission
    public func hasPermission(
        principal: Principal,
        permission: Permission,
        users: HashMap.HashMap<Principal, User>
    ): Bool {
        switch (users.get(principal)) {
            case null false;
            case (?user) {
                // For now, all registered users have basic permissions
                switch (permission) {
                    case (#CreateRepository or #ManageOwnProfile or #ViewPublicRepositories) true;
                    case (#DeleteOwnRepository or #CreateProposal or #Vote) true;
                    case (#SystemAdmin) {
                        // Check if user is in admin list (you can maintain a separate admin list)
                        false // Implement admin check
                    };
                    case (#ManageTokens) true;
                };
            };
        };
    };

    // Check repository-specific permissions
    public func hasRepositoryPermission(
        principal: Principal,
        repository: Repository,
        requiredPermission: CollaboratorPermission
    ): Bool {
        // Owner has all permissions
        if (repository.owner == principal) return true;
        
        // Check if repository is public for read operations
        if (not repository.isPrivate and requiredPermission == #Read) return true;
        
        // Check collaborator permissions
        switch (repository.collaborators.get(principal)) {
            case null false;
            case (?collaborator) {
                switch (collaborator.permission, requiredPermission) {
                    case (#Admin, _) true;
                    case (#Write, #Read or #Write) true;
                    case (#Read, #Read) true;
                    case _ false;
                };
            };
        };
    };

    // Verify API key permissions
    public func hasApiKeyPermission(
        apiKey: ApiKey,
        requiredPermission: ApiPermission
    ): Bool {
        // Check if API key is active and not expired
        if (not apiKey.isActive) return false;
        
        switch (apiKey.expiresAt) {
            case (?expiresAt) {
                if (Time.now() > expiresAt) return false;
            };
            case null {};
        };
        
        // Check permissions
        for (permission in apiKey.permissions.vals()) {
            if (permission == #All) return true;
            if (permission == requiredPermission) return true;
        };
        
        false;
    };

    // Generate session token
    public func generateSessionToken(principal: Principal): Text {
        // Simple token generation - in production, use proper cryptographic methods
        let timestamp = Int.toText(Time.now());
        let principalText = Principal.toText(principal);
        principalText # "_" # timestamp # "_" # Nat.toText(Utils.hashText(principalText # timestamp));
    };

    // Generate API key
    public func generateApiKey(name: Text): Text {
        // Simple key generation - in production, use proper cryptographic methods
        let timestamp = Int.toText(Time.now());
        let random = Nat.toText(Utils.hashText(name # timestamp));
        "icphub_" # random # "_" # timestamp;
    };

    // Hash API key for storage
    public func hashApiKey(key: Text): Text {
        // Simple hashing - in production, use proper cryptographic hashing
        "hashed_" # Nat.toText(Utils.hashText(key));
    };

    // Validate session token format
    public func isValidSessionToken(token: Text): Bool {
        let parts = Text.split(token, #char '_');
        var count = 0;
        for (_ in parts) { count += 1; };
        count == 3; // principal_timestamp_hash
    };

    // Check if session is expired
    public func isSessionExpired(session: SessionToken): Bool {
        Time.now() > session.expiresAt;
    };

    // Rate limiting check
    public func checkRateLimit(
        identifier: Text,
        config: RateLimitConfig,
        rateLimitStore: HashMap.HashMap<Text, RateLimitEntry>
    ): Bool {
        let now = Time.now();
        
        switch (rateLimitStore.get(identifier)) {
            case null {
                // First request
                rateLimitStore.put(identifier, {
                    requests = 1;
                    windowStart = now;
                });
                true;
            };
            case (?entry) {
                let windowEnd = entry.windowStart + (config.windowSeconds * 1_000_000_000);
                
                if (now > windowEnd) {
                    // New window
                    rateLimitStore.put(identifier, {
                        requests = 1;
                        windowStart = now;
                    });
                    true;
                } else if (entry.requests < config.maxRequests) {
                    // Within limits
                    rateLimitStore.put(identifier, {
                        requests = entry.requests + 1;
                        windowStart = entry.windowStart;
                    });
                    true;
                } else {
                    // Rate limit exceeded
                    false;
                };
            };
        };
    };

    // Create auth context from principal
    public func createAuthContext(
        principal: Principal,
        method: AuthMethod,
        users: HashMap.HashMap<Principal, User>
    ): AuthContext {
        let permissions = Buffer.Buffer<Permission>(0);
        
        switch (users.get(principal)) {
            case null {
                // Unauthenticated user - only basic permissions
                permissions.add(#ViewPublicRepositories);
            };
            case (?user) {
                // Authenticated user permissions
                permissions.add(#ViewPublicRepositories);
                permissions.add(#CreateRepository);
                permissions.add(#DeleteOwnRepository);
                permissions.add(#ManageOwnProfile);
                permissions.add(#CreateProposal);
                permissions.add(#Vote);
                permissions.add(#ManageTokens);
            };
        };
        
        {
            principal = principal;
            method = method;
            permissions = Buffer.toArray(permissions);
            isAuthenticated = switch (users.get(principal)) {
                case null false;
                case (?_) true;
            };
        };
    };

    // Validate two-factor authentication code
    public func validateTwoFactorCode(
        code: Text,
        setup: TwoFactorSetup
    ): Bool {
        if (not setup.isEnabled) return false;
        
        switch (setup.method) {
            case (#TOTP) {
                // Implement TOTP validation
                // For now, simple validation
                Text.size(code) == 6;
            };
            case (#BackupCodes) {
                // Check if code matches any backup code
                for (backupCode in setup.backupCodes.vals()) {
                    if (backupCode == hashApiKey(code)) return true;
                };
                false;
            };
        };
    };

    // Security helper functions
    
    // Check if principal is anonymous
    public func isAnonymous(principal: Principal): Bool {
        Principal.isAnonymous(principal);
    };

    // Sanitize user input to prevent injection attacks
    public func sanitizeInput(input: Text): Text {
        // Remove potentially dangerous characters
        Text.map(input, func(c: Char): Char {
            let charCode = Char.toNat32(c);
            // Check character codes instead of literals
            if (charCode == 60) { ' ' }      // <
            else if (charCode == 62) { ' ' }  // >
            else if (charCode == 38) { ' ' }  // &
            else if (charCode == 34) { ' ' }  // "
            else if (charCode == 39) { ' ' }  // '
            else if (charCode == 47) { ' ' }  // /
            else { c }
        });
    };

    // Generate backup codes for 2FA
    public func generateBackupCodes(count: Nat): [Text] {
        let codes = Buffer.Buffer<Text>(count);
        var i = 0;
        while (i < count) {
            let code = generateApiKey("backup_" # Nat.toText(i));
            codes.add(code);
            i += 1;
        };
        Buffer.toArray(codes);
    };

    // Session management
    public class SessionManager() {
        private var sessions = HashMap.HashMap<Text, SessionToken>(10, Text.equal, Text.hash);
        private let sessionDuration = 24 * 60 * 60 * 1_000_000_000; // 24 hours in nanoseconds
        
        public func createSession(principal: Principal): SessionToken {
            let token = generateSessionToken(principal);
            let now = Time.now();
            let session: SessionToken = {
                token = token;
                principal = principal;
                createdAt = now;
                expiresAt = now + sessionDuration;
                lastActivity = now;
            };
            sessions.put(token, session);
            session;
        };

        public func restoreSessions(data: [(Text, SessionToken)]) {
    sessions := HashMap.fromIter<Text, SessionToken>(
        data.vals(),
        data.size(),
        Text.equal,
        Text.hash
        );
    };
        
        public func getSession(token: Text): ?SessionToken {
            sessions.get(token);
        };

        public func getAllSessions(): [(Text, SessionToken)] {
            Iter.toArray(sessions.entries());
        };
        
        public func validateSession(token: Text): Result<Principal, Error> {
            switch (sessions.get(token)) {
                case null #Err(#Unauthorized("Invalid session token"));
                case (?session) {
                    if (isSessionExpired(session)) {
                        sessions.delete(token);
                        #Err(#Unauthorized("Session expired"));
                    } else {
                        // Update last activity
                        let updatedSession = {
                            session with
                            lastActivity = Time.now();
                        };
                        sessions.put(token, updatedSession);
                        #Ok(session.principal);
                    };
                };
            };
        };
        
        public func deleteSession(token: Text): Bool {
            switch (sessions.get(token)) {
                case null false;
                case (?_) {
                    sessions.delete(token);
                    true;
                };
            };
        };
        
        public func cleanupExpiredSessions(): Nat {
            let now = Time.now();
            var cleaned = 0;
            
            for ((token, session) in sessions.entries()) {
                if (isSessionExpired(session)) {
                    sessions.delete(token);
                    cleaned += 1;
                };
            };
            
            cleaned;
        };
        
        // Add these methods for serialization
        public func getSessions(): [(Text, SessionToken)] {
            Iter.toArray(sessions.entries());
        };
        
        public func loadSessions(data: [(Text, SessionToken)]) {
            for ((token, session) in data.vals()) {
                sessions.put(token, session);
            };
        };
    };

    // API Key management
    public class ApiKeyManager() {
        private var apiKeys = HashMap.HashMap<Text, ApiKey>(10, Text.equal, Text.hash);
        private var keysByPrincipal = HashMap.HashMap<Principal, [Text]>(10, Principal.equal, Principal.hash);

        public func getUpgradeData(): {
        apiKeys: [(Text, ApiKey)];
        keysByPrincipal: [(Principal, [Text])];
        } {
            {
            apiKeys = Iter.toArray(apiKeys.entries());
            keysByPrincipal = Iter.toArray(keysByPrincipal.entries());
            }
        };

        public func createApiKey(
            principal: Principal,
            name: Text,
            permissions: [ApiPermission],
            expiresAt: ?Int
        ): Result<Text, Error> {
            // Validate name
            if (Text.size(name) == 0 or Text.size(name) > 100) {
                return #Err(#BadRequest("API key name must be 1-100 characters"));
            };
            
            let key = generateApiKey(name);
            let hashedKey = hashApiKey(key);
            let id = "key_" # Nat.toText(Utils.hashText(hashedKey));
            
            let apiKey: ApiKey = {
                id = id;
                name = name;
                key = hashedKey;
                principal = principal;
                permissions = permissions;
                createdAt = Time.now();
                lastUsed = null;
                expiresAt = expiresAt;
                isActive = true;
            };
            
            apiKeys.put(id, apiKey);
            
            // Update keys by principal
            let existingKeys = switch (keysByPrincipal.get(principal)) {
                case null [];
                case (?keys) keys;
            };
            keysByPrincipal.put(principal, Array.append(existingKeys, [id]));
            
            #Ok(key); // Return unhashed key to user once
        };

        public func restoreData(data: {
            apiKeys: [(Text, ApiKey)];
            keysByPrincipal: [(Principal, [Text])];
            }) {
            apiKeys := HashMap.fromIter<Text, ApiKey>(
            data.apiKeys.vals(),
            data.apiKeys.size(),
            Text.equal,
            Text.hash
            );
    
            keysByPrincipal := HashMap.fromIter<Principal, [Text]>(
            data.keysByPrincipal.vals(),
            data.keysByPrincipal.size(),
            Principal.equal,
            Principal.hash
            );
        };
        
        public func validateApiKey(key: Text): Result<ApiKey, Error> {
            let hashedKey = hashApiKey(key);
            
            // Find key by hash
            for ((id, apiKey) in apiKeys.entries()) {
                if (apiKey.key == hashedKey) {
                    if (not apiKey.isActive) {
                        return #Err(#Unauthorized("API key is inactive"));
                    };
                    
                    switch (apiKey.expiresAt) {
                        case (?expiresAt) {
                            if (Time.now() > expiresAt) {
                                return #Err(#Unauthorized("API key expired"));
                            };
                        };
                        case null {};
                    };
                    
                    // Update last used
                    let updatedKey = {
                        apiKey with
                        lastUsed = ?Time.now();
                    };
                    apiKeys.put(id, updatedKey);
                    
                    return #Ok(updatedKey);
                };
            };
            
            #Err(#Unauthorized("Invalid API key"));
        };
        
        public func revokeApiKey(principal: Principal, keyId: Text): Result<Bool, Error> {
            switch (apiKeys.get(keyId)) {
                case null #Err(#NotFound("API key not found"));
                case (?apiKey) {
                    if (apiKey.principal != principal) {
                        return #Err(#Forbidden("You don't own this API key"));
                    };
                    
                    let updatedKey = {
                        apiKey with
                        isActive = false;
                    };
                    apiKeys.put(keyId, updatedKey);
                    #Ok(true);
                };
            };
        };
        
        public func listApiKeys(principal: Principal): [ApiKey] {
            switch (keysByPrincipal.get(principal)) {
                case null [];
                case (?keyIds) {
                    let keys = Buffer.Buffer<ApiKey>(keyIds.size());
                    for (id in keyIds.vals()) {
                        switch (apiKeys.get(id)) {
                            case (?key) { keys.add(key); };
                            case null {};
                        };
                    };
                    Buffer.toArray(keys);
                };
            };
        };
        
        // Add these methods for serialization
        public func getApiKeys(): [(Text, ApiKey)] {
            Iter.toArray(apiKeys.entries());
        };
        
        public func getKeysByPrincipal(): [(Principal, [Text])] {
            Iter.toArray(keysByPrincipal.entries());
        };
        
        public func loadApiKeys(data: [(Text, ApiKey)]) {
            for ((id, key) in data.vals()) {
                apiKeys.put(id, key);
            };
        };
        
        public func loadKeysByPrincipal(data: [(Principal, [Text])]) {
            for ((principal, keys) in data.vals()) {
                keysByPrincipal.put(principal, keys);
            };
        };
    };
}
