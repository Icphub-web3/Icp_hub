import Types "../types";
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Float "mo:base/Float";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
import Utils "../utils/utils";

module Incentives {
    // Type definitions
    type Result<T, E> = Types.Result<T, E>;
    type Error = Types.Error;
    type Repository = Types.Repository;
    type User = Types.User;

    // Token types
    public type TokenAmount = Nat;
    public type TokenSymbol = Text;

    public type Token = {
        symbol: TokenSymbol;
        name: Text;
        decimals: Nat;
        totalSupply: TokenAmount;
        circulatingSupply: TokenAmount;
    };

    // Reward types
    public type RewardType = {
        #CommitReward;
        #PullRequestMerged;
        #IssueResolved;
        #CodeReview;
        #BugBounty;
        #SecurityAudit;
        #Documentation;
        #CommunityContribution;
        #MilestoneCompletion;
        #CustomReward: Text;
    };

    public type RewardTier = {
        #Bronze;
        #Silver;
        #Gold;
        #Platinum;
        #Diamond;
    };

    public type RewardConfig = {
        rewardType: RewardType;
        baseAmount: TokenAmount;
        multiplier: Float;
        maxAmount: ?TokenAmount;
        cooldownPeriod: ?Int; // nanoseconds
        requiresApproval: Bool;
        tier: RewardTier;
    };

    public type Reward = {
        id: Text;
        recipient: Principal;
        repositoryId: Text;
        rewardType: RewardType;
        amount: TokenAmount;
        reason: Text;
        transactionId: ?Text;
        createdAt: Int;
        approvedBy: ?Principal;
        status: RewardStatus;
        metadata: ?RewardMetadata;
    };

    public type RewardStatus = {
        #Pending;
        #Approved;
        #Distributed;
        #Rejected;
        #Cancelled;
    };

    public type RewardMetadata = {
        commitId: ?Text;
        pullRequestId: ?Text;
        issueId: ?Text;
        contributionScore: ?Float;
        impactLevel: ?ImpactLevel;
    };

    public type ImpactLevel = {
        #Low;
        #Medium;
        #High;
        #Critical;
    };

    // Bounty types
    public type Bounty = {
        id: Text;
        repositoryId: Text;
        title: Text;
        description: Text;
        amount: TokenAmount;
        currency: TokenSymbol;
        createdBy: Principal;
        createdAt: Int;
        expiresAt: ?Int;
        status: BountyStatus;
        assignedTo: ?Principal;
        requirements: [Text];
        tags: [Text];
        difficulty: DifficultyLevel;
        submissions: [BountySubmission];
    };

    public type BountyStatus = {
        #Open;
        #Assigned;
        #InProgress;
        #UnderReview;
        #Completed;
        #Cancelled;
        #Expired;
    };

    public type DifficultyLevel = {
        #Beginner;
        #Intermediate;
        #Advanced;
        #Expert;
    };

    public type BountySubmission = {
        id: Text;
        submittedBy: Principal;
        submittedAt: Int;
        pullRequestId: ?Text;
        commitIds: [Text];
        description: Text;
        status: SubmissionStatus;
        reviewedBy: ?Principal;
        reviewNotes: ?Text;
    };

    public type SubmissionStatus = {
        #Pending;
        #Approved;
        #Rejected;
        #RequiresChanges;
    };

    // Staking types
    public type StakePosition = {
        amount: TokenAmount;
        stakedAt: Int;
        lockPeriod: Int; // nanoseconds
        unlocksAt: Int;
        rewardRate: Float; // APY
        accumulatedRewards: TokenAmount;
        lastClaimAt: Int;
    };

    // Leaderboard types
    public type LeaderboardEntry = {
        user: Principal;
        username: Text;
        totalEarned: TokenAmount;
        contributionCount: Nat;
        averageImpact: Float;
        rank: Nat;
        badges: [Badge];
    };

    public type Badge = {
        id: Text;
        name: Text;
        description: Text;
        icon: Text;
        earnedAt: Int;
        category: BadgeCategory;
    };

    public type BadgeCategory = {
        #Contributor;
        #Reviewer;
        #Maintainer;
        #Security;
        #Community;
        #Special;
    };

    // Treasury management
    public type Treasury = {
        balance: TokenAmount;
        reserved: TokenAmount;
        distributed: TokenAmount;
        monthlyBudget: TokenAmount;
        budgetRemaining: TokenAmount;
        lastResetAt: Int;
    };

