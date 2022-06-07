// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CarToken is ERC721, Ownable{
    //Betting 
    address public _owner_;
    address payable[] public players;
    mapping (uint => Bet) public lotteryHistory;
    uint[] public amounts;
    uint[] public ids;
    uint public lotteryId;
    uint public playerCount;
    //Token
    uint256 tokenCount;
    uint256 fee = 0.01 ether; 

    struct Car{
        uint256 id;
        uint256 vin;    //Vehicle identification number
        string name;
        uint256 enginePower;
        uint256 aerodynamicStability;
        uint256 chasis;
    }
    struct Bet{
        Car car;
        address payable player;
        uint256 betAmount;
    }

    Car[] public cars;

    event NewCar(address indexed owner, uint256 id, uint256 enginePower, uint256 aerodynamicStability, uint256 chasis);

    constructor(string memory _name, string memory _symbol)
        ERC721(_name, _symbol)
    {
        _owner_ = msg.sender;
        lotteryId = 1;
        playerCount = 0;
    }

    //Common functions
    function _createRandomNumber(uint256 _mod) internal view returns(uint256){
        uint256 randomNum = uint256(keccak256(abi.encodePacked(_owner_, block.timestamp)));
        return randomNum % _mod;
    }

    function setFee(uint256 _fee) external onlyOwner() {
        fee = _fee;
    }
    
    //Betting Functions
    function getWinnerByLottery(uint lottery) public view returns(Bet memory bet){
        return lotteryHistory[lottery];
    }

    function getPotBalance() public view returns(uint){
        return address(this).balance;
    }

    function getPlayers() public view returns(address payable[] memory){
        return players;
    }


    function enterWithCar(uint256 _carId, uint256 _betAmount) public payable {
        require(msg.value >= fee, "Not enough ethers");
        playerCount++;
        players.push(payable(msg.sender));
        amounts.push(_betAmount);
        ids.push(_carId);
    }

    function pickWinner() public onlyOwner {
        uint index = _createRandomNumber(10**16) % players.length;
        players[index].transfer(address(this).balance);
        Bet memory bet = Bet(cars[index], players[index], amounts[index]);
        lotteryHistory[lotteryId] = bet;
        lotteryId++;
        //Reset array for next round

        playerCount = 0;
        players = new address payable[](0);
        amounts = new uint[](0);
        ids = new uint[](0);
    }

    function getLotteryCount() public view returns(uint){
        return lotteryId;
    }
 
    //Token Functions
    function withdraw() external payable onlyOwner() {
        address payable _owner = payable(owner());
        _owner.transfer(address(this).balance);
    }

    //Create car
    function _createCar(string memory _name) internal{
        uint256 vin = _createRandomNumber(10**16);
        Car memory car = Car(tokenCount, vin, _name, 1,1,1);
        cars.push(car);
        _safeMint(msg.sender, tokenCount);
        emit NewCar(msg.sender, tokenCount, car.enginePower, car.aerodynamicStability, car.chasis);
        tokenCount++;
    }

    function createRandomCar(string memory _name) public payable {
        require(msg.value >= fee, "Fee is not correct");
        _createCar(_name);
    } 
    
    function getCars() public view returns(Car[] memory){
        return cars;
    }

    function getOwnerCars(address _owner) public view returns(Car[] memory){
        Car[] memory result = new Car[](balanceOf(_owner));
        uint256 counter = 0;
        for(uint256 i=0; i<cars.length; i++){
            if(ownerOf(i) == _owner){
                result[counter] = cars[i];
                counter++;
            }
        }
        return result;
    }

    function upgradeEngine(uint256 _carId) public {
        require(ownerOf(_carId) == msg.sender, "You must own it");
        Car storage car = cars[_carId];
        car.enginePower++;
    }

    function upgradeAerodynamicStablity(uint256 _carId) public {
        require(ownerOf(_carId) == msg.sender, "You must own it");
        Car storage car = cars[_carId];
        car.aerodynamicStability++;
    }

    function upgradeChasis(uint256 _carId) public {
        require(ownerOf(_carId) == msg.sender, "You must own it");
        Car storage car = cars[_carId];
        car.chasis++;
    }

}