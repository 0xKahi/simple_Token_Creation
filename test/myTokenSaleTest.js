const tokenSale = artifacts.require("MyTokenSale.sol");
const Token = artifacts.require("MyToken.sol");
const KycContract = artifacts.require("KycContract.sol");

const chai = require("./setupchai.js");
const BN = web3.utils.BN;
const expect = chai.expect;

require('dotenv').config({path: '../.env'});

contract("tokenSale test",async(accounts)=>{
    const[deployerAccount,recipient,anotherAccount] = accounts;

    it ("all tokens should be in tokenSale contract",async()=>{
        let tokenInstance = await Token.deployed();
        let instance = await tokenSale.deployed();
        let totalSupply = await tokenInstance.totalSupply();
        expect(await tokenInstance.balanceOf(instance.address)).to.be.a.bignumber.equal(totalSupply);
        expect(await tokenInstance.balanceOf(deployerAccount)).to.be.a.bignumber.equal(new BN(0));
    })

    it ("should be able to buy tokens from the smart contract", async()=>{
        let etherSpent = web3.utils.toWei("2","ether");
        let tokensRecived = etherSpent/process.env.INITAL_RATE;
        console.log(process.env.INITAL_RATE);
        let tokenInstance = await Token.deployed();
        let kycInstance = await KycContract.deployed();
        let instance = await tokenSale.deployed();

        let balanceBefore = await tokenInstance.balanceOf(recipient);
        await kycInstance.setKYCCompleted(recipient,process.env.INITAL_WHITELIST_AMMOUNT);
        let result = await instance.sendTransaction({from: recipient,value: etherSpent });
        
        expect(await result.logs[0].args.amount).to.be.a.bignumber.equal(new BN(tokensRecived));
        expect(await tokenInstance.balanceOf(recipient)).to.be.a.bignumber.equal(new BN(balanceBefore + tokensRecived));
    })
    
    it("only Owner should be able to set and revoke KYC",async()=> {
        let kycInstance = await KycContract.deployed();

        await expect(kycInstance.setKYCCompleted(recipient,process.env.INITAL_WHITELIST_AMMOUNT,{from: anotherAccount})).to.eventually.be.rejected;
        await expect(kycInstance.setKYCRevoked(recipient,{from: anotherAccount})).to.eventually.be.rejected;
    })

    it("should not be able to buy tokens due to no kyc", async()=>{
        let kycInstance = await KycContract.deployed();
        let instance = await tokenSale.deployed();

        await kycInstance.setKYCRevoked(recipient);
        expect(await kycInstance.CheckKYC(recipient)).equal(false);
        await expect(instance.sendTransaction({from: recipient, value: web3.utils.toWei("2","ether")})).to.eventually.be.rejected;
    })

    it ("should not be able to buy more than whiteListed ammount", async()=>{
        let weiSpent = (process.env.INITAL_WHITELIST_AMMOUNT * process.env.INITAL_RATE) + (1*process.env.INITAL_RATE);

        let tokenInstance = await Token.deployed();
        let kycInstance = await KycContract.deployed();
        let instance = await tokenSale.deployed();

        let result = await kycInstance.setKYCCompleted(recipient,process.env.INITAL_WHITELIST_AMMOUNT);
        await expect(instance.sendTransaction({from: recipient,value: weiSpent })).to.eventually.be.rejected;
    })

    it("WhiteList ammount will change after transaction",async()=>{
        let weiSpent = (process.env.INITAL_WHITELIST_AMMOUNT * process.env.INITAL_RATE) - (1*process.env.INITAL_RATE);
        let ammountBought = weiSpent / process.env.INITAL_RATE;
        let kycInstance = await KycContract.deployed();
        let instance = await tokenSale.deployed();

        await kycInstance.setKYCCompleted(recipient,process.env.INITAL_WHITELIST_AMMOUNT);
        let initalBalance = await kycInstance.checkWhiteListAmmount(recipient);

        result = await instance.sendTransaction({from: recipient,value: weiSpent });
        console.log(result);
        expect(await kycInstance.checkWhiteListAmmount(recipient)).to.be.a.bignumber.equal(new BN(initalBalance - ammountBought));
    })
});