    // Contribution metrics
    public type ContributionMetrics = {
        userId: Principal;
        repositoryId: Text;
        totalCommits: Nat;
        totalPullRequests: Nat;
        totalIssuesResolved: Nat;
        totalReviews: Nat;
        codeQualityScore: Float;
        impactScore: Float;
        consistencyScore: Float;
        lastUpdated: Int;
    };

    // State management
    public class IncentiveSystem() {
        // Token state
        private var token: Token = {
            symbol = "ICPH";
            name = "ICPHub Token";
            decimals = 8;
            totalSupply = 1_000_000_000 * 100_000_000; // 1 billion tokens
            circulatingSupply = 0;
        };

        // Balances
        private var balances = HashMap.HashMap<Principal, TokenAmount>(100, Principal.equal, Principal.hash);
        
        // Rewards
        private var rewards = HashMap.HashMap<Text, Reward>(100, Text.equal, Text.hash);
        private var rewardConfigs = HashMap.HashMap<RewardType, RewardConfig>(20, func(a, b) { a == b }, func(r) { 0 });
        
        // Bounties
        private var bounties = HashMap.HashMap<Text, Bounty>(50, Text.equal, Text.hash);
        
        // Staking
        private var stakes = HashMap.HashMap<Principal, [StakePosition]>(100, Principal.equal, Principal.hash);
        
        // Metrics
        private var contributionMetrics = HashMap.HashMap<Text, ContributionMetrics>(100, Text.equal, Text.hash);
        
        // Treasury
        private var treasury: Treasury = {
            balance = 100_000_000 * 100_000_000; // 100 million tokens
            reserved = 0;
            distributed = 0;
            monthlyBudget = 1_000_000 * 100_000_000; // 1 million tokens per month
            budgetRemaining = 1_000_000 * 100_000_000;
            lastResetAt = Time.now();
        };

        // Initialize default reward configs
        public func init() {
            // Commit rewards
            rewardConfigs.put(#CommitReward, {
                rewardType = #CommitReward;
                baseAmount = 10 * 100_000_000; // 10 ICPH
                multiplier = 1.0;
                maxAmount = ?(100 * 100_000_000); // 100 ICPH max per commit
                cooldownPeriod = ?(60 * 60 * 1_000_000_000); // 1 hour
                requiresApproval = false;
                tier = #Bronze;
            });

            // Pull request rewards
            rewardConfigs.put(#PullRequestMerged, {
                rewardType = #PullRequestMerged;
                baseAmount = 50 * 100_000_000; // 50 ICPH
                multiplier = 1.5;
                maxAmount = ?(500 * 100_000_000);
                cooldownPeriod = null;
                requiresApproval = false;
                tier = #Silver;
            });

