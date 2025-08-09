import Types "../types";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Result "mo:base/Result";
import Utils "../utils/utils";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Debug "mo:base/Debug";
import Float "mo:base/Float";
import State "../models/state_model";
import User "./user_controller";
import Repository "./repository_controller";

module SearchManager {
    // Type aliases
    type User = Types.User;
    type Repository = Types.Repository;
    type Result<T, E> = Types.Result<T, E>;
    type Error = Types.Error;
    type SearchScope = Types.SearchScope;
    type SearchSortBy = Types.SortBy;
    type SearchFilter = Types.SearchFilter;
    type SearchRequest = Types.SearchRequest;
    type RepositorySearchResult = Types.RepositorySearchResult;
    type UserSearchResult = Types.UserSearchResult;
    type FileSearchResult = Types.FileSearchResult;
    type SearchResults = Types.SearchResults;
    type SerializableSearchResults = Types.SerializableSearchResults;
    type PaginationParams = Types.PaginationParams;

    public class SearchManager(
        stateManager: State.StateManager,
        userManager: User.UserManager,
        repositoryManager: Repository.RepositoryManager
    ) {
        // Main search API
        public func search(
            caller: Principal,
            request: SearchRequest
        ): Result<SerializableSearchResults, Error> {
            // Validate search query
            let searchQuery = Text.trim(request.searchQuery, #char ' ');
            if (Text.size(searchQuery) == 0) {
                return #Err(#BadRequest("Search query cannot be empty"));
            };

            if (Text.size(searchQuery) > 100) {
                return #Err(#BadRequest("Search query too long"));
            };

            let page = switch (request.pagination) {
                case null { 0 };
                case (?p) { p.page };
            };
            let limit = switch (request.pagination) {
                case null { 10 };
                case (?p) { Nat.min(p.limit, 100) };
            };

            // Get search results based on scope
            let repoResults = switch (request.scope) {
                case (#All or #Repositories) {
                    repositoryManager.searchRepositories(searchQuery, caller, request.filters)
                };
                case _ { [] };
            };

            let userResults = switch (request.scope) {
                case (#All or #Users) {
                    userManager.searchUsers(searchQuery, caller)
                };
                case _ { [] };
            };

            let fileResults = switch (request.scope) {
                case (#All or #Files) {
                    repositoryManager.searchFiles(searchQuery, caller, false)
                };
                case (#Code) {
                    repositoryManager.searchFiles(searchQuery, caller, true)
                };
                case _ { [] };
            };

            // Sorting and Pagination Logic
            let sortedRepos = switch (request.sortBy) {
                case null { repoResults };
                case (?#Relevance) { repoResults };
                case (?sortBy) {
                    Array.sort<RepositorySearchResult>(
                        repoResults,
                        func(a, b) {
                            switch (sortBy) {
                                case (#Name) {
                                    Text.compare(a.repository.name, b.repository.name);
                                };
                                case (#CreatedAt) {
                                    Int.compare(b.repository.createdAt, a.repository.createdAt);
                                };
                                case (#UpdatedAt) {
                                    Int.compare(b.repository.updatedAt, a.repository.updatedAt);
                                };
                                case (#Stars) {
                                    Nat.compare(b.repository.stars, a.repository.stars);
                                };
                                case (#Size) { 
                                    Nat.compare(b.repository.size, a.repository.size) 
                                };
                                case (#Relevance) { 
                                    Float.compare(b.score, a.score) 
                                };
                            };
                        },
                    );
                };
            };

            let totalCount = sortedRepos.size() + userResults.size() + fileResults.size();

            let paginatedRepos = Utils.paginateArray<RepositorySearchResult>(sortedRepos, page, limit);
            let paginatedUsers = Utils.paginateArray<UserSearchResult>(userResults, page, limit);
            let paginatedFiles = Utils.paginateArray<FileSearchResult>(fileResults, page, limit);

            let hasMore = (page + 1) * limit < totalCount;

            let finalResult: SearchResults = {
                repositories = paginatedRepos;
                users = paginatedUsers;
                files = paginatedFiles;
                totalCount = totalCount;
                hasMore = hasMore;
                searchQuery = searchQuery;
                scope = request.scope;
            };

            return #Ok(Types.searchResultsToSerializable(finalResult));
        };

        // Advanced search with auto-complete suggestions
        public func searchSuggestions(
            caller: Principal,
            searchQuery: Text,
            maxSuggestions: ?Nat
        ): Result<[Text], Error> {
            if (Text.size(searchQuery) < 2) {
                return #Ok([]);
            };

            let limit = switch (maxSuggestions) {
                case null 10;
                case (?max) Nat.min(max, 20);
            };

            let repositories = stateManager.getRepositories();
            let users = stateManager.getUsers();
            
            let uniqueSuggestions = HashMap.HashMap<Text, ()>(limit, Text.equal, Text.hash);
            let lowerQuery = Utils.toLower(searchQuery);

            // Collect repository names
            label repoLoop for ((_, repo) in repositories.entries()) {
                if (uniqueSuggestions.size() == limit) { break repoLoop }; // Stop searching if we have enough

                if (Utils.canReadRepository(caller, repo)) {
                    let lowerName = Utils.toLower(repo.name);
                    if (Text.startsWith(lowerName, #text lowerQuery)) {
                        uniqueSuggestions.put(repo.name, ());
                    };
                };
            };

            // Collect usernames
            label userLoop for ((_, user) in users.entries()) {
                if (uniqueSuggestions.size() == limit) { break userLoop }; // Stop searching if we have enough

                let lowerUsername = Utils.toLower(user.username);
                if (Text.startsWith(lowerUsername, #text lowerQuery)) {
                    uniqueSuggestions.put(user.username, ());
                };
            };

            // Convert the unique keys from the HashMap to an array.
            let suggestions = Buffer.toArray(Buffer.fromIter<Text>(uniqueSuggestions.keys()));

            return #Ok(suggestions);
        };
    };
}
