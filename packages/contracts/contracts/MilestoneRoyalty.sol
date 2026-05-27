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
    }
}