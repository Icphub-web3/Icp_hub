import Types "../types";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Buffer "mo:base/Buffer";
import Result "mo:base/Result";
import Utils "../utils/utils";
import Nat "mo:base/Nat";

module State {
    
    // Type aliases
    type User = Types.User;
    type Repository = Types.Repository;
    type FileEntry = Types.FileEntry;
    type SerializableRepository = Types.SerializableRepository;
    type Result<T, E> = Types.Result<T, E>;
    type Error = Types.Error;

    // State management class - this acts as a wrapper around existing HashMaps
    public class StateManager() {
        
        // IN-MEMORY STORAGE
        // These are the SAME HashMaps your main.mo is using
        private var users = HashMap.HashMap<Principal, User>(10, Principal.equal, Principal.hash);
        private var repositories = HashMap.HashMap<Text, Repository>(10, Text.equal, Text.hash);
        private var usernames = HashMap.HashMap<Text, Principal>(10, Text.equal, Text.hash);
        
        // ID counter
        private var nextRepositoryId: Nat = 1;

        //  INITIALIZATION FROM EXISTING STATE 
        public func initFromExisting(
            existingUsers: HashMap.HashMap<Principal, User>,
            existingRepos: HashMap.HashMap<Text, Repository>,
            existingUsernames: HashMap.HashMap<Text, Principal>,
            existingNextId: Nat
        ) {
            // Copy all existing data
            for ((principal, user) in existingUsers.entries()) {
                users.put(principal, user);
            };
            
            for ((id, repo) in existingRepos.entries()) {
                repositories.put(id, repo);
            };
            
            for ((username, principal) in existingUsernames.entries()) {
                usernames.put(username, principal);
            };
            
            nextRepositoryId := existingNextId;
        };
        
        // GETTERS
        public func getUsers(): HashMap.HashMap<Principal, User> { users };
        public func getRepositories(): HashMap.HashMap<Text, Repository> { repositories };
        public func getUsernames(): HashMap.HashMap<Text, Principal> { usernames };
        public func getNextRepoId(): Nat { nextRepositoryId };
        public func setNextRepoId(id: Nat) { nextRepositoryId := id };
        
        // UPGRADE MANAGEMENT
        public func prepareForUpgrade(): {
            usersEntries: [(Principal, User)];
            repositoriesEntries: [(Text, SerializableRepository)];
            usernamesEntries: [(Text, Principal)];
            nextRepoId: Nat;
        } {
            {
                usersEntries = Iter.toArray(users.entries());
                repositoriesEntries = Array.map<(Text, Repository), (Text, SerializableRepository)>(
                    Iter.toArray(repositories.entries()),
                    func((id, repo)) {
                        (id, Types.repositoryToSerializable(repo))
                    }
                );
                usernamesEntries = Iter.toArray(usernames.entries());
                nextRepoId = nextRepositoryId;
            }
        };

        public func restoreFromUpgrade(
            usersEntries: [(Principal, User)],
            repositoriesEntries: [(Text, SerializableRepository)],
            usernamesEntries: [(Text, Principal)],
            nextRepoId: Nat
        ) {
            users := HashMap.fromIter<Principal, User>(
                usersEntries.vals(),
                usersEntries.size(), 
                Principal.equal, 
                Principal.hash
            );
            
            repositories := HashMap.HashMap<Text, Repository>(
                repositoriesEntries.size(), 
                Text.equal, 
                Text.hash
            );
            
            for ((id, serRepo) in repositoriesEntries.vals()) {
                repositories.put(id, Types.serializableToRepository(serRepo));
            };
            
            usernames := HashMap.fromIter<Text, Principal>(
                usernamesEntries.vals(), 
                usernamesEntries.size(),
                Text.equal, 
                Text.hash
            );
            
            nextRepositoryId := nextRepoId;
        };
        
        // UTILITY FUNCTIONS
        public func generateRepositoryId(): Text {
            let id = "repo_" # Nat.toText(nextRepositoryId);
            nextRepositoryId += 1;
            id
        };
        
        // VALIDATION HELPERS
        public func validateUser(user: User): Result<(), Error> {
            if (not Utils.isValidUsername(user.username)) {
                return #Err(#BadRequest("Invalid username format"));
            };
            
            switch (user.email) {
                case null {};
                case (?email) {
                    if (not Utils.isValidEmail(email)) {
                        return #Err(#BadRequest("Invalid email format"));
                    };
                };
            };
            
            #Ok(())
        };
        
