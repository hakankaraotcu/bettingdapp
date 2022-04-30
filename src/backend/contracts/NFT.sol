// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFT is ERC721URIStorage {
    uint public tokenCount;

    //We make our constructor use inherited constructor from ERC721
    constructor() ERC721("Carsy", "CARSY"){}


    //NFT mint(buy) function
    function mint(string memory _tokenURI) external returns(uint){
        tokenCount++;
        /*
        Call the internal _safeMint function (from ERC721URIStorage) 
        First arguement: address that we are minting for
        Second arguement: ID of new token
        */
        _safeMint(msg.sender, tokenCount);
        //Set token URI Metadata
        _setTokenURI(tokenCount, _tokenURI);
        //Return Token ID
        return(tokenCount);
    }
}