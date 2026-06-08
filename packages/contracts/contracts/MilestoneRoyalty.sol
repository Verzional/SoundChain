// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Antarmuka IERC20 diperbarui untuk mendukung transferFrom (pembayaran subscription)
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract MilestoneRoyalty {
    address public owner;
    address public streamOracle;
    IERC20 public usdcToken;

    // ========== Sistem Role & Subscription ==========
    enum Role { NONE, LISTENER, ARTIST }
    mapping(address => Role) public userRoles;
    mapping(address => bool) public isSubscribed;
    
    uint256 public subscriptionFee = 5 * 10**6; // Biaya langganan platform: 5 USDC
    uint256 public payoutPerMilestone = 10 * 10**6;

    struct Song {
        address creator; // Menyimpan alamat dompet pengunggah untuk fitur Edit
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
    event SongRegistered(string songId, address indexed creator, address[] collaborators);
    event SongEdited(string songId, string newIpfsHash, address[] newCollaborators, uint256[] newShares);
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

    modifier onlyArtist() {
        require(userRoles[msg.sender] == Role.ARTIST, "Hanya Artist yang diizinkan");
        _;
    }

    modifier onlySongCreator(string memory songId) {
        require(songs[songId].creator == msg.sender, "Hanya pembuat lagu yang diizinkan");
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
    function registerAccount(Role _role) public {
        require(userRoles[msg.sender] == Role.NONE, "Akun sudah terdaftar");
        require(_role == Role.LISTENER || _role == Role.ARTIST, "Role tidak valid");
        
        userRoles[msg.sender] = _role;
        emit UserRegistered(msg.sender, _role);
    }

    // Listener membayar biaya langganan ke platform (owner)
    function subscribePlatform() public {
        require(userRoles[msg.sender] == Role.LISTENER, "Hanya Listener yang bisa subscribe");
        require(!isSubscribed[msg.sender], "Sudah berlangganan");

        // Memindahkan USDC dari dompet Listener ke dompet Owner Platform
        require(usdcToken.transferFrom(msg.sender, owner, subscriptionFee), "Pembayaran subscription gagal");
        
        isSubscribed[msg.sender] = true;
        emit Subscribed(msg.sender, subscriptionFee);
    }

    function setSubscriptionFee(uint256 _newFee) public onlyOwner {
        subscriptionFee = _newFee;
    }

    // ========== Fungsi Interaksi Lagu ==========

    // Hanya Artist yang bisa mengunggah musik
    function registerSong(
        string memory songId,
        string memory ipfsHash,
        address[] memory collaborators,
        uint256[] memory shares
    ) public onlyArtist {
        require(!songs[songId].isRegistered, "Lagu sudah terdaftar");
        require(collaborators.length == shares.length, "Data pembagian tidak valid");

        uint256 totalShare = 0;
        for(uint i = 0; i < shares.length; i++) {
            totalShare += shares[i];
        }
        require(totalShare == 100, "Total persentase harus 100");

        songs[songId] = Song({
            creator: msg.sender, // Menandai Artist ini sebagai entitas yang berhak mengedit
            ipfsHash: ipfsHash,
            totalStreams: 0,
            nextMilestone: 1000,
            collaborators: collaborators,
            shares: shares,
            isRegistered: true
        });

        emit SongRegistered(songId, msg.sender, collaborators);
    }

    // Mengedit data lagu yang sudah ada
    function editSong(
        string memory songId,
        string memory newIpfsHash,
        address[] memory newCollaborators,
        uint256[] memory newShares
    ) public onlySongCreator(songId) {
        require(songs[songId].isRegistered, "Lagu tidak ditemukan");
        require(newCollaborators.length == newShares.length, "Data pembagian tidak valid");

        uint256 totalShare = 0;
        for(uint i = 0; i < newShares.length; i++) {
            totalShare += newShares[i];
        }
        require(totalShare == 100, "Total persentase harus 100");

        // Memperbarui properti lagu
        songs[songId].ipfsHash = newIpfsHash;
        songs[songId].collaborators = newCollaborators;
        songs[songId].shares = newShares;

        emit SongEdited(songId, newIpfsHash, newCollaborators, newShares);
    }

    function updateStreamCount(string memory songId, uint256 newTotalStreams) public onlyOracle {
        require(songs[songId].isRegistered, "Lagu tidak ditemukan");
        require(newTotalStreams > songs[songId].totalStreams, "Jumlah stream harus bertambah");

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
            require(usdcToken.transfer(song.collaborators[i], payment), "Transfer gagal");
            emit RoyaltyPaid(songId, song.collaborators[i], payment);
        }

        song.nextMilestone += 1000;
    }

    function setOracle(address _oracle) public onlyOwner {
        streamOracle = _oracle;
    }

    function getSongDetails(string memory songId) public view returns (address, string memory, uint256, uint256) {
        require(songs[songId].isRegistered, "Lagu tidak ditemukan");
        return (songs[songId].creator, songs[songId].ipfsHash, songs[songId].totalStreams, songs[songId].nextMilestone);
    }
}