        public func validateRepository(repo: Repository): Result<(), Error> {
            if (not Utils.isValidRepositoryName(repo.name)) {
                return #Err(#BadRequest("Invalid repository name"));
            };
            
            switch (repo.description) {
                case null {};
                case (?desc) {
                    if (Text.size(desc) > 500) {
                        return #Err(#BadRequest("Description too long"));
                    };
                };
            };
            
            #Ok(())
        };
        
        // BUSINESS LOGIC HELPERS
        public func isUsernameTaken(username: Text): Bool {
            usernames.get(username) != null
        };
        
        public func getUserByUsername(username: Text): ?User {
            switch (usernames.get(username)) {
                case null null;
                case (?principal) users.get(principal);
            }
        };
        
        public func canUserAccessRepo(userPrincipal: Principal, repo: Repository): Bool {
            Utils.canReadRepository(userPrincipal, repo)
        };
        
        public func canUserWriteRepo(userPrincipal: Principal, repo: Repository): Bool {
            Utils.canWriteRepository(userPrincipal, repo)
        };
        
        // SEARCH HELPERS
        public func searchRepositoriesByName(searchTerm: Text, caller: Principal): [Repository] {
            let buffer = Buffer.Buffer<Repository>(0);
            let lowerSearchTerm = Utils.toLower(searchTerm);
            
            for ((_, repo) in repositories.entries()) {
                if (Utils.canReadRepository(caller, repo)) {
                    let repoName = Utils.toLower(repo.name);
                    if (Utils.containsSubstring(repoName, lowerSearchTerm)) {
                        buffer.add(repo);
                    };
                };
            };
            Buffer.toArray(buffer)
        };
        
        public func searchUsersByUsername(searchTerm: Text): [User] {
            let buffer = Buffer.Buffer<User>(0);
            let lowerSearchTerm = Utils.toLower(searchTerm);
            
            for ((_, user) in users.entries()) {
                let username = Utils.toLower(user.username);
                if (Utils.containsSubstring(username, lowerSearchTerm)) {
                    buffer.add(user);
                };
            };
            Buffer.toArray(buffer)
        };
        
        // STATISTICS
        public func getSystemStats(): Types.SystemStats {
            {
                totalUsers = users.size();
                totalRepositories = repositories.size();
                totalFiles = getTotalFileCount();
                totalStorage = getTotalStorageUsed();
            }
        };
        
        private func getTotalFileCount(): Nat {
            var count: Nat = 0;
            for ((_, repo) in repositories.entries()) {
                count += repo.files.size();
            };
            count
        };
        
        private func getTotalStorageUsed(): Nat {
            var totalSize: Nat = 0;
            for ((_, repo) in repositories.entries()) {
                totalSize += repo.size;
            };
            totalSize
        };
        
        // BULK OPERATIONS
        public func getUserRepositories(userPrincipal: Principal): [Repository] {
            let buffer = Buffer.Buffer<Repository>(0);
            
            switch (users.get(userPrincipal)) {
                case null {};
                case (?user) {
                    for (repoId in user.repositories.vals()) {
                        switch (repositories.get(repoId)) {
                            case null {};
                            case (?repo) buffer.add(repo);
                        };
                    };
                };
            };
            
            Buffer.toArray(buffer)
        };
        
        public func getRepositoryCollaborators(repoId: Text): [(Principal, Types.Collaborator)] {
            switch (repositories.get(repoId)) {
                case null [];
                case (?repo) Iter.toArray(repo.collaborators.entries());
            }
        };
        
        // DATA CONSISTENCY HELPERS
        public func cleanupOrphanedData() {
            // Remove repositories that reference non-existent users
            let reposToDelete = Buffer.Buffer<Text>(0);
            
            for ((id, repo) in repositories.entries()) {
                switch (users.get(repo.owner)) {
                    case null {
                        reposToDelete.add(id);
                    };
                    case (?_) {};
                };
            };
            
            for (repoId in reposToDelete.vals()) {
                repositories.delete(repoId);
            };
        };
        
        public func updateUserRepositoryList(userPrincipal: Principal, repoId: Text, add: Bool) {
            switch (users.get(userPrincipal)) {
                case null {};
                case (?user) {
                    let currentRepos = user.repositories;
                    let updatedRepos = if (add) {
                        if (not Utils.arrayContains<Text>(currentRepos, repoId, Text.equal)) {
                            Array.append<Text>(currentRepos, [repoId])
                        } else { currentRepos }
                    } else {
                        Array.filter<Text>(currentRepos, func(id) { id != repoId })
                    };
                    
                    let updatedUser = {
                        user with
                        repositories = updatedRepos;
                        updatedAt = Time.now();
                    };
                    
                    users.put(userPrincipal, updatedUser);
                };
            };
        };
    }
}
