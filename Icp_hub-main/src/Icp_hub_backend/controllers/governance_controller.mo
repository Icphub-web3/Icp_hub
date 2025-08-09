import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Float "mo:base/Float";
import Option "mo:base/Option";
import Iter "mo:base/Iter";
import Order "mo:base/Order";
import Debug "mo:base/Debug";
import Nat32 "mo:base/Nat32";
import Types "../types";
import Utils "../utils/utils";

module Governance {

    // DAO-specific types
    public type ProposalId = Nat;
    public type VotingPower = Nat;
    public type TokenAmount = Nat;

    public type ProposalStatus = {
        #Draft;      // Being prepared
        #Active;     // Currently voting
        #Passed;     // Approved and ready for execution
        #Failed;     // Rejected
        #Executed;   // Successfully executed
        #Cancelled;  // Cancelled before completion
        #Expired;    // Voting period ended without quorum
    };

    public type ProposalType = {
        #RepositoryUpdate: {
            repositoryId: Text;
            newSettings: Types.RepositorySettings;
        };
        #PlatformUpgrade: {
            version: Text;
            description: Text;
            canisterId: ?Principal;
        };
        #TreasurySpend: {
            amount: TokenAmount;
            recipient: Principal;
            purpose: Text;
        };
        #GovernanceConfig: {
            newConfig: GovernanceConfig;
        };
        #CollaboratorPromotion: {
            repositoryId: Text;
            collaborator: Principal;
            newPermission: Types.CollaboratorPermission; 
        };
        #CustomProposal: {
            title: Text;
            description: Text;
            executionData: ?Blob;
        };
    };

    public type Vote = {
        #Yes;
        #No;
        #Abstain;
    };

    public type VoteRecord = {
        voter: Principal;
        vote: Vote;
        votingPower: VotingPower;
        timestamp: Int;
        reason: ?Text;
    };

    public type Proposal = {
        id: ProposalId;
        proposer: Principal;
        proposalType: ProposalType;
        title: Text;
        description: Text;
        createdAt: Int;
        votingStartsAt: Int;
        votingEndsAt: Int;
        executionDelay: Int;
        status: ProposalStatus;
        votes: [VoteRecord];
        totalYesVotes: VotingPower;
        totalNoVotes: VotingPower;
        totalAbstainVotes: VotingPower;
        quorumRequired: VotingPower;
        approvalThreshold: Float;
        executedAt: ?Int;
        executedBy: ?Principal;
        discussionThread: [DiscussionPost];
    };

    public type DiscussionPost = {
        id: Nat;
        author: Principal;
        content: Text;
        timestamp: Int;
        parentId: ?Nat;
        reactions: [(Text, [Principal])];
    };

    public type GovernanceConfig = {
        votingPeriod: Int;
        executionDelay: Int;
        proposalDeposit: TokenAmount;
        quorumPercentage: Float;
        approvalThreshold: Float;
        maxProposalsPerUser: Nat;
        minVotingPower: VotingPower;
        allowDelegation: Bool;
    };

    public type VotingStats = {
        totalSupply: TokenAmount;
        circulatingSupply: TokenAmount;
        totalStaked: TokenAmount;
        activeVoters: Nat;
        participationRate: Float;
    };

    public type GovernanceToken = {
        balance: TokenAmount;
        staked: TokenAmount;
        delegatedTo: ?Principal;
        delegatedFrom: [Principal];
        lastActivityAt: Int;
        reputationScore: Float;
    };

    public type CreateProposalRequest = {
        proposalType: ProposalType;
        title: Text;
        description: Text;
        votingDuration: ?Int;
        executionDelay: ?Int;
    };

    public type CastVoteRequest = {
        proposalId: ProposalId;
        vote: Vote;
        reason: ?Text;
    };

    public type DelegateVoteRequest = {
        delegateTo: Principal;
        scope: DelegationScope;
    };

    public type DelegationScope = {
        #All;
        #Repository: Text;
        #ProposalType: ProposalType;
    };

    public type ProposalListRequest = {
        status: ?ProposalStatus;
        proposer: ?Principal;
        proposalType: ?Text;
        pagination: ?Types.PaginationParams;
    };

    public type ProposalListResponse = {
        proposals: [Proposal];
        totalCount: Nat;
        hasMore: Bool;
    };

    public type AddDiscussionPostRequest = {
        proposalId: ProposalId;
        content: Text;
        parentId: ?Nat;
    };

    private func natHash(n : Nat): Nat32 {
        Text.hash(Nat.toText(n))
    };

    // State management
    public class GovernanceState() {
        
        private var nextProposalId: ProposalId = 1;
        private var proposals = HashMap.HashMap<ProposalId, Proposal>(10, Nat.equal, natHash); 
        private var governanceTokens = HashMap.HashMap<Principal, GovernanceToken>(100, Principal.equal, Principal.hash);
        private var treasury: TokenAmount = 0;
        
        private func getDefaultConfig(): GovernanceConfig {
            {
                votingPeriod = 7 * 24 * 60 * 60 * 1_000_000_000;
                executionDelay = 2 * 24 * 60 * 60 * 1_000_000_000;
                proposalDeposit = 100;
                quorumPercentage = 10.0;
                approvalThreshold = 60.0;
                maxProposalsPerUser = 3;
                minVotingPower = 10;
                allowDelegation = true;
            }
        };
        
        private var config: GovernanceConfig = getDefaultConfig();

        public func initializeGovernanceToken(principal: Principal, initialBalance: TokenAmount): () {
            let token: GovernanceToken = {
                balance = initialBalance;
                staked = 0;
                delegatedTo = null;
                delegatedFrom = [];
                lastActivityAt = Time.now();
                reputationScore = 1.0;
            };
            governanceTokens.put(principal, token);
        };

        public func getVotingPower(principal: Principal): VotingPower {
            let token = switch (governanceTokens.get(principal)) {
                case null 0;
                case (?t) t.staked + t.balance;
            };
            
            var delegatedPower: VotingPower = 0;
            for ((delegator, delegatorToken) in governanceTokens.entries()) {
                switch (delegatorToken.delegatedTo) {
                    case (?delegate) {
                        if (delegate == principal) {
                            delegatedPower += delegatorToken.staked + delegatorToken.balance;
                        };
                    };
                    case null {};
                };
            };
            
            token + delegatedPower
        };

        public func createProposal(
            caller: Principal,
            request: CreateProposalRequest,
            users: HashMap.HashMap<Principal, Types.User>
        ): Types.Result<Proposal, Types.Error> {
            
            let user = switch (users.get(caller)) {
                case null return #Err(#Unauthorized("User not registered"));
                case (?u) u;
            };

            let votingPower = getVotingPower(caller);
            if (votingPower < config.minVotingPower) {
                return #Err(#Forbidden("Insufficient voting power to create proposals"));
            };

            let userToken = switch (governanceTokens.get(caller)) {
                case null return #Err(#BadRequest("No governance tokens found"));
                case (?t) t;
            };
            
            if (userToken.balance < config.proposalDeposit) {
                return #Err(#BadRequest("Insufficient tokens for proposal deposit"));
            };

            let activeProposals = getUserActiveProposals(caller);
            if (activeProposals >= config.maxProposalsPerUser) {
                return #Err(#BadRequest("Maximum active proposals limit reached"));
            };

            if (Text.size(request.title) == 0 or Text.size(request.title) > 200) {
                return #Err(#BadRequest("Title must be 1-200 characters"));
            };
            
            if (Text.size(request.description) == 0 or Text.size(request.description) > 5000) {
                return #Err(#BadRequest("Description must be 1-5000 characters"));
            };

            let now = Time.now();
            let votingDuration = switch (request.votingDuration) {
                case null config.votingPeriod;
                case (?duration) duration;
            };
            
            let executionDelay = switch (request.executionDelay) {
                case null config.executionDelay;
                case (?delay) delay;
            };

            let totalStaked = getTotalStakedTokens();
            let quorumRequired = Float.fromInt(totalStaked) * (config.quorumPercentage / 100.0);

            let proposal: Proposal = {
                id = nextProposalId;
                proposer = caller;
                proposalType = request.proposalType;
                title = request.title;
                description = request.description;
                createdAt = now;
                votingStartsAt = now;
                votingEndsAt = now + votingDuration;
                executionDelay = executionDelay;
                status = #Active;
                votes = [];
                totalYesVotes = 0;
                totalNoVotes = 0;
                totalAbstainVotes = 0;
                quorumRequired = Int.abs(Float.toInt(quorumRequired));
                approvalThreshold = config.approvalThreshold;
                executedAt = null;
                executedBy = null;
                discussionThread = [];
            };

            proposals.put(nextProposalId, proposal);
            nextProposalId += 1;

            let updatedToken: GovernanceToken = {
                userToken with
                balance = userToken.balance - config.proposalDeposit;
                lastActivityAt = now;
            };
            governanceTokens.put(caller, updatedToken);

            #Ok(proposal)
        };

        public func castVote(
            caller: Principal,
            request: CastVoteRequest
        ): Types.Result<Bool, Types.Error> {
            
            let proposal = switch (proposals.get(request.proposalId)) {
                case null return #Err(#NotFound("Proposal not found"));
                case (?p) p;
            };

            let now = Time.now();
            if (proposal.status != #Active) {
                return #Err(#BadRequest("Proposal is not in voting phase"));
            };

            if (now < proposal.votingStartsAt or now > proposal.votingEndsAt) {
                return #Err(#BadRequest("Voting period has ended or not started"));
            };

            // Fix: Changed from = to == and added {} for function body
            let hasVoted = Array.find<VoteRecord>(proposal.votes, func(v) { v.voter == caller });
            
            if (hasVoted != null) {
                return #Err(#BadRequest("You have already voted on this proposal"));
            };

            let votingPower = getVotingPower(caller);
            if (votingPower < config.minVotingPower) {
                return #Err(#Forbidden("Insufficient voting power"));
            };

            let voteRecord: VoteRecord = {
                voter = caller;
                vote = request.vote;
                votingPower = votingPower;
                timestamp = now;
                reason = request.reason;
            };

            let updatedVotes = Array.append(proposal.votes, [voteRecord]);
            let (newYesVotes, newNoVotes, newAbstainVotes) = switch (request.vote) {
                case (#Yes) (proposal.totalYesVotes + votingPower, proposal.totalNoVotes, proposal.totalAbstainVotes);
                case (#No) (proposal.totalYesVotes, proposal.totalNoVotes + votingPower, proposal.totalAbstainVotes);
                case (#Abstain) (proposal.totalYesVotes, proposal.totalNoVotes, proposal.totalAbstainVotes + votingPower);
            };

            let updatedProposal: Proposal = {
                proposal with
                votes = updatedVotes;
                totalYesVotes = newYesVotes;
                totalNoVotes = newNoVotes;
                totalAbstainVotes = newAbstainVotes;
            };

            proposals.put(request.proposalId, updatedProposal);

            switch (governanceTokens.get(caller)) {
                case null {};
                case (?token) {
                    let updatedToken: GovernanceToken = {
                        token with
                        lastActivityAt = now;
                        reputationScore = token.reputationScore + 0.1;
                    };
                    governanceTokens.put(caller, updatedToken);
                };
            };

            #Ok(true)
        };

        public func processProposalResults(): [ProposalId] {
            let now = Time.now();
            let processedProposals = Buffer.Buffer<ProposalId>(0);

            for ((id, proposal) in proposals.entries()) {
                if (proposal.status == #Active and now > proposal.votingEndsAt) {
                    let totalVotes = proposal.totalYesVotes + proposal.totalNoVotes + proposal.totalAbstainVotes;
                    let hasQuorum = totalVotes >= proposal.quorumRequired;
                    
                    let newStatus = if (hasQuorum) {
                        let approvalPercentage = (Float.fromInt(proposal.totalYesVotes) / Float.fromInt(totalVotes)) * 100.0;
                        if (approvalPercentage >= proposal.approvalThreshold) {
                            #Passed
                        } else {
                            #Failed
                        }
                    } else {
                        #Expired
                    };

                    let updatedProposal: Proposal = {
                        proposal with
                        status = newStatus;
                    };

                    proposals.put(id, updatedProposal);
                    processedProposals.add(id);
                };
            };

            Buffer.toArray(processedProposals)
        };

        public func executeProposal(
            caller: Principal,
            proposalId: ProposalId,
            repositories: HashMap.HashMap<Text, Types.Repository>
        ): Types.Result<Bool, Types.Error> {
            
            let proposal = switch (proposals.get(proposalId)) {
                case null return #Err(#NotFound("Proposal not found"));
                case (?p) p;
            };

            if (proposal.status != #Passed) {
                return #Err(#BadRequest("Proposal must be in 'Passed' status"));
            };

            let now = Time.now();
            if (now < proposal.votingEndsAt + proposal.executionDelay) {
                return #Err(#BadRequest("Execution delay period not completed"));
            };

            let executionResult = switch (proposal.proposalType) {
                case (#RepositoryUpdate(update)) {
                    executeRepositoryUpdate(update, repositories)
                };
                case (#TreasurySpend(spend)) {
                    executeTreasurySpend(spend)
                };
                case (#GovernanceConfig(configUpdate)) {
                    executeGovernanceConfigUpdate(configUpdate.newConfig)
                };
                case (#CollaboratorPromotion(promotion)) {
                    executeCollaboratorPromotion(promotion, repositories)
                };
                case (#PlatformUpgrade(_) or #CustomProposal(_)) {
                    #Ok(true)
                };
            };

            switch (executionResult) {
                case (#Ok(_)) {
                    let updatedProposal: Proposal = {
                        proposal with
                        status = #Executed;
                        executedAt = ?now;
                        executedBy = ?caller;
                    };
                    proposals.put(proposalId, updatedProposal);
                    #Ok(true)
                };
                case (#Err(error)) #Err(error);
            }
        };

        public func getProposal(proposalId: ProposalId): ?Proposal {
            proposals.get(proposalId)
        };

        public func listProposals(request: ProposalListRequest): ProposalListResponse {
            let allProposals = Buffer.Buffer<Proposal>(0);
            
            for ((_, proposal) in proposals.entries()) {
                let statusMatch = switch (request.status) {
                    case null true;
                    case (?status) proposal.status == status;
                };
                
                let proposerMatch = switch (request.proposer) {
                    case null true;
                    case (?proposer) proposal.proposer == proposer;
                };
                
                if (statusMatch and proposerMatch) {
                    allProposals.add(proposal);
                };
            };

            let sortedProposals = Array.sort<Proposal>(
                Buffer.toArray(allProposals),
                func(a, b) { Int.compare(b.createdAt, a.createdAt) }
            );

            let page = switch (request.pagination) { case null 0; case (?p) p.page; };
            let limit = switch (request.pagination) { case null 20; case (?p) p.limit; };
            let startIndex = page * limit;
            let endIndex = Nat.min(startIndex + limit, sortedProposals.size());
            
            let paginatedProposals = if (startIndex < sortedProposals.size()) {
                Array.subArray<Proposal>(sortedProposals, startIndex, endIndex - startIndex)
            } else {
                []
            };

            {
                proposals = paginatedProposals;
                totalCount = sortedProposals.size();
                hasMore = endIndex < sortedProposals.size();
            }
        };

        public func addDiscussionPost(
            caller: Principal,
            request: AddDiscussionPostRequest
        ): Types.Result<DiscussionPost, Types.Error> {
            
            let proposal = switch (proposals.get(request.proposalId)) {
                case null return #Err(#NotFound("Proposal not found"));
                case (?p) p;
            };

            if (Text.size(request.content) == 0 or Text.size(request.content) > 2000) {
                return #Err(#BadRequest("Content must be 1-2000 characters"));
            };

            let postId = proposal.discussionThread.size();
            let discussionPost: DiscussionPost = {
                id = postId;
                author = caller;
                content = request.content;
                timestamp = Time.now();
                parentId = request.parentId;
                reactions = [];
            };

            let updatedThread = Array.append(proposal.discussionThread, [discussionPost]);
            let updatedProposal: Proposal = {
                proposal with
                discussionThread = updatedThread;
            };

            proposals.put(request.proposalId, updatedProposal);
            #Ok(discussionPost)
        };

        public func getVotingStats(): VotingStats {
            var totalStaked: TokenAmount = 0;
            var totalSupply: TokenAmount = 0;
            var activeVoters: Nat = 0;
            let thirtyDaysAgo = Time.now() - (30 * 24 * 60 * 60 * 1_000_000_000);

            for ((_, token) in governanceTokens.entries()) {
                totalSupply += token.balance + token.staked;
                totalStaked += token.staked;
                
                if (token.lastActivityAt > thirtyDaysAgo) {
                    activeVoters += 1;
                };
            };

            let participationRate = if (governanceTokens.size() > 0) {
                (Float.fromInt(activeVoters) / Float.fromInt(governanceTokens.size())) * 100.0
            } else {
                0.0
            };

            {
                totalSupply = totalSupply;
                circulatingSupply = totalSupply - totalStaked;
                totalStaked = totalStaked;
                activeVoters = activeVoters;
                participationRate = participationRate;
            }
        };

        private func getUserActiveProposals(caller: Principal): Nat {
            var count: Nat = 0;
            for ((_, proposal) in proposals.entries()) {
                if (proposal.proposer == caller and (proposal.status == #Active or proposal.status == #Draft)) {
                    count += 1;
                };
            };
            count
        };

        private func getTotalStakedTokens(): Int {
            var total: Int = 0;
            for ((_, token) in governanceTokens.entries()) {
                total += token.staked;
            };
            total
        };

        private func executeRepositoryUpdate(
            update: {repositoryId: Text; newSettings: Types.RepositorySettings},
            repositories: HashMap.HashMap<Text, Types.Repository>
        ): Types.Result<Bool, Types.Error> {
            switch (repositories.get(update.repositoryId)) {
                case null #Err(#NotFound("Repository not found"));
                case (?repo) {
                    let updatedRepo: Types.Repository = {
                        repo with
                        settings = update.newSettings;
                        updatedAt = Time.now();
                    };
                    repositories.put(update.repositoryId, updatedRepo);
                    #Ok(true)
                };
            }
        };

        private func executeTreasurySpend(
            spend: {amount: TokenAmount; recipient: Principal; purpose: Text}
        ): Types.Result<Bool, Types.Error> {
            if (treasury < spend.amount) {
                return #Err(#BadRequest("Insufficient treasury funds"));
            };
            
            treasury -= spend.amount;
            
            switch (governanceTokens.get(spend.recipient)) {
                case null {
                    initializeGovernanceToken(spend.recipient, spend.amount);
                };
                case (?token) {
                    let updatedToken: GovernanceToken = {
                        token with
                        balance = token.balance + spend.amount;
                    };
                    governanceTokens.put(spend.recipient, updatedToken);
                };
            };
            
            #Ok(true)
        };

        private func executeGovernanceConfigUpdate(
            newConfig: GovernanceConfig
        ): Types.Result<Bool, Types.Error> {
            config := newConfig;
            #Ok(true)
        };

        private func executeCollaboratorPromotion(
            promotion: {repositoryId: Text; collaborator: Principal; newPermission: Types.CollaboratorPermission},
            repositories: HashMap.HashMap<Text, Types.Repository>
        ): Types.Result<Bool, Types.Error> {
            switch (repositories.get(promotion.repositoryId)) {
                case null #Err(#NotFound("Repository not found"));
                case (?repo) {
                    // Check if collaborator exists in the HashMap
                    switch (repo.collaborators.get(promotion.collaborator)) {
                        case null #Err(#NotFound("Collaborator not found"));
                        case (?currentCollab) {
                            // Update the collaborator's permission
                            let updatedCollab: Types.Collaborator = {
                                currentCollab with
                                permission = promotion.newPermission;
                            };
                            
                            // Put the updated collaborator back in the HashMap
                            repo.collaborators.put(promotion.collaborator, updatedCollab);
                            
                            // Update the repository's updatedAt timestamp
                            let updatedRepo: Types.Repository = {
                                repo with
                                updatedAt = Time.now();
                            };
                            
                            repositories.put(promotion.repositoryId, updatedRepo);
                            #Ok(true)
                        };
                    }
                };
            }
        };

        public func preupgrade(): {
            proposals: [(ProposalId, Proposal)];
            governanceTokens: [(Principal, GovernanceToken)];
            config: GovernanceConfig;
            treasury: TokenAmount;
            nextProposalId: ProposalId;
        } {
            {
                proposals = Iter.toArray(proposals.entries());
                governanceTokens = Iter.toArray(governanceTokens.entries());
                config = config;
                treasury = treasury;
                nextProposalId = nextProposalId;
            }
        };

        public func postupgrade(data: {
            proposals: [(ProposalId, Proposal)];
            governanceTokens: [(Principal, GovernanceToken)];
            config: GovernanceConfig;
            treasury: TokenAmount;
            nextProposalId: ProposalId;
        }) {
            proposals := HashMap.fromIter<ProposalId, Proposal>(
                data.proposals.vals(),
                data.proposals.size(),
                Nat.equal,
                natHash 
            );
            governanceTokens := HashMap.fromIter<Principal, GovernanceToken>(
                data.governanceTokens.vals(),
                data.governanceTokens.size(),
                Principal.equal,
                Principal.hash
            );
            config := data.config;
            treasury := data.treasury;
            nextProposalId := data.nextProposalId;
        };
    };
}
