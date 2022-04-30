// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

struct Item{
    uint itemId;
    IERC721 nft;
    uint tokenId;
    uint price;
    address payable seller;
    bool sold;
}

contract Marketplace is ReentrancyGuard{
    
    //state variables
    address payable public immutable feeAccount;
    uint public immutable feePercent;
    uint public itemCount;

    mapping(uint => Item) public items;

    constructor (uint _feePercent){
        feeAccount = payable(msg.sender);
        feePercent = _feePercent;
    }

    event Offered(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller
    );

    event Bought(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller,
        address indexed buyer
    );

    //Calculating Price
    function getTotalPrice(uint _itemId) view public returns(uint){
        return(items[_itemId].price * (100 + feePercent) / 100);
    }

    //Load Items to the market
    function makeItem(IERC721 _nft, uint _tokenId, uint _price) external nonReentrant {
        require(_price > 0, "Price must be greater than 0");

        itemCount++;

        //Transfer NFT
        _nft.transferFrom(msg.sender, address(this), _tokenId);
        
        //Create new item and add it to the items list
        items[itemCount] = Item(
            itemCount,
            _nft,
            _tokenId,
            _price,
            payable(msg.sender),
            false
        );

        emit Offered(itemCount, address(_nft), _tokenId, _price, msg.sender);
    }

    //Purchase Items from market
    function purchaseItem(uint _itemId) external payable nonReentrant{
        uint _totalPrice = getTotalPrice(_itemId);
        Item storage item = items[_itemId];
        require(_itemId > 0 && _itemId <= itemCount,"Item does not exist");
        require(msg.value >= _totalPrice, "Not enough ethereum to cover item price and market fee");
        require(!item.sold,"Item is already sold");

        //Pay seller and feeAccount
        item.seller.transfer(item.price);
        feeAccount.transfer(_totalPrice - item.price);

        //Update item to sold
        item.sold = true;

        //Transfer NFT to buyer
        item.nft.transferFrom(address(this), msg.sender, item.tokenId); 

        emit Bought(_itemId, address(item.nft), item.tokenId, item.price, item.seller, msg.sender);
    }
}