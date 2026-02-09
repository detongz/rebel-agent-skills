// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AgentBountyHub
 * @notice On-chain bounty system for Agent Skill development
 * @dev Implements escrow, verification, and dispute resolution on-chain
 */
contract AgentBountyHub is Ownable, ReentrancyGuard {
    IERC20 public immutable asklToken;

    uint256 private _bountyCounter;

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
        Raised,
        Resolved
    }

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
    }

    // Mappings
    mapping(uint256 => Bounty) public bounties;
    mapping(uint256 => Submission[]) public submissions;
    mapping(uint256 => Dispute) public disputes;
    mapping(address => uint256[]) public userBounties;
    mapping(address => uint256[]) public userClaims;

    // Events
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

    event DisputeResolved(
        uint256 indexed bountyId,
        bool inFavorOfCreator
    );

    event BountyCancelled(uint256 indexed bountyId);

    constructor(address _asklToken) Ownable(msg.sender) {
        asklToken = IERC20(_asklToken);
        _bountyCounter = 0;
    }

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

        disputes[bountyId] = Dispute({
            bountyId: bountyId,
            raiser: msg.sender,
            reason: reason,
            raisedAt: block.timestamp,
            status: DisputeStatus.Raised,
            resolutionTimestamp: 0,
            resolvedInFavorOfCreator: false
        });

        emit DisputeRaised(bountyId, msg.sender, reason);
    }

    /**
     * @notice Resolve a dispute (only contract owner)
     * @param bountyId ID of the bounty
     * @param inFavorOfCreator True if creator wins, false if claimer wins
     */
    function resolveDispute(
        uint256 bountyId,
        bool inFavorOfCreator
    ) external onlyOwner nonReentrant {
        Bounty storage bounty = bounties[bountyId];
        require(bounty.id != 0, "Bounty does not exist");
        require(bounty.status == BountyStatus.Disputed, "No dispute to resolve");
        require(disputes[bountyId].status == DisputeStatus.Raised, "Dispute not active");

        Dispute storage dispute = disputes[bountyId];
        dispute.status = DisputeStatus.Resolved;
        dispute.resolvedInFavorOfCreator = inFavorOfCreator;
        dispute.resolutionTimestamp = block.timestamp;

        if (inFavorOfCreator) {
            // Return funds to creator
            bounty.status = BountyStatus.Cancelled;
            require(
                asklToken.transfer(bounty.creator, bounty.reward),
                "Token transfer failed"
            );
        } else {
            // Release funds to claimer
            bounty.status = BountyStatus.Completed;
            bounty.completedAt = block.timestamp;
            require(
                asklToken.transfer(bounty.claimer, bounty.reward),
                "Token transfer failed"
            );
        }

        emit DisputeResolved(bountyId, inFavorOfCreator);
    }

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
}