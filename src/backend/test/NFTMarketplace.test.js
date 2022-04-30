const { expect } = require("chai");

const toWei = ( num ) => ethers.utils.parseEther(num.toString());
const fromWei = ( num ) => ethers.utils.formatEther(num);

describe("NFTMarketplace", function(){
    let deployer, addr1, addr2;
    let nft, marketplace;
    
    let feePercent = 1;
    let URI = "A Sample URI Data for Testing NFT";
    
    beforeEach(async function(){
        //Get contract factories 
        const NFT = await ethers.getContractFactory("NFT");
        const Marketplace = await ethers.getContractFactory("Marketplace");
    
        //Get signers
        [deployer, addr1, addr2] = await ethers.getSigners();
    
        //Deploy contracts
        nft = await NFT.deploy();
        marketplace = await Marketplace.deploy(feePercent); //feePercent = 1
    });
    
    describe("Deployment", function(){
        it("Should track name and symbol of the NFT collection", async function(){
            expect(await nft.name()).to.equal("Carsy");
            expect(await nft.symbol()).to.equal("CARSY");
        });
        it("Should track feeAccount and feePercent of the Marketplace", async function(){
            expect(await marketplace.feeAccount()).to.equal(deployer.address);
            expect(await marketplace.feePercent()).to.equal(feePercent);
        });
    });

    describe("NFT Minting", function(){
        it("Should track each minted NFT", async function(){
            //addr1 mints an NFT
            await nft.connect(addr1).mint(URI);
            expect(await nft.tokenCount()).to.equal(1);
            expect(await nft.balanceOf(addr1.address)).to.equal(1);
            expect(await nft.tokenURI(1)).to.equal(URI);
            //addr2 mints an NFT
            await nft.connect(addr2).mint(URI);
            expect(await nft.tokenCount()).to.equal(2);
            expect(await nft.balanceOf(addr2.address)).to.equal(1);
            expect(await nft.tokenURI(2)).to.equal(URI);
        });
    });

    describe("Making Marketplace Items", async function(){
        beforeEach(async function(){
            //addr1 mints an NFT
            await nft.connect(addr1).mint(URI);
            //addr1 approves Marketplace to spend NFT
            await nft.connect(addr1).setApprovalForAll(marketplace.address, true);
        });
        it("Should crack newly created item, transfer NFT from seller to marketplace and emit Offered event", async function(){
            //addr1 offers their nft at an ETH price
            await expect(marketplace.connect(addr1).makeItem(nft.address, 1, toWei(1)))
                .to.emit(marketplace, "Offered")
                .withArgs(1, nft.address, 1, toWei(1), addr1.address);

            //Owner of NFT should now be the marketplace
            expect(await nft.ownerOf(1)).to.equal(marketplace.address);
            //Item count should now equal 1
            expect(await marketplace.itemCount()).to.equal(1);
            //Get item from items list and check fields to sure they are correct
            const item = await marketplace.items(1);

            expect(item.itemId).to.equal(1);
            expect(item.nft).to.equal(nft.address);
            expect(item.tokenId).to.equal(1);
            expect(item.price).to.equal(toWei(1));
            expect(item.sold).to.equal(false);
        });
        it("Should fail if price is set to zero", async function(){
            await expect(marketplace.connect(addr1).makeItem(nft.address, 1, 0))
            .to.be.revertedWith("Price must be greater than 0")
        });
    });

    describe("Purchasing Marketplace Items", async function() {
        let price = 2;
        let totalPriceInWei;
        beforeEach(async function(){
            //addr1 mints an NFT
            await nft.connect(addr1).mint(URI);
            //addr1 approves Marketplace to spend NFT
            await nft.connect(addr1).setApprovalForAll(marketplace.address, true);
            //addr1 makes their NFT a Marketplace item
            await marketplace.connect(addr1).makeItem(nft.address, 1, toWei(price));
        });
        it("Should update item sold, pay seller, transfer NFT to buyer, charge fees and emit a Bought event", async function(){
            const sellerInitialEthereumBalance = await addr1.getBalance();
            const feeAccountInitialEthereumBalance = await deployer.getBalance();

            totalPriceInWei = await marketplace.getTotalPrice(1);

            //addr2 purchases item
            await expect(marketplace.connect(addr2).purchaseItem(1, { value: totalPriceInWei }))
                .to.emit(marketplace, "Bought")
                .withArgs(1, nft.address, 1, toWei(price), addr1.address, addr2.address);
            
            const sellerFinalEthereumBalance = await addr1.getBalance();
            const feeAccountFinalEthereumBalance = await deployer.getBalance();
            //Seller should receive payment for the price of the NFT sold.
            expect(+fromWei(sellerFinalEthereumBalance)).to.equal(+price + +fromWei(sellerInitialEthereumBalance));
            //Calculate fee
            const fee = (feePercent / 100) * price;
            //feeAccount should receive fee
            expect(+fromWei(feeAccountFinalEthereumBalance)).to.equal(+fee + +fromWei(feeAccountInitialEthereumBalance));
            //The buyer should now own the NFT
            expect(await nft.ownerOf(1)).to.equal(addr2.address);
            //Item should be marked as sold
            expect((await marketplace.items(1)).sold).to.equal(true);
        });
        it("Should fail fort invalid item ids, sold items and when not enough ethereus is paid", async function(){
            //fails for invalid item ids
            await expect(marketplace.connect(addr2).purchaseItem(2, { value: totalPriceInWei }))
                .to.be.revertedWith("Item does not exist")
            await expect(marketplace.connect(addr2).purchaseItem(0, { value: totalPriceInWei }))
                .to.be.revertedWith("Item does not exist")
            //Fails when not enough ether is paid with the transaction
            await expect(marketplace.connect(addr2).purchaseItem(1, { value : price }))
                .to.be.revertedWith("Not enough ethereum to cover item price and market fee");
            //addr2 purchases the item
            await marketplace.connect(addr2).purchaseItem(1, { value: totalPriceInWei });
            //deployer tries purchasing item 1 after it has been sold
            await expect(marketplace.connect(deployer).purchaseItem(1, { value: totalPriceInWei }))
                .to.be.revertedWith("Item is already sold");
        });
    });
});