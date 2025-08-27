// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Marketplace {
    struct Item {
        string name;
        uint256 price;
        address seller;
        bool sold;
    }
    Item[] public items;
    event ItemListed(uint256 id, string name, uint256 price);
    event ItemSold(uint256 id, address buyer);

    function listItem(string memory name, uint256 price) public {
        items.push(Item(name, price, msg.sender, false));
        emit ItemListed(items.length - 1, name, price);
    }

    function buyItem(uint256 id) public payable {
        require(id < items.length, "Invalid item");
        Item storage item = items[id];
        require(!item.sold, "Already sold");
        require(msg.value == item.price, "Incorrect price");
        item.sold = true;
        payable(item.seller).transfer(msg.value);
        emit ItemSold(id, msg.sender);
    }
}
