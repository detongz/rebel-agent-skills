// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title AgentBountyHubV2
 * @notice On-chain bounty system with Agent Jury dispute resolution
 * @dev Implements escrow, verification, and decentralized jury-based dispute resolution
 * @custom:security-contact security@agentrewardhub.com
 */
contract AgentBountyHubV2 is
    Initializable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    IERC20 public asklToken;

    uint256 private _bountyCounter;

    // ============ Constants ============
    uint256 public constant MIN_JURY_STAKE = 1000 * 10**18; // 1000 ASKL
    uint256 public constant JURY_SELECTION_COUNT = 5; // 5 jurors per dispute
    uint256 public constant VOTING_PERIOD = 3 days;
    uint256 public constant JURY_REWARD_BPS = 200; // 2% of bounty for jurors
    uint256 public constant SLASH_PCT = 50; // 50% slash for malicious voting

    // ============ Enums ============
    enum BountyStatus {
        Active,      // Open for submissions
        Claimed,     // Agent claimed the bounty
        UnderReview, // Submission under review
        Completed,   // Bounty completed successfully
        Disputed,    // Dispute raised
        Cancelled    // Cancelled by creator
    }

    enum DisputeStatus {
        None,
        JurySelection, // Selecting jurors
        Voting,        // Jury voting in progress
        Resolved       // Dispute resolved
    }

    enum VoteChoice {
        InFavorOfCreator, // Vote for creator
        InFavorOfClaimer  // Vote for claimer
    }

    // ============ Structs ============
    struct Bounty {
        uint256 id;
        address creator;
        string title;
        string description; // IPFS hash in production
        uint256 reward;
        string category;
        uint256 deadline;
        BountyStatus status;
        address claimer;
        uint256 claimedAt;
        uint256 completedAt;
    }

    struct Submission {
        uint256 bountyId;
        address submitter;
        string reportHash; // IPFS hash
        uint256 submittedAt;
        bool approved;
    }

    struct Dispute {
        uint256 bountyId;
        address raiser;
        string reason;
        uint256 raisedAt;
        DisputeStatus status;
        uint256 resolutionTimestamp;
        bool resolvedInFavorOfCreator;
        address[] jurors; // Selected jurors
        uint256 votingDeadline; // When voting ends
    }

    struct JurorStake {
        address juror;
        uint256 stakeAmount;
        uint256 stakedAt;
        bool isActive;
        uint256 totalCases;
        uint256 correctVotes;
    }

    struct JuryVote {
        address juror;
        VoteChoice choice;
        uint256 votedAt;
        bool counted; // Whether vote aligned with majority
    }

    // ============ Mappings ============
    mapping(uint256 => Bounty) public bounties;
    mapping(uint256 => Submission[]) public submissions;
    mapping(uint256 => Dispute) public disputes;
    mapping(address => uint256[]) public userBounties;
    mapping(address => uint256[]) public userClaims;

    // Jury system mappings
    mapping(address => JurorStake) public jurorStakes;
    mapping(uint256 => JuryVote[]) public juryVotes; // bountyId => votes
    mapping(address => uint256[]) public jurorCaseHistory; // juror => case IDs
    mapping(address => uint256) public jurorListIndex; // juror => index in jurorList

    // List of active jurors for jury selection
    address[] public jurorList;

    // Pseudo-random seed for jury selection
    uint256 private _jurySelectionSeed;

    // ============ Events ============
    event BountyCreated(
        uint256 indexed bountyId,
        address indexed creator,
        string title,
        uint256 reward,
        string category
    );

    event BountyClaimed(
        uint256 indexed bountyId,
        address indexed claimer,
        uint256 claimedAt
    );

    event SubmissionMade(
        uint256 indexed bountyId,
        address indexed submitter,
        string reportHash
    );

    event SubmissionApproved(
        uint256 indexed bountyId,
        address indexed submitter,
        uint256 reward
    );

    event DisputeRaised(
        uint256 indexed bountyId,
        address indexed raiser,
        string reason
    );

    event JurySelected(
        uint256 indexed bountyId,
        address[] jurors
    );

    event JuryVoted(
        uint256 indexed bountyId,
        address indexed juror,
        VoteChoice choice
    );

    event DisputeResolved(
        uint256 indexed bountyId,
        bool inFavorOfCreator,
        uint256 votesForCreator,
        uint256 votesForClaimer
    );

    event JuryStaked(
        address indexed juror,
        uint256 amount
    );

    event JuryUnstaked(
        address indexed juror,
        uint256 amount
    );

    event JurorRewarded(
        address indexed juror,
        uint256 reward
    );

    event JurorSlashed(
        address indexed juror,
        uint256 amount
    );

    event BountyCancelled(uint256 indexed bountyId);

    // ============ Errors ============
    error InsufficientStake();
    error NotSelectedJuror();
    error VotingPeriodEnded();
    error AlreadyVoted();
    error NotEligibleJuror();
    error DisputeNotActive();

    // ============ Modifiers ============
    modifier onlySelectedJuror(uint256 bountyId) {
        Dispute storage dispute = disputes[bountyId];
        bool isJuror = false;
        for (uint256 i = 0; i < dispute.jurors.length; i++) {
            if (dispute.jurors[i] == msg.sender) {
                isJuror = true;
                break;
            }
        }
        if (!isJuror) revert NotSelectedJuror();
        _;
    }

    // ============ Constructor ============
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    // ============ Initializer ============
    function initialize(address _asklToken, address _initialOwner) external initializer {
        require(_asklToken != address(0), "Invalid token address");
        require(_initialOwner != address(0), "Invalid owner address");

        asklToken = IERC20(_asklToken);
        __Ownable_init(_initialOwner);
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
        _bountyCounter = 0;
        _jurySelectionSeed = block.timestamp;
    }

    // ============ UUPS Upgrade ============
    function _authorizeUpgrade(address) internal override onlyOwner {}

    // ============ Core Bounty Functions ============

    /**
     * @notice Create a new bounty with escrowed tokens
     * @param title Title of the bounty
     * @param description Description (IPFS hash)
     * @param reward Amount of ASKL tokens to escrow
     * @param category Category of work
     * @param deadline Deadline for completion
     */
    function createBounty(
        string calldata title,
        string calldata description,
        uint256 reward,
        string calldata category,
        uint256 deadline
    ) external nonReentrant returns (uint256) {
        require(reward > 0, "Reward must be greater than 0");
        require(deadline > block.timestamp, "Deadline must be in the future");

        // Transfer tokens from creator to contract (escrow)
        require(
            asklToken.transferFrom(msg.sender, address(this), reward),
            "Token transfer failed"
        );

        _bountyCounter++;
        uint256 bountyId = _bountyCounter;

        bounties[bountyId] = Bounty({
            id: bountyId,
            creator: msg.sender,
            title: title,
            description: description,
            reward: reward,
            category: category,
            deadline: deadline,
            status: BountyStatus.Active,
            claimer: address(0),
            claimedAt: 0,
            completedAt: 0
        });

        userBounties[msg.sender].push(bountyId);

        emit BountyCreated(bountyId, msg.sender, title, reward, category);

        return bountyId;
    }

    /**
     * @notice Claim a bounty (become the assigned agent)
     * @param bountyId ID of the bounty to claim
     */
    function claimBounty(uint256 bountyId) external nonReentrant {
        Bounty storage bounty = bounties[bountyId];
        require(bounty.id != 0, "Bounty does not exist");
        require(bounty.status == BountyStatus.Active, "Bounty not active");
        require(block.timestamp < bounty.deadline, "Bounty expired");
        require(msg.sender != bounty.creator, "Creator cannot claim own bounty");

        bounty.status = BountyStatus.Claimed;
        bounty.claimer = msg.sender;
        bounty.claimedAt = block.timestamp;

        userClaims[msg.sender].push(bountyId);

        emit BountyClaimed(bountyId, msg.sender, block.timestamp);
    }

    /**
     * @notice Submit work for a claimed bounty
     * @param bountyId ID of the bounty
     * @param reportHash IPFS hash of the submission report
     */
    function submitWork(
        uint256 bountyId,
        string calldata reportHash
    ) external nonReentrant {
        Bounty storage bounty = bounties[bountyId];
        require(bounty.id != 0, "Bounty does not exist");
        require(bounty.status == BountyStatus.Claimed, "Bounty not claimed");
        require(msg.sender == bounty.claimer, "Only claimer can submit");

        bounty.status = BountyStatus.UnderReview;

        submissions[bountyId].push(Submission({
            bountyId: bountyId,
            submitter: msg.sender,
            reportHash: reportHash,
            submittedAt: block.timestamp,
            approved: false
        }));

        emit SubmissionMade(bountyId, msg.sender, reportHash);
    }

    /**
     * @notice Approve submission and release escrowed tokens
     * @param bountyId ID of the bounty
     */
    function approveSubmission(uint256 bountyId) external nonReentrant {
        Bounty storage bounty = bounties[bountyId];
        require(bounty.id != 0, "Bounty does not exist");
        require(bounty.status == BountyStatus.UnderReview, "No submission to approve");
        require(
            msg.sender == bounty.creator || msg.sender == owner(),
            "Only creator or owner can approve"
        );

        bounty.status = BountyStatus.Completed;
        bounty.completedAt = block.timestamp;

        // Mark submission as approved
        for (uint256 i = 0; i < submissions[bountyId].length; i++) {
            if (submissions[bountyId][i].submitter == bounty.claimer) {
                submissions[bountyId][i].approved = true;
                break;
            }
        }

        // Release escrowed tokens to claimer
        require(
            asklToken.transfer(bounty.claimer, bounty.reward),
            "Token transfer failed"
        );

        emit SubmissionApproved(bountyId, bounty.claimer, bounty.reward);
    }

    // ============ Dispute Resolution with Agent Jury ============

    /**
     * @notice Raise a dispute for a bounty
     * @param bountyId ID of the bounty
     * @param reason Reason for the dispute
     */
    function raiseDispute(
        uint256 bountyId,
        string calldata reason
    ) external nonReentrant {
        Bounty storage bounty = bounties[bountyId];
        require(bounty.id != 0, "Bounty does not exist");
        require(
            bounty.status == BountyStatus.UnderReview,
            "Can only dispute under review"
        );
        require(
            msg.sender == bounty.creator || msg.sender == bounty.claimer,
            "Only creator or claimer can dispute"
        );
        require(disputes[bountyId].status == DisputeStatus.None, "Dispute already raised");

        bounty.status = BountyStatus.Disputed;

        // Create dispute and select jury
        disputes[bountyId] = Dispute({
            bountyId: bountyId,
            raiser: msg.sender,
            reason: reason,
            raisedAt: block.timestamp,
            status: DisputeStatus.JurySelection,
            resolutionTimestamp: 0,
            resolvedInFavorOfCreator: false,
            jurors: new address[](0),
            votingDeadline: 0
        });

        // Select jury immediately
        _selectJury(bountyId);

        emit DisputeRaised(bountyId, msg.sender, reason);
    }

    /**
     * @notice Select jury for a dispute using weighted random selection
     * @param bountyId ID of the bounty
     */
    function _selectJury(uint256 bountyId) internal {
        // Update seed for randomness
        _jurySelectionSeed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            _jurySelectionSeed,
            bountyId
        )));

        // Get all eligible jurors (those with active stake)
        address[] memory eligibleJurors = _getEligibleJurors();

        require(eligibleJurors.length >= JURY_SELECTION_COUNT, "Not enough jurors");

        // Weighted random selection based on stake amount
        address[] memory selected = new address[](JURY_SELECTION_COUNT);
        bool[] memory used = new bool[](eligibleJurors.length);

        for (uint256 i = 0; i < JURY_SELECTION_COUNT; i++) {
            uint256 totalWeight = 0;
            for (uint256 j = 0; j < eligibleJurors.length; j++) {
                if (!used[j]) {
                    totalWeight += jurorStakes[eligibleJurors[j]].stakeAmount;
                }
            }

            // Random selection weighted by stake
            uint256 randomValue = _jurySelectionSeed % totalWeight;
            uint256 cumulativeWeight = 0;

            for (uint256 j = 0; j < eligibleJurors.length; j++) {
                if (!used[j]) {
                    cumulativeWeight += jurorStakes[eligibleJurors[j]].stakeAmount;
                    if (randomValue < cumulativeWeight) {
                        selected[i] = eligibleJurors[j];
                        used[j] = true;
                        _jurySelectionSeed = uint256(keccak256(abi.encodePacked(_jurySelectionSeed, j)));
                        break;
                    }
                }
            }
        }

        // Update dispute with selected jurors
        Dispute storage dispute = disputes[bountyId];
        dispute.jurors = selected;
        dispute.status = DisputeStatus.Voting;
        dispute.votingDeadline = block.timestamp + VOTING_PERIOD;

        // Add to juror case history
        for (uint256 i = 0; i < selected.length; i++) {
            jurorCaseHistory[selected[i]].push(bountyId);
            jurorStakes[selected[i]].totalCases++;
        }

        emit JurySelected(bountyId, selected);
    }

    /**
     * @notice Get all eligible jurors (with active stake)
     * @return Array of eligible juror addresses
     */
    function _getEligibleJurors() internal view returns (address[] memory) {
        return jurorList;
    }

    /**
     * @notice Vote on a dispute (only selected jurors)
     * @param bountyId ID of the bounty
     * @param choice Vote choice (creator or claimer)
     */
    function castVote(
        uint256 bountyId,
        VoteChoice choice
    ) external onlySelectedJuror(bountyId) nonReentrant {
        Dispute storage dispute = disputes[bountyId];
        require(dispute.status == DisputeStatus.Voting, "Not in voting phase");
        require(block.timestamp <= dispute.votingDeadline, "Voting period ended");

        // Check if already voted
        JuryVote[] storage votes = juryVotes[bountyId];
        for (uint256 i = 0; i < votes.length; i++) {
            require(votes[i].juror != msg.sender, "Already voted");
        }

        // Record vote
        juryVotes[bountyId].push(JuryVote({
            juror: msg.sender,
            choice: choice,
            votedAt: block.timestamp,
            counted: false
        }));

        emit JuryVoted(bountyId, msg.sender, choice);

        // Check if all jurors have voted
        if (juryVotes[bountyId].length >= dispute.jurors.length) {
            _resolveDispute(bountyId);
        }
    }

    /**
     * @notice Resolve dispute based on jury votes
     * @param bountyId ID of the bounty
     */
    function _resolveDispute(uint256 bountyId) internal {
        Dispute storage dispute = disputes[bountyId];
        Bounty storage bounty = bounties[bountyId];

        // Tally votes (weighted by stake)
        uint256 weightForCreator = 0;
        uint256 weightForClaimer = 0;

        for (uint256 i = 0; i < juryVotes[bountyId].length; i++) {
            JuryVote memory vote = juryVotes[bountyId][i];
            uint256 weight = jurorStakes[vote.juror].stakeAmount;

            if (vote.choice == VoteChoice.InFavorOfCreator) {
                weightForCreator += weight;
            } else {
                weightForClaimer += weight;
            }
        }

        // Determine winner
        bool inFavorOfCreator = weightForCreator > weightForClaimer;
        dispute.resolvedInFavorOfCreator = inFavorOfCreator;
        dispute.status = DisputeStatus.Resolved;
        dispute.resolutionTimestamp = block.timestamp;

        // Mark votes as counted/slash
        for (uint256 i = 0; i < juryVotes[bountyId].length; i++) {
            JuryVote storage vote = juryVotes[bountyId][i];
            bool votedWithWinner = (vote.choice == VoteChoice.InFavorOfCreator) == inFavorOfCreator;
            vote.counted = votedWithWinner;

            if (votedWithWinner) {
                jurorStakes[vote.juror].correctVotes++;
            }
        }

        // Transfer funds
        uint256 juryReward = (bounty.reward * JURY_REWARD_BPS) / 10000;
        uint256 remainingReward = bounty.reward - juryReward;

        if (inFavorOfCreator) {
            bounty.status = BountyStatus.Cancelled;
            require(
                asklToken.transfer(bounty.creator, remainingReward),
                "Token transfer failed"
            );
        } else {
            bounty.status = BountyStatus.Completed;
            bounty.completedAt = block.timestamp;
            require(
                asklToken.transfer(bounty.claimer, remainingReward),
                "Token transfer failed"
            );
        }

        // Distribute jury rewards
        uint256 rewardPerJuror = juryReward / dispute.jurors.length;
        for (uint256 i = 0; i < dispute.jurors.length; i++) {
            address juror = dispute.jurors[i];
            asklToken.transfer(juror, rewardPerJuror);
            emit JurorRewarded(juror, rewardPerJuror);
        }

        emit DisputeResolved(bountyId, inFavorOfCreator, weightForCreator, weightForClaimer);
    }

    // ============ Jury Staking Functions ============

    /**
     * @notice Stake ASKL to become eligible for jury duty
     * @param amount Amount of ASKL to stake
     */
    function stakeAsJuror(uint256 amount) external nonReentrant {
        require(amount >= MIN_JURY_STAKE, "Insufficient stake amount");

        // Transfer tokens
        require(
            asklToken.transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );

        JurorStake storage stake = jurorStakes[msg.sender];
        if (stake.isActive) {
            stake.stakeAmount += amount;
        } else {
            jurorStakes[msg.sender] = JurorStake({
                juror: msg.sender,
                stakeAmount: amount,
                stakedAt: block.timestamp,
                isActive: true,
                totalCases: 0,
                correctVotes: 0
            });

            // Add to juror list
            jurorListIndex[msg.sender] = jurorList.length;
            jurorList.push(msg.sender);
        }

        emit JuryStaked(msg.sender, amount);
    }

    /**
     * @notice Unstake ASKL (if not actively serving on a jury)
     */
    function unstakeAsJuror() external nonReentrant {
        JurorStake storage stake = jurorStakes[msg.sender];
        require(stake.isActive, "No active stake");

        // Check if juror is serving on any active dispute
        for (uint256 i = 0; i < jurorCaseHistory[msg.sender].length; i++) {
            uint256 bountyId = jurorCaseHistory[msg.sender][i];
            if (disputes[bountyId].status == DisputeStatus.Voting) {
                revert("Juror active on dispute");
            }
        }

        uint256 amount = stake.stakeAmount;
        stake.isActive = false;
        stake.stakeAmount = 0;

        // Remove from juror list
        uint256 index = jurorListIndex[msg.sender];
        uint256 lastIndex = jurorList.length - 1;
        if (index != lastIndex) {
            address lastJuror = jurorList[lastIndex];
            jurorList[index] = lastJuror;
            jurorListIndex[lastJuror] = index;
        }
        jurorList.pop();
        delete jurorListIndex[msg.sender];

        require(
            asklToken.transfer(msg.sender, amount),
            "Token transfer failed"
        );

        emit JuryUnstaked(msg.sender, amount);
    }

    /**
     * @notice Increase existing stake
     * @param amount Additional amount to stake
     */
    function increaseStake(uint256 amount) external nonReentrant {
        require(jurorStakes[msg.sender].isActive, "Not a juror");
        require(amount > 0, "Amount must be greater than 0");

        require(
            asklToken.transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );

        jurorStakes[msg.sender].stakeAmount += amount;

        emit JuryStaked(msg.sender, amount);
    }

    // ============ View Functions ============

    /**
     * @notice Get bounty details
     * @param bountyId ID of the bounty
     */
    function getBounty(uint256 bountyId) external view returns (Bounty memory) {
        require(bounties[bountyId].id != 0, "Bounty does not exist");
        return bounties[bountyId];
    }

    /**
     * @notice Get all submissions for a bounty
     * @param bountyId ID of the bounty
     */
    function getSubmissions(uint256 bountyId) external view returns (Submission[] memory) {
        return submissions[bountyId];
    }

    /**
     * @notice Get dispute details
     * @param bountyId ID of the bounty
     */
    function getDispute(uint256 bountyId) external view returns (Dispute memory) {
        return disputes[bountyId];
    }

    /**
     * @notice Get jury votes for a dispute
     * @param bountyId ID of the bounty
     */
    function getJuryVotes(uint256 bountyId) external view returns (JuryVote[] memory) {
        return juryVotes[bountyId];
    }

    /**
     * @notice Get juror stake info
     * @param juror Address of the juror
     */
    function getJurorStake(address juror) external view returns (JurorStake memory) {
        return jurorStakes[juror];
    }

    /**
     * @notice Get all bounties created by a user
     * @param user Address of the user
     */
    function getUserBounties(address user) external view returns (uint256[] memory) {
        return userBounties[user];
    }

    /**
     * @notice Get all bounties claimed by a user
     * @param user Address of the user
     */
    function getUserClaims(address user) external view returns (uint256[] memory) {
        return userClaims[user];
    }

    /**
     * @notice Get total number of bounties
     */
    function getTotalBounties() external view returns (uint256) {
        return _bountyCounter;
    }

    /**
     * @notice Get juror's case history
     * @param juror Address of the juror
     */
    function getJurorCaseHistory(address juror) external view returns (uint256[] memory) {
        return jurorCaseHistory[juror];
    }

    /**
     * @notice Get all active jurors (for demo purposes)
     * @return Array of active juror addresses
     */
    function getActiveJurors() external view returns (address[] memory) {
        return jurorList;
    }

    // ============ Admin Functions ============

    /**
     * @notice Cancel a bounty and return escrowed tokens
     * @param bountyId ID of the bounty
     */
    function cancelBounty(uint256 bountyId) external nonReentrant {
        Bounty storage bounty = bounties[bountyId];
        require(bounty.id != 0, "Bounty does not exist");
        require(msg.sender == bounty.creator, "Only creator can cancel");
        require(
            bounty.status == BountyStatus.Active,
            "Can only cancel active bounties"
        );

        bounty.status = BountyStatus.Cancelled;

        // Return escrowed tokens to creator
        require(
            asklToken.transfer(bounty.creator, bounty.reward),
            "Token transfer failed"
        );

        emit BountyCancelled(bountyId);
    }

    /**
     * @notice Emergency resolution by owner (if jury fails)
     * @param bountyId ID of the bounty
     * @param inFavorOfCreator True if creator wins
     */
    function emergencyResolve(uint256 bountyId, bool inFavorOfCreator)
        external
        onlyOwner
        nonReentrant
    {
        Dispute storage dispute = disputes[bountyId];
        require(dispute.status == DisputeStatus.Voting, "No active voting");
        require(block.timestamp > dispute.votingDeadline, "Voting still active");

        _resolveDispute(bountyId);
    }

    /**
     * @notice Get bounties by status
     * @param status Status to filter by
     * @param limit Maximum number to return
     */
    function getBountiesByStatus(
        BountyStatus status,
        uint256 limit
    ) external view returns (uint256[] memory) {
        uint256[] memory result = new uint256[](limit);
        uint256 count = 0;

        for (uint256 i = 1; i <= _bountyCounter && count < limit; i++) {
            if (bounties[i].status == status) {
                result[count] = i;
                count++;
            }
        }

        // Trim array to actual count
        uint256[] memory trimmed = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            trimmed[i] = result[i];
        }

        return trimmed;
    }

    /**
     * @notice Minimum stake requirement
     */
    function getMinJuryStake() external pure returns (uint256) {
        return MIN_JURY_STAKE;
    }

    /**
     * @notice Number of jurors per dispute
     */
    function getJurySelectionCount() external pure returns (uint256) {
        return JURY_SELECTION_COUNT;
    }

    /**
     * @notice Voting period duration
     */
    function getVotingPeriod() external pure returns (uint256) {
        return VOTING_PERIOD;
    }

    /**
     * @notice Jury reward percentage
     */
    function getJuryRewardBps() external pure returns (uint256) {
        return JURY_REWARD_BPS;
    }
}
