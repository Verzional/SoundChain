<<<<<<< Updated upstream
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MilestoneRoyalty {
    address public artist;
    uint256 public totalStreams;
    uint256 public totalPayout;

    event RoyaltyPaid(address indexed artist, uint256 amount, uint256 milestoneStreams);

    constructor(address _artist) {
        artist = _artist;
    }

    // Task B will call this to report streams and release funds safely
    function claimMilestonePayout(uint256 _currentStreams) external {
        // TODO: Implement the 3 positive & 3 negative test criteria here
        totalStreams = _currentStreams;
=======
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Minimal ERC20 interface for USDC transfers
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract MilestoneRoyalty {
    address public owner;
    address public streamOracle;
    IERC20 public usdcToken;

    struct Song {
        string ipfsHash;
        uint256 totalStreams;
        uint256 nextMilestone;
        address[] collaborators;
        uint256[] shares; // Scale of 100 (e.g., 60 = 60%)
        bool isRegistered;
    }

    mapping(string => Song) public songs;
    uint256 public payoutPerMilestone = 10 * 10**6; // Assumes 10 USDC (6 decimals)

    // ========== Events ==========
    event SongRegistered(string songId, address[] collaborators);
    event StreamsUpdated(string songId, uint256 newTotal);
    event MilestoneReached(string songId, uint256 milestone);
    event RoyaltyPaid(string songId, address recipient, uint256 amount);

    // ========== Modifiers ==========
    modifier onlyOwner() {
        require(msg.sender == owner, "Hanya owner yang diizinkan");
        _;
    }

    modifier onlyOracle() {
        require(msg.sender == streamOracle, "Hanya oracle yang diizinkan");
        _;
    }

    // ========== Constructor ==========
    constructor(address _oracle, address _usdcToken) {
        owner = msg.sender;
        streamOracle = _oracle;
        usdcToken = IERC20(_usdcToken);
    }

    // ========== Functions ==========
    function registerSong(
        string memory songId,
        string memory ipfsHash,
        address[] memory collaborators,
        uint256[] memory shares
    ) public {
        require(!songs[songId].isRegistered, "Lagu sudah terdaftar");
        require(collaborators.length == shares.length, "Data pembagian tidak valid");

        uint256 totalShare = 0;
        for(uint i = 0; i < shares.length; i++) {
            totalShare += shares[i];
        }
        require(totalShare == 100, "Total persentase harus 100");

        songs[songId] = Song({
            ipfsHash: ipfsHash,
            totalStreams: 0,
            nextMilestone: 1000,
            collaborators: collaborators,
            shares: shares,
            isRegistered: true
        });

        emit SongRegistered(songId, collaborators);
    }

    function updateStreamCount(string memory songId, uint256 newTotalStreams) public onlyOracle {
        require(songs[songId].isRegistered, "Lagu tidak ditemukan");
        require(newTotalStreams > songs[songId].totalStreams, "Jumlah stream harus bertambah");

        songs[songId].totalStreams = newTotalStreams;
        emit StreamsUpdated(songId, newTotalStreams);

        // Uses a while-loop in case streams jump multiple milestones at once
        while (songs[songId].totalStreams >= songs[songId].nextMilestone) {
            _triggerPayout(songId);
        }
    }

    function _triggerPayout(string memory songId) internal {
        Song storage song = songs[songId];
        emit MilestoneReached(songId, song.nextMilestone);

        for (uint i = 0; i < song.collaborators.length; i++) {
            uint256 payment = (payoutPerMilestone * song.shares[i]) / 100;
            // Transfer USDC token
            require(usdcToken.transfer(song.collaborators[i], payment), "Transfer gagal");
            emit RoyaltyPaid(songId, song.collaborators[i], payment);
        }

        song.nextMilestone += 1000; // Set milestone target selanjutnya
    }

    function setOracle(address _oracle) public onlyOwner {
        streamOracle = _oracle;
    }

    function getSongDetails(string memory songId) public view returns (string memory, uint256, uint256) {
        require(songs[songId].isRegistered, "Lagu tidak ditemukan");
        return (songs[songId].ipfsHash, songs[songId].totalStreams, songs[songId].nextMilestone);
>>>>>>> Stashed changes
    }
}