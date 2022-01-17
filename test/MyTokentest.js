const Token = artifacts.require("MyToken");

const chai = require("./setupchai.js");
const BN = web3.utils.BN;

const expect = chai.expect;

require('dotenv').config({path: '../.env'});

contract("Token Test",async (accounts)=>{

    const [deployerAccount, recipient, anotherAccount] = accounts;

    beforeEach(async()=>{
        this.myToken = await Token.new(process.env.INITAL_TOKEN);
    })

    it("all token should be in my account",async() => {
        let instance = this.myToken;
        //let tokenSaleInst = await MyTokenSale.deployed();
        let totalSupply = await instance.totalSupply();
        //expect(await instance.balanceOf(tokenSaleInst.address)).to.be.a.bignumber.equal(totalSupply);
        expect(await instance.balanceOf(deployerAccount)).to.be.a.bignumber.equal(totalSupply);
    })

    it("is possible to send tokens between accounts", async()=>{
        const sendTokens = 1;
        let instance = this.myToken;
        let totalSupply = await instance.totalSupply();

        await expect(instance.transfer(recipient,sendTokens)).to.eventually.be.fulfilled;
        expect( await instance.balanceOf(recipient)).to.be.a.bignumber.equal(new BN(sendTokens));
        expect( await instance.balanceOf(deployerAccount)).to.be.a.bignumber.equal(totalSupply.sub(new BN(sendTokens)));
    })

    it("is not possible to send more tokens then available",async()=>{
        let instance = this.myToken;
        let balance = await instance.balanceOf(deployerAccount);

        await expect(instance.transfer(recipient,new BN(balance + 1))).to.eventually.be.rejected;
        expect(await instance.balanceOf(deployerAccount)).to.be.bignumber.equal(balance);
        
    })
});