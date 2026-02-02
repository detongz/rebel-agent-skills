// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

/**
 * @title AgentSkill Token ($ASKL)
 * @notice 跨平台 Agent Skill 打赏与激励协议代币
 * @dev 部署在 Monad Testnet，支持打赏自动销毁 2% 机制
 */
contract ASKLToken is ERC20, ERC20Burnable, Ownable {
    // ============ 错误定义 ============
    error InvalidAmount();
    error InvalidCreatorAddress();
    error ZeroAddress();
    error InsufficientBalance();
    error InvalidRewardPercentage();

    // ============ 状态变量 ============
    /// @notice 平台手续费地址（用于 2% 销毁或金库）
    address public platformWallet;

    /// @notice 创作者奖励比例（基点，默认 9800 = 98%）
    uint256 public creatorRewardBps;

    /// @notice 最大铸造量（10亿代币）
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;

    /// @notice 创作者 Skill 注册表（skillId => creatorAddress）
    mapping(bytes32 => address) public skillCreators;

    /// @notice 创作者累计收益（creator => totalEarned）
    mapping(address => uint256) public creatorEarnings;

    /// @notice 总打赏量
    uint256 public totalTipped;

    /// @notice 总销毁量
    uint256 public totalBurned;

    // ============ 事件 ============
    event SkillRegistered(bytes32 indexed skillId, address indexed creator, string skillName);
    event Tipped(
        bytes32 indexed skillId,
        address indexed tipper,
        address indexed creator,
        uint256 amount,
        uint256 creatorReward,
        uint256 platformFee
    );
    event CreatorRewardBpsUpdated(uint256 oldBps, uint256 newBps);
    event PlatformWalletUpdated(address oldWallet, address newWallet);

    // ============ 修饰器 ============
    modifier validAmount(uint256 amount) {
        if (amount == 0) revert InvalidAmount();
        _;
    }

    // ============ 构造函数 ============
    /**
     * @notice 初始化代币合约
     * @param _platformWallet 平台手续费接收地址
     */
    constructor(address _platformWallet) ERC20("AgentSkill", "ASKL") Ownable(msg.sender) {
        if (_platformWallet == address(0)) revert ZeroAddress();
        platformWallet = _platformWallet;
        creatorRewardBps = 9800; // 默认 98% 给创作者

        // 初始铸造：给部署者（用于后续分配）
        _mint(msg.sender, MAX_SUPPLY);
    }

    // ============ 核心功能：注册 Skill ============
    /**
     * @notice 注册一个新的 Agent Skill
     * @param skillId Skill 唯一标识符（keccak256(name + version + platform)）
     * @param skillName Skill 显示名称
     * @param creator 创作者地址（如果为 address(0) 则使用 msg.sender）
     */
    function registerSkill(
        bytes32 skillId,
        string calldata skillName,
        address creator
    ) external {
        if (creator == address(0)) {
            creator = msg.sender;
        }

        // 检查是否已注册
        require(skillCreators[skillId] == address(0), "Skill already registered");

        skillCreators[skillId] = creator;

        emit SkillRegistered(skillId, creator, skillName);
    }

    /**
     * @notice 批量注册 Skills
     * @param skillIds Skill ID 数组
     * @param skillNames Skill 名称数组
     * @param creators 创作者地址数组（全 0 则使用 msg.sender）
     */
    function registerSkillsBatch(
        bytes32[] calldata skillIds,
        string[] calldata skillNames,
        address[] calldata creators
    ) external {
        require(skillIds.length == skillNames.length && skillIds.length == creators.length, "Length mismatch");

        for (uint256 i = 0; i < skillIds.length; i++) {
            bytes32 skillId = skillIds[i];
            address creator = creators[i];

            if (creator == address(0)) {
                creator = msg.sender;
            }

            require(skillCreators[skillId] == address(0), "Skill already registered");
            skillCreators[skillId] = creator;

            emit SkillRegistered(skillId, creator, skillNames[i]);
        }
    }

    // ============ 核心功能：打赏 ============
    /**
     * @notice 打赏指定 Skill 的创作者（自动分账）
     * @param skillId Skill ID
     * @param amount 打赏金额
     * @dev 自动分配：98% 给创作者，2% 销毁
     */
    function tipSkill(bytes32 skillId, uint256 amount)
        external
        validAmount(amount)
    {
        address creator = skillCreators[skillId];
        if (creator == address(0)) revert InvalidCreatorAddress();

        // 检查余额
        if (balanceOf(msg.sender) < amount) revert InsufficientBalance();

        // 计算分配
        uint256 creatorReward = (amount * creatorRewardBps) / 10000;
        uint256 platformFee = amount - creatorReward;

        // 转账给创作者
        _transfer(msg.sender, creator, creatorReward);

        // 平台费用（销毁或转入金库）
        if (platformFee > 0) {
            _transfer(msg.sender, platformWallet, platformFee);
            // 可选：直接销毁
            // _burn(msg.sender, platformFee);
        }

        // 更新统计
        creatorEarnings[creator] += creatorReward;
        totalTipped += amount;
        totalBurned += platformFee;

        emit Tipped(skillId, msg.sender, creator, amount, creatorReward, platformFee);
    }

    /**
     * @notice 批量打赏多个 Skills
     * @param skillIds Skill ID 数组
     * @param amounts 每个 Skill 的打赏金额
     */
    function tipSkillsBatch(
        bytes32[] calldata skillIds,
        uint256[] calldata amounts
    ) external {
        require(skillIds.length == amounts.length, "Length mismatch");

        for (uint256 i = 0; i < skillIds.length; i++) {
            if (amounts[i] > 0) {
                tipSkill(skillIds[i], amounts[i]);
            }
        }
    }

    /**
     * @notice 直接打赏创作者（不通过 Skill ID）
     * @param creator 创作者地址
     * @param amount 打赏金额
     */
    function tipCreatorDirect(address creator, uint256 amount)
        external
        validAmount(amount)
    {
        if (creator == address(0)) revert ZeroAddress();
        if (balanceOf(msg.sender) < amount) revert InsufficientBalance();

        uint256 creatorReward = (amount * creatorRewardBps) / 10000;
        uint256 platformFee = amount - creatorReward;

        _transfer(msg.sender, creator, creatorReward);

        if (platformFee > 0) {
            _transfer(msg.sender, platformWallet, platformFee);
        }

        creatorEarnings[creator] += creatorReward;
        totalTipped += amount;
        totalBurned += platformFee;

        emit Tipped(bytes32(0), msg.sender, creator, amount, creatorReward, platformFee);
    }

    // ============ 查询功能 ============
    /**
     * @notice 获取 Skill 创作者地址
     */
    function getSkillCreator(bytes32 skillId) external view returns (address) {
        return skillCreators[skillId];
    }

    /**
     * @notice 获取创作者累计收益
     */
    function getCreatorEarnings(address creator) external view returns (uint256) {
        return creatorEarnings[creator];
    }

    /**
     * @notice 计算打赏时创作者实际收到的金额
     */
    function calculateTipAmount(uint256 amount) external view returns (uint256 creatorReward, uint256 platformFee) {
        creatorReward = (amount * creatorRewardBps) / 10000;
        platformFee = amount - creatorReward;
    }

    /**
     * @notice 获取平台统计信息
     */
    function getPlatformStats()
        external
        view
        returns (
            uint256 _totalSupply,
            uint256 _totalTipped,
            uint256 _totalBurned,
            uint256 _creatorRewardBps
        )
    {
        return (totalSupply(), totalTipped, totalBurned, creatorRewardBps);
    }

    // ============ 管理员功能 ============
    /**
     * @notice 设置创作者奖励比例
     * @param newBps 新比例（基点，0-10000）
     */
    function setCreatorRewardBps(uint256 newBps) external onlyOwner {
        if (newBps > 10000) revert InvalidRewardPercentage();
        uint256 oldBps = creatorRewardBps;
        creatorRewardBps = newBps;
        emit CreatorRewardBpsUpdated(oldBps, newBps);
    }

    /**
     * @notice 设置平台手续费地址
     */
    function setPlatformWallet(address newWallet) external onlyOwner {
        if (newWallet == address(0)) revert ZeroAddress();
        address oldWallet = platformWallet;
        platformWallet = newWallet;
        emit PlatformWalletUpdated(oldWallet, newWallet);
    }

    /**
     * @notice 紧急暂停（未来可扩展 Pausable）
     */
    // function pause() external onlyOwner { }
    // function unpause() external onlyOwner { }
}
