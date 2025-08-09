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
import StateModel "../models/state_model";
import Nat "mo:base/Nat";

module UserManager {
    // Type aliases
    type User = Types.User;
    type UserProfile = Types.UserProfile;
    type RegisterUserRequest = Types.RegisterUserRequest;
    type UpdateUserProfileRequest = Types.UpdateUserProfileRequest;
    type Result<T, E> = Types.Result<T, E>;
    type Error = Types.Error;

    // User search result types
    type UserSearchResult = Types.UserSearchResult;

    public class UserManager(stateManager: StateModel.StateManager) {
        
        // User registration
        public func registerUser(
            caller: Principal,
            request: RegisterUserRequest
        ): Result<User, Error> {
            // Get state from state manager
            let users = stateManager.getUsers();
            let usernames = stateManager.getUsernames();
            
            // Check if Principal is already registered
            if (users.get(caller) != null) {
                return #Err(#Conflict("This Principal is already registered."));
            };

            // Validate the username format
            if (not Utils.isValidUsername(request.username)) {
                return #Err(#BadRequest("Invalid username format. Use 3-20 alphanumeric characters, dashes, or underscores."));
            };

            // Check if the username is already taken
            if (usernames.get(request.username) != null) {
                return #Err(#Conflict("Username is already taken."));
            };

            // Validate email format if provided
            switch (request.email) {
                case null {}; // No email provided, that's fine.
                case (?email) {
                    if (not Utils.isValidEmail(email)) {
                        return #Err(#BadRequest("Invalid email format."));
                    };
                };
            };

            // Create and store the new user
            let now = Time.now();
            let newUser: User = {
                principal = caller;
                username = request.username;
                email = request.email;
                profile = request.profile;
                repositories = [];
                createdAt = now;
                updatedAt = now;
            };

            users.put(caller, newUser);
            usernames.put(newUser.username, newUser.principal); // Add to username index

            return #Ok(newUser);
        };

        // Get user profile
        public func getUser(
            principal: Principal
        ): Result<User, Error> {
            let users = stateManager.getUsers();
            
            switch (users.get(principal)) {
                case null #Err(#NotFound("User not found"));
                case (?user) #Ok(user);
            };
        };

        // Update user profile
        public func updateUser(
            caller: Principal,
            request: UpdateUserProfileRequest
        ): Result<User, Error> {
            let users = stateManager.getUsers();
            
            switch (users.get(caller)) {
                case null {
                    return #Err(#NotFound("User not found, please register first."));
                };
                case (?user) {
                    if (switch (request.displayName) { case null false; case (?d) Text.size(d) > 50 }) {
                        return #Err(#BadRequest("Display name cannot exceed 50 characters."));
                    };
                    if (switch (request.bio) { case null false; case (?b) Text.size(b) > 500 }) {
                        return #Err(#BadRequest("Bio cannot exceed 500 characters."));
                    };

                    let newProfile: Types.UserProfile = {
                        displayName = switch (request.displayName) {
                            case null { user.profile.displayName };
                            case (?newName) { ?newName };
                        };
                        bio = switch (request.bio) {
                            case null { user.profile.bio };
                            case (?newBio) { ?newBio };
                        };
                        avatar = switch (request.avatar) {
                            case null { user.profile.avatar };
                            case (?newAvatar) { ?newAvatar };
                        };
                        location = switch (request.location) {
                            case null { user.profile.location };
                            case (?newLocation) { ?newLocation };
                        };
                        website = switch (request.website) {
                            case null { user.profile.website };
                            case (?newWebsite) { ?newWebsite };
                        };
                        socialLinks = user.profile.socialLinks;
                    };

                    let updatedUser: User = {
                        user with
                        profile = newProfile;
                        updatedAt = Time.now();
                    };

                    users.put(caller, updatedUser);
                    return #Ok(updatedUser);
                };
            };
        };

        // Search users
        public func searchUsers(
            searchQuery: Text,
            caller: Principal
        ): [UserSearchResult] {
            let users = stateManager.getUsers();
            let results = Buffer.Buffer<UserSearchResult>(0);

            for ((_, user) in users.entries()) {
                var totalScore: Float = 0.0;
                let matchedFields = Buffer.Buffer<Text>(0);

                let usernameScore = calculateRelevanceScore(searchQuery, user.username, 2.5);
                if (usernameScore > 0) {
                    totalScore += usernameScore;
                    matchedFields.add("username");
                };

                switch (user.profile.displayName) {
                    case null {};
                    case (?displayName) {
                        let displayScore = calculateRelevanceScore(searchQuery, displayName, 1.5);
                        if (displayScore > 0) {
                            totalScore += displayScore;
                            matchedFields.add("displayName");
                        };
                    };
                };

                if (totalScore > 0) {
                    results.add({
                        user = user;
                        score = totalScore;
                        matchedFields = Buffer.toArray(matchedFields);
                    });
                };
            };

            let sortedResults = Buffer.toArray(results);
            let sorted = Array.sort<UserSearchResult>(
                sortedResults,
                func(a, b) {
                    if (a.score < b.score) { #greater } else if (a.score > b.score) {
                        #less;
                    } else { #equal };
                },
            );
            return sorted;
        };

        // Get search suggestions for usernames
        public func getUsernameSuggestions(
            searchQuery: Text,
            maxSuggestions: ?Nat
        ): [Text] {
            let users = stateManager.getUsers();
            
            if (Text.size(searchQuery) < 2) {
                return [];
            };

            let limit = switch (maxSuggestions) {
                case null 10;
                case (?max) Nat.min(max, 20);
            };

            let suggestions = Buffer.Buffer<Text>(limit);
            let lowerQuery = Utils.toLower(searchQuery);

            label userLoop for ((_, user) in users.entries()) {
                if (suggestions.size() == limit) { break userLoop };

                let lowerUsername = Utils.toLower(user.username);
                if (Text.startsWith(lowerUsername, #text lowerQuery)) {
                    suggestions.add(user.username);
                };
            };

            return Buffer.toArray(suggestions);
        };

        // Get user by username
        public func getUserByUsername(
            username: Text
        ): ?User {
            let users = stateManager.getUsers();
            let usernames = stateManager.getUsernames();
            
            switch (usernames.get(username)) {
                case null null;
                case (?principal) users.get(principal);
            };
        };

        // Format user profile for display
        public func formatUserProfile(user: User): Text {
            let repoCount = Array.size(user.repositories);
            user.username # " (" # Nat.toText(repoCount) # " repositories)";
        };

        // Validate user data
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

            #Ok(());
        };

        // Check if username is available
        public func isUsernameAvailable(
            username: Text
        ): Bool {
            let usernames = stateManager.getUsernames();
            usernames.get(username) == null;
        };

        // Get user statistics
        public func getUserStats(
            userPrincipal: Principal
        ): Result<{
            repositoryCount: Nat;
            joinedAt: Int;
            lastActive: Int;
        }, Error> {
            let users = stateManager.getUsers();
            
            switch (users.get(userPrincipal)) {
                case null { #Err(#NotFound("User not found")) };
                case (?user) {
                    #Ok({
                        repositoryCount = user.repositories.size();
                        joinedAt = user.createdAt;
                        lastActive = user.updatedAt;
                    });
                };
            };
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
    };
}