            // Bug bounty rewards
            rewardConfigs.put(#BugBounty, {
                rewardType = #BugBounty;
                baseAmount = 500 * 100_000_000; // 500 ICPH
                multiplier = 2.0;
                maxAmount = ?(10_000 * 100_000_000);
                cooldownPeriod = null;
                requiresApproval = true;
                tier = #Gold;
            });

            // Add more default configs...
        };

        // Token functions
        public func getBalance(principal: Principal): TokenAmount {
            switch (balances.get(principal)) {
                case null 0;
                case (?balance) balance;
            };
        };

        public func transfer(
            from: Principal,
            to: Principal,
            amount: TokenAmount
        ): Result<Bool, Error> {
            let fromBalance = getBalance(from);
            
            if (fromBalance < amount) {
                return #Err(#BadRequest("Insufficient balance"));
            };
            
            balances.put(from, fromBalance - amount);
            balances.put(to, getBalance(to) + amount);
            
            #Ok(true);
        };

        // Reward functions
        public func calculateReward(
            rewardType: RewardType,
            metrics: ContributionMetrics,
            multipliers: ?[Float]
        ): TokenAmount {
            let config = switch (rewardConfigs.get(rewardType)) {
                case null {
                    // Default config if not found
                    {
                        rewardType = rewardType;
                        baseAmount = 10 * 100_000_000;
                        multiplier = 1.0;
                        maxAmount = ?(100 * 100_000_000);
                        cooldownPeriod = null;
                        requiresApproval = false;
                        tier = #Bronze;
                    };
                };
                case (?c) c;
            };
            
            var amount = config.baseAmount;
            
            // Apply base multiplier
            //amount := Float.toInt(Float.fromInt(amount) * config.multiplier);
            let result = Float.toInt(Float.fromInt(amount) * config.multiplier);
            amount := Int.abs(result);
            
            // Apply custom multipliers
            switch (multipliers) {
                case null {};
                case (?mults) {
                    for (mult in mults.vals()) {
                        //amount := Float.toInt(Float.fromInt(amount) * mult);
                        let result = Float.toInt(Float.fromInt(amount) * mult);
                        amount := Int.abs(result);
                    };
                };
            };
            
            // Apply impact score
            //amount := Float.toInt(Float.fromInt(amount) * metrics.impactScore);
            let metrics_result = Float.toInt(Float.fromInt(amount) * metrics.impactScore);
            amount := Int.abs(metrics_result);
            
            // Cap at max amount
            switch (config.maxAmount) {
                case null amount;
                case (?max) Nat.min(amount, max);
            };
        };

        public func distributeReward(
            recipient: Principal,
            repositoryId: Text,
            rewardType: RewardType,
            reason: Text,
            metadata: ?RewardMetadata
        ): Result<Reward, Error> {
            // Check treasury budget
            let config = switch (rewardConfigs.get(rewardType)) {
                case null return #Err(#NotFound("Reward config not found"));
                case (?c) c;
            };
            
            // Get user metrics
            let metricsKey = Principal.toText(recipient) # "_" # repositoryId;
            let metrics = switch (contributionMetrics.get(metricsKey)) {
                case null {
                    // Create default metrics
                    {
                        userId = recipient;
                        repositoryId = repositoryId;
                        totalCommits = 0;
                        totalPullRequests = 0;
                        totalIssuesResolved = 0;
                        totalReviews = 0;
                        codeQualityScore = 1.0;
                        impactScore = 1.0;
                        consistencyScore = 1.0;
                        lastUpdated = Time.now();
                    };
                };
                case (?m) m;
            };
            
            let amount = calculateReward(rewardType, metrics, null);
            
            if (treasury.budgetRemaining < amount) {
                return #Err(#BadRequest("Insufficient treasury budget"));
            };
            
            let rewardId = generateRewardId(recipient, repositoryId);
            let reward: Reward = {
                id = rewardId;
                recipient = recipient;
                repositoryId = repositoryId;
                rewardType = rewardType;
                amount = amount;
                reason = reason;
                transactionId = null;
                createdAt = Time.now();
                approvedBy = if (config.requiresApproval) null else ?recipient;
                status = if (config.requiresApproval) #Pending else #Approved;
                metadata = metadata;
            };
            
            rewards.put(rewardId, reward);
            
            // If auto-approved, distribute immediately
            if (not config.requiresApproval) {
                ignore distributeApprovedReward(rewardId);
            };
            
            #Ok(reward);
        };

        private func distributeApprovedReward(rewardId: Text): Result<Bool, Error> {
            switch (rewards.get(rewardId)) {
                case null #Err(#NotFound("Reward not found"));
                case (?reward) {
                    if (reward.status != #Approved) {
                        return #Err(#BadRequest("Reward not approved"));
                    };
                    
                    // Update balances
                    balances.put(reward.recipient, getBalance(reward.recipient) + reward.amount);
                    
                    // Update treasury
                    treasury := {
                        treasury with
                        balance = treasury.balance - reward.amount;
                        distributed = treasury.distributed + reward.amount;
                        budgetRemaining = treasury.budgetRemaining - reward.amount;
                    };
                    
                    // Update reward status
                    let updatedReward = {
                        reward with
                        status = #Distributed;
                        transactionId = ?("tx_" # rewardId);
                    };
                    rewards.put(rewardId, updatedReward);
                    
                    // Update token circulation
                    token := {
                        token with
                        circulatingSupply = token.circulatingSupply + reward.amount;
                    };
                    
                    #Ok(true);
                };
            };
        };

        // Bounty functions
        public func createBounty(
            creator: Principal,
            repositoryId: Text,
            title: Text,
            description: Text,
            amount: TokenAmount,
            requirements: [Text],
            difficulty: DifficultyLevel,
            expiresInDays: ?Nat
        ): Result<Bounty, Error> {
            // Validate creator has enough balance
            if (getBalance(creator) < amount) {
                return #Err(#BadRequest("Insufficient balance to create bounty"));
            };
            
            let bountyId = generateBountyId(repositoryId);
            let now = Time.now();
            let expiresAt = switch (expiresInDays) {
                case null null;
                case (?days) ?(now + days * 24 * 60 * 60 * 1_000_000_000);
            };
            
            let bounty: Bounty = {
                id = bountyId;
                repositoryId = repositoryId;
                title = title;
                description = description;
                amount = amount;
                currency = token.symbol;
                createdBy = creator;
                createdAt = now;
                expiresAt = expiresAt;
                status = #Open;
                assignedTo = null;
                requirements = requirements;
                tags = [];
                difficulty = difficulty;
                submissions = [];
            };
            
            // Lock funds in treasury
            balances.put(creator, getBalance(creator) - amount);
            treasury := {
                treasury with
                reserved = treasury.reserved + amount;
            };
            
            bounties.put(bountyId, bounty);
            #Ok(bounty);
        };

        public func submitBounty(
            submitter: Principal,
            bountyId: Text,
            pullRequestId: ?Text,
            commitIds: [Text],
            description: Text
        ): Result<BountySubmission, Error> {
            switch (bounties.get(bountyId)) {
                case null #Err(#NotFound("Bounty not found"));
                case (?bounty) {
                    if (bounty.status != #Open and bounty.status != #Assigned) {
                        return #Err(#BadRequest("Bounty not accepting submissions"));
                    };
                    
                    switch (bounty.assignedTo) {
                        case (?assigned) {
                            if (assigned != submitter) {
                                return #Err(#Forbidden("Bounty assigned to another user"));
                            };
                        };
                        case null {};
                    };
                    
                    let submissionId = generateSubmissionId(bountyId);
                    let submission: BountySubmission = {
                        id = submissionId;
                        submittedBy = submitter;
                        submittedAt = Time.now();
                        pullRequestId = pullRequestId;
                        commitIds = commitIds;
                        description = description;
                        status = #Pending;
                        reviewedBy = null;
                        reviewNotes = null;
                    };
                    
                    let updatedBounty = {
                        bounty with
                        status = #UnderReview;
                        submissions = Array.append(bounty.submissions, [submission]);
                    };
                    
                    bounties.put(bountyId, updatedBounty);
                    #Ok(submission);
                };
            };
        };

        // Staking functions
        public func stake(
            staker: Principal,
            amount: TokenAmount,
            lockPeriod: Int
        ): Result<StakePosition, Error> {
            if (getBalance(staker) < amount) {
                return #Err(#BadRequest("Insufficient balance to stake"));
            };
            
            let now = Time.now();
            let rewardRate = calculateStakingAPY(lockPeriod);
            
            let position: StakePosition = {
                amount = amount;
                stakedAt = now;
                lockPeriod = lockPeriod;
                unlocksAt = now + lockPeriod;
                rewardRate = rewardRate;
                accumulatedRewards = 0;
                lastClaimAt = now;
            };
            
            // Update balance
            balances.put(staker, getBalance(staker) - amount);
            
            // Add to stakes
            let existingStakes = switch (stakes.get(staker)) {
                case null [];
                case (?s) s;
            };
            stakes.put(staker, Array.append(existingStakes, [position]));
            
            #Ok(position);
        };

        public func claimStakingRewards(staker: Principal): Result<TokenAmount, Error> {
            switch (stakes.get(staker)) {
                case null #Err(#NotFound("No staking positions found"));
                case (?positions) {
                    var totalRewards: TokenAmount = 0;
                    let now = Time.now();
                    
                    let updatedPositions = Array.map<StakePosition, StakePosition>(
                        positions,
                        func(pos) {
                            let timeSinceLastClaim = now - pos.lastClaimAt;
                            let rewards = calculateStakingRewards(
                                pos.amount,
                                pos.rewardRate,
                                timeSinceLastClaim
                            );
                            totalRewards += rewards;
                            
                            {
                                pos with
                                accumulatedRewards = pos.accumulatedRewards + rewards;
                                lastClaimAt = now;
                            }
                        }
                    );
                    
                    stakes.put(staker, updatedPositions);
                    balances.put(staker, getBalance(staker) + totalRewards);
                    
                    #Ok(totalRewards);
                };
            };
        };

        // Leaderboard functions
        public func getLeaderboard(
            repositoryId: ?Text,
            timeframe: ?Int,
            limit: Nat
        ): [LeaderboardEntry] {
            let entries = Buffer.Buffer<LeaderboardEntry>(limit);
            let now = Time.now();
            let cutoffTime = switch (timeframe) {
                case null 0; // All time
                case (?tf) now - tf;
            };
            
            // Aggregate user stats
            for ((key, metrics) in contributionMetrics.entries()) {
                if (metrics.lastUpdated >= cutoffTime) {
                    switch (repositoryId) {
                        case null {
                            // Global leaderboard
                            entries.add(createLeaderboardEntry(metrics));
                        };
                        case (?repoId) {
                            if (metrics.repositoryId == repoId) {
                                entries.add(createLeaderboardEntry(metrics));
                            };
                        };
                    };
                };
            };
            
            // Sort by total earned
            let sorted = Array.sort<LeaderboardEntry>(
                Buffer.toArray(entries),
                func(a, b) {
                    if (a.totalEarned > b.totalEarned) #less
                    else if (a.totalEarned < b.totalEarned) #greater
                    else #equal
                }
            );
            
            // Assign ranks
            Array.tabulate<LeaderboardEntry>(
                Nat.min(sorted.size(), limit),
                func(i) {
                    {
                        sorted[i] with
                        rank = i + 1;
                    }
                }
            );
        };

        // Helper functions
        private func generateRewardId(recipient: Principal, repositoryId: Text): Text {
            "reward_" # Principal.toText(recipient) # "_" # repositoryId # "_" # Int.toText(Time.now());
        };

        private func generateBountyId(repositoryId: Text): Text {
            "bounty_" # repositoryId # "_" # Int.toText(Time.now());
        };

        private func generateSubmissionId(bountyId: Text): Text {
            "submission_" # bountyId # "_" # Int.toText(Time.now());
        };

        private func calculateStakingAPY(lockPeriod: Int): Float {
            // Longer lock periods get higher APY
            let days = lockPeriod / (24 * 60 * 60 * 1_000_000_000);
            if (days >= 365) { 20.0 }      // 20% APY for 1 year
            else if (days >= 180) { 15.0 } // 15% APY for 6 months
            else if (days >= 90) { 10.0 }  // 10% APY for 3 months
            else if (days >= 30) { 5.0 }   // 5% APY for 1 month
            else { 2.0 }                    // 2% APY for less than 1 month
        };

        private func calculateStakingRewards(
            amount: TokenAmount,
            apy: Float,
            timeElapsed: Int
        ): TokenAmount {
            let yearInNanos = 365 * 24 * 60 * 60 * 1_000_000_000;
            let timeRatio = Float.fromInt(timeElapsed) / Float.fromInt(yearInNanos);
            let rewards = Float.fromInt(amount) * (apy / 100.0) * timeRatio;
            Int.abs(Float.toInt(rewards));
        };

        private func createLeaderboardEntry(metrics: ContributionMetrics): LeaderboardEntry {
            // Get total earned from reward history
            var totalEarned: TokenAmount = 0;
            for ((_, reward) in rewards.entries()) {
                if (reward.recipient == metrics.userId and reward.status == #Distributed) {
                    totalEarned += reward.amount;
                };
            };
            
            {
                user = metrics.userId;
                username = Principal.toText(metrics.userId); // Should lookup actual username
                totalEarned = totalEarned;
                contributionCount = metrics.totalCommits + metrics.totalPullRequests + metrics.totalIssuesResolved;
                averageImpact = metrics.impactScore;
                rank = 0; // Will be set during sorting
                badges = []; // Would fetch user badges
            };
        };

        // Update contribution metrics
        public func updateMetrics(
            userId: Principal,
            repositoryId: Text,
            metricType: {
                #Commit;
                #PullRequest;
                #IssueResolved;
                #CodeReview;
            }
        ) {
            let key = Principal.toText(userId) # "_" # repositoryId;
            let current = switch (contributionMetrics.get(key)) {
                case null {
                    {
                        userId = userId;
                        repositoryId = repositoryId;
                        totalCommits = 0;
                        totalPullRequests = 0;
                        totalIssuesResolved = 0;
                        totalReviews = 0;
                        codeQualityScore = 1.0;
                        impactScore = 1.0;
                        consistencyScore = 1.0;
                        lastUpdated = Time.now();
                    };
                };
                case (?m) m;
            };
            
            let updated = switch (metricType) {
                case (#Commit) { { current with totalCommits = current.totalCommits + 1 } };
                case (#PullRequest) { { current with totalPullRequests = current.totalPullRequests + 1 } };
                case (#IssueResolved) { { current with totalIssuesResolved = current.totalIssuesResolved + 1 } };
                case (#CodeReview) { { current with totalReviews = current.totalReviews + 1 } };
            };
            
            contributionMetrics.put(key, {
                updated with
                lastUpdated = Time.now();
                impactScore = calculateImpactScore(updated);
            });
        };

        private func calculateImpactScore(metrics: ContributionMetrics): Float {
            // Simple impact calculation - can be made more sophisticated
            let commitScore = Float.fromInt(metrics.totalCommits) * 1.0;
            let prScore = Float.fromInt(metrics.totalPullRequests) * 3.0;
            let issueScore = Float.fromInt(metrics.totalIssuesResolved) * 2.0;
            let reviewScore = Float.fromInt(metrics.totalReviews) * 2.5;
            
            let totalScore = commitScore + prScore + issueScore + reviewScore;
            let normalizedScore = totalScore / 100.0;
            
            // Cap between 0.5 and 5.0
            Float.max(0.5, Float.min(5.0, normalizedScore));
        };

        // Treasury management
        public func resetMonthlyBudget() {
            let now = Time.now();
            let monthInNanos = 30 * 24 * 60 * 60 * 1_000_000_000;
            
            if (now - treasury.lastResetAt >= monthInNanos) {
                treasury := {
                    treasury with
                    budgetRemaining = treasury.monthlyBudget;
                    lastResetAt = now;
                };
            };
        };

        // Serialization for upgrades
        public func preupgrade(): {
            token: Token;
            balances: [(Principal, TokenAmount)];
            rewards: [(Text, Reward)];
            rewardConfigs: [(RewardType, RewardConfig)];
            bounties: [(Text, Bounty)];
            stakes: [(Principal, [StakePosition])];
            contributionMetrics: [(Text, ContributionMetrics)];
            treasury: Treasury;
        } {
            {
                token = token;
                balances = Iter.toArray(balances.entries());
                rewards = Iter.toArray(rewards.entries());
                rewardConfigs = Iter.toArray(rewardConfigs.entries());
                bounties = Iter.toArray(bounties.entries());
                stakes = Iter.toArray(stakes.entries());
                contributionMetrics = Iter.toArray(contributionMetrics.entries());
                treasury = treasury;
            };
        };

        public func postupgrade(data: {
            token: Token;
            balances: [(Principal, TokenAmount)];
            rewards: [(Text, Reward)];
            rewardConfigs: [(RewardType, RewardConfig)];
            bounties: [(Text, Bounty)];
            stakes: [(Principal, [StakePosition])];
            contributionMetrics: [(Text, ContributionMetrics)];
            treasury: Treasury;
        }) {
            token := data.token;
            balances := HashMap.fromIter(data.balances.vals(), data.balances.size(), Principal.equal, Principal.hash);
            rewards := HashMap.fromIter(data.rewards.vals(), data.rewards.size(), Text.equal, Text.hash);

            rewardConfigs := HashMap.fromIter(data.rewardConfigs.vals(), data.rewardConfigs.size(), func(a: RewardType, b: RewardType): Bool { a == b }, func(r: RewardType): Nat32 {
                switch (r) {
                    case (#CommitReward) 1;
                    case (#PullRequestMerged) 2;
                    case (#IssueResolved) 3;
                    case (#CodeReview) 4;
                    case (#BugBounty) 5;
                    case (#SecurityAudit) 6;
                    case (#Documentation) 7;
                    case (#CommunityContribution) 8;
                    case (#MilestoneCompletion) 9;
                    case (#CustomReward(text)) Text.hash(text);
                }
            }
            );
            bounties := HashMap.fromIter(data.bounties.vals(), data.bounties.size(), Text.equal, Text.hash);
            stakes := HashMap.fromIter(data.stakes.vals(), data.stakes.size(), Principal.equal, Principal.hash);
            contributionMetrics := HashMap.fromIter(data.contributionMetrics.vals(), data.contributionMetrics.size(), Text.equal, Text.hash);
            treasury := data.treasury;
        };
    };
}
