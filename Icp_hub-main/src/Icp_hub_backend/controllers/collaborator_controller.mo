import Types "../types";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Utils "../utils/utils";
import _Option "mo:base/Option";

module CollaboratorManager {
    
    type Repository = Types.Repository;
    type User = Types.User;
    type Collaborator = Types.Collaborator;
    type CollaboratorPermission = Types.CollaboratorPermission;
    type Result<T, E> = Types.Result<T, E>;
    type Error = Types.Error;

    // Request types for collaborator management
    public type AddCollaboratorRequest = {
        repositoryId: Text;
        username: Text;
        permission: CollaboratorPermission;
        message: ?Text;
    };

    public type UpdateCollaboratorRequest = {
        repositoryId: Text;
        username: Text;
        permission: CollaboratorPermission;
    };

    public type RemoveCollaboratorRequest = {
        repositoryId: Text;
        username: Text;
    };

    public type CollaboratorListRequest = {
        repositoryId: Text;
        includeOwner: ?Bool; 
    };

    // Response types
    public type CollaboratorInfo = {
        collaborator: Collaborator;
        user: User;
        addedAt: Int;
        addedBy: Principal;
    };

    public type CollaboratorListResponse = {
        collaborators: [CollaboratorInfo];
        totalCount: Nat;
        repositoryId: Text;
    };

    public type InvitationStatus = {
        #Pending;
        #Accepted;
        #Declined;
        #Expired;
    };

    public type CollaboratorInvitation = {
        id: Text;
        repositoryId: Text;
        inviterPrincipal: Principal;
        inviteePrincipal: Principal;
        permission: CollaboratorPermission;
        message: ?Text;
        status: InvitationStatus;
        createdAt: Int;
        expiresAt: Int;
        respondedAt: ?Int;
    };

