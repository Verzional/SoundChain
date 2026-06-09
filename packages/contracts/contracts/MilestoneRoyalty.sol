// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Antarmuka IERC20 diperbarui untuk mendukung transferFrom (pembayaran subscription)
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);

    function balanceOf(address account) external view returns (uint256);
}

contract MilestoneRoyalty {
    address public owner;
    address public streamOracle;
    IERC20 public usdcToken;

    // ========== System Role & Subscription ==========
    enum Role {
        NONE,
        LISTENER,
        ARTIST
    }
    mapping(address => Role) public userRoles;
    mapping(address => bool) public isSubscribed;

    uint256 public subscriptionFee = 5 * 10 ** 6; //Platform Subscription cost: 5 USDC
    uint256 public payoutPerMilestone = 10 * 10 ** 6;

    struct Song {
        address creator; // save wallet address of the Artist who registered the song, only this address can edit the song details
        string ipfsHash;
        uint256 totalStreams;
        uint256 nextMilestone;
        address[] collaborators;
        uint256[] shares;
        bool isRegistered;
    }

    mapping(string => Song) public songs;

    // ========== Events ==========
    event UserRegistered(address indexed user, Role role);
    event Subscribed(address indexed listener, uint256 amount);
    event SongRegistered(
        string songId,
        address indexed creator,
        address[] collaborators
    );
    event SongEdited(
        string songId,
        string newIpfsHash,
        address[] newCollaborators,
        uint256[] newShares
    );
    event StreamsUpdated(string songId, uint256 newTotal);
    event MilestoneReached(string songId, uint256 milestone);
    event RoyaltyPaid(string songId, address recipient, uint256 amount);

    // ========== Modifiers ==========
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyOracle() {
        require(
            msg.sender == streamOracle,
            "Only oracle can perform this action"
        );
        _;
    }

    modifier onlyArtist() {
        require(
            userRoles[msg.sender] == Role.ARTIST,
            "Only Artist can perform this action"
        );
        _;
    }

    modifier onlySongCreator(string memory songId) {
        require(
            songs[songId].creator == msg.sender,
            "Only the song creator can perform this action"
        );
        _;
    }

    // ========== Constructor ==========
    constructor(address _oracle, address _usdcToken) {
        owner = msg.sender;
        streamOracle = _oracle;
        usdcToken = IERC20(_usdcToken);
    }

    // ========== Fungsi Registrasi & Subscription ==========

    // Mendaftarkan dompet sebagai Artist atau Listener
    function registerAccount(address user, Role _role) public {
        require(userRoles[user] == Role.NONE, "Akun sudah terdaftar");
        require(_role == Role.LISTENER || _role == Role.ARTIST, "Invalid role");

        // Allow direct calling OR Oracle proxying
        require(
            msg.sender == user || msg.sender == streamOracle,
            "Not authorized"
        );

        userRoles[user] = _role;
        emit UserRegistered(user, _role);
    }

    // Listener membayar biaya langganan ke platform (owner)
    function subscribePlatform() public {
        require(
            userRoles[msg.sender] == Role.LISTENER,
            "Only Listener can subscribe"
        );
        require(!isSubscribed[msg.sender], "Already subscribed");

        // Memindahkan USDC dari dompet Listener ke dompet Owner Platform
        require(
            usdcToken.transferFrom(msg.sender, owner, subscriptionFee),
            "Subscription payment failed"
        );

        isSubscribed[msg.sender] = true;
        emit Subscribed(msg.sender, subscriptionFee);
    }

    function setSubscriptionFee(uint256 _newFee) public onlyOwner {
        subscriptionFee = _newFee;
    }

    // ========== Fungsi Interaksi Lagu ==========

    // Hanya Artist yang bisa mengunggah musik
    function registerSong(
        address creator,
        string memory songId,
        string memory ipfsHash,
        address[] memory collaborators,
        uint256[] memory shares
    ) public {
        require(
            msg.sender == creator || msg.sender == streamOracle,
            "Not authorized"
        );
        require(userRoles[creator] == Role.ARTIST, "Creator must be an Artist");
        require(!songs[songId].isRegistered, "Song already registered");
        require(collaborators.length == shares.length, "Invalid data");

        uint256 totalShare = 0;
        for (uint i = 0; i < shares.length; i++) {
            totalShare += shares[i];
        }
        require(totalShare == 100, "Total percentage must be 100");

        songs[songId] = Song({
            creator: creator,
            ipfsHash: ipfsHash,
            totalStreams: 0,
            nextMilestone: 1000,
            collaborators: collaborators,
            shares: shares,
            isRegistered: true
        });

        emit SongRegistered(songId, creator, collaborators);
    }

    // Mengedit data lagu yang sudah ada
    function editSong(
        string memory songId,
        string memory newIpfsHash,
        address[] memory newCollaborators,
        uint256[] memory newShares
    ) public {
        require(songs[songId].isRegistered, "Song not found");
        require(
            msg.sender == songs[songId].creator || msg.sender == streamOracle,
            "Not authorized"
        );
        require(newCollaborators.length == newShares.length, "Invalid data");

        uint256 totalShare = 0;
        for (uint i = 0; i < newShares.length; i++) {
            totalShare += newShares[i];
        }
        require(totalShare == 100, "Total percentage must be 100");

        songs[songId].ipfsHash = newIpfsHash;
        songs[songId].collaborators = newCollaborators;
        songs[songId].shares = newShares;

        emit SongEdited(songId, newIpfsHash, newCollaborators, newShares);
    }

    function updateStreamCount(
        string memory songId,
        uint256 newTotalStreams
    ) public onlyOracle {
        require(songs[songId].isRegistered, "Song not found");
        require(
            newTotalStreams > songs[songId].totalStreams,
            "Stream count must increase"
        );

        songs[songId].totalStreams = newTotalStreams;
        emit StreamsUpdated(songId, newTotalStreams);

        while (songs[songId].totalStreams >= songs[songId].nextMilestone) {
            _triggerPayout(songId);
        }
    }

    function _triggerPayout(string memory songId) internal {
        Song storage song = songs[songId];
        emit MilestoneReached(songId, song.nextMilestone);

        for (uint i = 0; i < song.collaborators.length; i++) {
            uint256 payment = (payoutPerMilestone * song.shares[i]) / 100;
            require(
                usdcToken.transfer(song.collaborators[i], payment),
                "Transfer failed"
            );
            emit RoyaltyPaid(songId, song.collaborators[i], payment);
        }

        song.nextMilestone += 1000;
    }

    function setOracle(address _oracle) public onlyOwner {
        streamOracle = _oracle;
    }

    function getSongDetails(
        string memory songId
    ) public view returns (address, string memory, uint256, uint256) {
        require(songs[songId].isRegistered, "Song not found");
        return (
            songs[songId].creator,
            songs[songId].ipfsHash,
            songs[songId].totalStreams,
            songs[songId].nextMilestone
        );
    }
}
