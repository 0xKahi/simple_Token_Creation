var MyToken = artifacts.require("MyToken.sol");
var MyTokenSale = artifacts.require("MyTokenSale.sol");
var MyKYCContract = artifacts.require("KycContract.sol");
var BN = web3.utils.BN;
require('dotenv').config({path: '../.env'});

module.exports = async function(deployer){
    let addr = await web3.eth.getAccounts();
    
    await deployer.deploy(MyToken, process.env.INITAL_TOKEN);
    await deployer.deploy(MyKYCContract);
    await deployer.deploy(MyTokenSale,new BN(process.env.INITAL_RATE),addr[0],MyToken.address,MyKYCContract.address);
    
    let instance = await MyToken.deployed();
    await instance.transfer(MyTokenSale.address,process.env.INITAL_TOKEN);
}