    // collaborator management
    public func isValidPermission(permission: CollaboratorPermission): Bool {
        switch (permission) {
            case (#Read or #Write or #Admin) true;
            case _ false;
        }
    };

    public func canManageCollaborators(caller: Principal, repo: Repository): Bool {
        // Only owner and admin collaborators can manage collaborators
        if (repo.owner == caller) return true;
        
        switch (repo.collaborators.get(caller)) {
            case null false;
            case (?collab) {
                switch (collab.permission) {
                    case (#Admin) true;
                    case _ false;
                };
            };
        };
    };

    public func hasCollaboratorPermission(caller: Principal,
     repo: Repository,
    requiredPermission: CollaboratorPermission): Bool {
        // Owner has all permissions
        if (repo.owner == caller) return true;
        
        switch (repo.collaborators.get(caller)) {
            case null false;
            case (?collab) {
                switch (collab.permission, requiredPermission) {
                    case (#Admin, _) true; 
                    case (#Write, #Read) true; 
                    case (#Write, #Write) true;
                    case (#Read, #Read) true;
                    case _ false;
                };
            };
        };
    };

    public func isCollaborator(principal: Principal, repo: Repository): Bool {
        if (repo.owner == principal) return true;
        
        switch (repo.collaborators.get(principal)) {
            case null false;
            case (?_) true;
        };
    };

    public func getCollaboratorPermission(principal: Principal, repo: Repository): ?CollaboratorPermission {
        if (repo.owner == principal) return ?#Admin;
        
        switch (repo.collaborators.get(principal)) {
            case null null;
            case (?collab) ?collab.permission;
        };
    };

    // Main collaborator management functions
    public func addCollaborator(
        caller: Principal,
        request: AddCollaboratorRequest,
        repositories: HashMap.HashMap<Text, Repository>,
        users: HashMap.HashMap<Principal, User>,
        usernames: HashMap.HashMap<Text, Principal>
    ): Result<CollaboratorInfo, Error> {
        
        // Get repository
        let repo = switch (repositories.get(request.repositoryId)) {
            case null { return #Err(#NotFound("Repository not found")); };
            case (?repo) { repo };
        };

        // Check if caller can manage collaborators
        if (not canManageCollaborators(caller, repo)) {
            return #Err(#Forbidden("You don't have permission to manage collaborators"));
        };

        // Get the user to be added as collaborator
        let collaboratorPrincipal = switch (usernames.get(request.username)) {
            case null { return #Err(#NotFound("User not found")); };
            case (?principal) { principal };
        };

        let collaboratorUser = switch (users.get(collaboratorPrincipal)) {
            case null { return #Err(#NotFound("User profile not found")); };
            case (?user) { user };
        };

        // Check if user is already the owner
        if (repo.owner == collaboratorPrincipal) {
            return #Err(#BadRequest("Cannot add repository owner as collaborator"));
        };

        // Check if user is already a collaborator
        switch (repo.collaborators.get(collaboratorPrincipal)) {
            case (?_) { return #Err(#Conflict("User is already a collaborator")); };
            case null {};
        };

        // Validate permission
        if (not isValidPermission(request.permission)) {
            return #Err(#BadRequest("Invalid permission level"));
        };

        // Validate message length if provided
        switch (request.message) {
            case null {};
            case (?msg) {
                if (Text.size(msg) > 500) {
                    return #Err(#BadRequest("Invitation message cannot exceed 500 characters"));
                };
            };
        };

        let now = Time.now();
        
        // Create new collaborator
        let newCollaborator: Collaborator = {
            principal = collaboratorPrincipal;
            permission = request.permission;
            addedAt = now;
            addedBy = caller;
        };

        // Add collaborator to repository
        repo.collaborators.put(collaboratorPrincipal, newCollaborator);
        
        let updatedRepo: Repository = {
            repo with
            updatedAt = now;
        };

        repositories.put(request.repositoryId, updatedRepo);

        let collaboratorInfo: CollaboratorInfo = {
            collaborator = newCollaborator;
            user = collaboratorUser;
            addedAt = now;
            addedBy = caller;
        };

        return #Ok(collaboratorInfo);
    };

    public func removeCollaborator(
        caller: Principal,
        request: RemoveCollaboratorRequest,
        repositories: HashMap.HashMap<Text, Repository>,
        usernames: HashMap.HashMap<Text, Principal>
    ): Result<Bool, Error> {
        
        // Get repository
        let repo = switch (repositories.get(request.repositoryId)) {
            case null { return #Err(#NotFound("Repository not found")); };
            case (?repo) { repo };
        };

        // Check if caller can manage collaborators
        if (not canManageCollaborators(caller, repo)) {
            return #Err(#Forbidden("You don't have permission to manage collaborators"));
        };

        // Get the user to be removed
        let collaboratorPrincipal = switch (usernames.get(request.username)) {
            case null { return #Err(#NotFound("User not found")); };
            case (?principal) { principal };
        };

        // Check if user is the owner
        if (repo.owner == collaboratorPrincipal) {
            return #Err(#BadRequest("Cannot remove repository owner"));
        };

        // Check if user is a collaborator
        switch (repo.collaborators.get(collaboratorPrincipal)) {
            case null { return #Err(#NotFound("User is not a collaborator of this repository")); };
            case (?_) {};
        };

        // Remove collaborator from repository
        repo.collaborators.delete(collaboratorPrincipal);

        let updatedRepo: Repository = {
            repo with
            updatedAt = Time.now();
        };

        repositories.put(request.repositoryId, updatedRepo);
        return #Ok(true);
    };

        public func updateCollaboratorPermission(
            caller: Principal,
            request: UpdateCollaboratorRequest,
            repositories: HashMap.HashMap<Text, Repository>,
            usernames: HashMap.HashMap<Text, Principal>,
            users: HashMap.HashMap<Principal, User>
        ): Result<CollaboratorInfo, Error> {
    
        // Get repository
        let repo = switch (repositories.get(request.repositoryId)) {
            case null { return #Err(#NotFound("Repository not found")); };
            case (?repo) { repo };
        };

        // Check if caller can manage collaborators
        if (not canManageCollaborators(caller, repo)) {
            return #Err(#Forbidden("You don't have permission to manage collaborators"));
        };

        // Get the collaborator to be updated
        let collaboratorPrincipal = switch (usernames.get(request.username)) {
            case null { return #Err(#NotFound("User not found")); };
            case (?principal) { principal };
        };

        // Check if user is the owner
        if (repo.owner == collaboratorPrincipal) {
            return #Err(#BadRequest("Cannot change owner permissions"));
        };

        // Validate new permission
        if (not isValidPermission(request.permission)) {
            return #Err(#BadRequest("Invalid permission level"));
        };

        // Find and update the collaborator
        switch (repo.collaborators.get(collaboratorPrincipal)) {
            case null { return #Err(#NotFound("User is not a collaborator of this repository")); };
            case (?oldCollaborator) {
                let updatedCollaborator: Collaborator = {
                    oldCollaborator with
                    permission = request.permission;
                };

                repo.collaborators.put(collaboratorPrincipal, updatedCollaborator);

                let updatedRepo: Repository = {
                    repo with
                    updatedAt = Time.now();
                };

                repositories.put(request.repositoryId, updatedRepo);

                let collaboratorUser = switch (users.get(collaboratorPrincipal)) {
                    case null { 
                    return #Err(#NotFound("User profile not found")); 
                };
                    case (?user) { user };
                };

                let collaboratorInfo: CollaboratorInfo = {
                collaborator = updatedCollaborator;
                user = collaboratorUser; 
                addedAt = oldCollaborator.addedAt;
                addedBy = oldCollaborator.addedBy;
            };

                return #Ok(collaboratorInfo);
            };
        };
    };

    public func listCollaborators(
        caller: Principal,
        request: CollaboratorListRequest,
        repositories: HashMap.HashMap<Text, Repository>,
        users: HashMap.HashMap<Principal, User>
    ): Result<CollaboratorListResponse, Error> {
        
        // Get repository
        let repo = switch (repositories.get(request.repositoryId)) {
            case null { return #Err(#NotFound("Repository not found")); };
            case (?repo) { repo };
        };

        // Check if caller can read repository
        if (not Utils.canReadRepository(caller, repo)) {
            return #Err(#Forbidden("Access denied"));
        };

        let collaboratorInfos = Buffer.Buffer<CollaboratorInfo>(0);
        
        // Include owner if requested
        let includeOwner = switch (request.includeOwner) {
            case null false;
            case (?include) include;
        };

        if (includeOwner) {
            switch (users.get(repo.owner)) {
                case null {};
                case (?ownerUser) {
                    let ownerAsCollaborator: Collaborator = {
                        principal = repo.owner;
                        permission = #Admin;
                        addedAt = repo.createdAt;
                        addedBy = repo.owner;
                    };
                    
                    collaboratorInfos.add({
                        collaborator = ownerAsCollaborator;
                        user = ownerUser;
                        addedAt = repo.createdAt;
                        addedBy = repo.owner;
                    });
                };
            };
        };

        // Add all collaborators from HashMap
        for ((principal, collab) in repo.collaborators.entries()) {
            switch (users.get(principal)) {
                case null {}; 
                case (?user) {
                    collaboratorInfos.add({
                        collaborator = collab;
                        user = user;
                        addedAt = collab.addedAt;
                        addedBy = collab.addedBy;
                    });
                };
            };
        };

        let response: CollaboratorListResponse = {
            collaborators = Buffer.toArray(collaboratorInfos);
            totalCount = collaboratorInfos.size();
            repositoryId = request.repositoryId;
        };

        return #Ok(response);
    };

    // Helper function to check if a user has specific permission on a repository
    public func checkRepositoryPermission(
        userPrincipal: Principal,
        repositoryId: Text,
        requiredPermission: CollaboratorPermission,
        repositories: HashMap.HashMap<Text, Repository>
    ): Bool {
        switch (repositories.get(repositoryId)) {
            case null false;
            case (?repo) {
                hasCollaboratorPermission(userPrincipal, repo, requiredPermission);
            };
        };
    };

    // Get repository collaborator statistics
    public func getCollaboratorStats(
        repositoryId: Text,
        repositories: HashMap.HashMap<Text, Repository>
    ): Result<{totalCollaborators: Nat; readOnly: Nat; writeAccess: Nat; adminAccess: Nat}, Error> {
        
        switch (repositories.get(repositoryId)) {
            case null { return #Err(#NotFound("Repository not found")); };
            case (?repo) {
                var readOnly = 0;
                var writeAccess = 0;
                var adminAccess = 1;
                
                for ((_, collab) in repo.collaborators.entries()) {
                    switch (collab.permission) {
                        case (#Read) { readOnly += 1; };
                        case (#Write) { writeAccess += 1; };
                        case (#Admin) { adminAccess += 1; };
                        case (#Owner) { adminAccess += 1; };
                        case (#Deploy(_)) { writeAccess += 1; };
                    };
                };

                return #Ok({
                    totalCollaborators = repo.collaborators.size() + 1; 
                    readOnly = readOnly;
                    writeAccess = writeAccess;
                    adminAccess = adminAccess;
                });
            };
        };
    };

    public func canDeployToChain(
        principal: Principal,
        repo: Types.Repository,
        targetChain: Types.BlockchainType
    ): Bool {
        if (repo.owner == principal) return true;
        
        switch (repo.collaborators.get(principal)) {
            case null false;
            case (?collab) {
                switch (collab.permission) {
                    case (#Admin or #Owner) true;
                    case (#Deploy(chains)) {
                        Array.find<Types.BlockchainType>(
                            chains, 
                            func(c) { c == targetChain }
                        ) != null;
                    };
                    case _ false;
                };
            };
        };
    };
}
