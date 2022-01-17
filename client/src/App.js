import React, { Component } from "react";
import MyToken from "./contracts/MyToken.json";
import MyTokenSale from "./contracts/MyTokenSale.json";
import KYCcontract from "./contracts/KycContract.json";
import getWeb3 from "./getWeb3";
import "./App.css";

class App extends Component {
  state = { loaded: false, kycAddress: "",tokenAmmount:'0',walletAddress:"",holdingAmmount:"",WL_A:"",totalSupply:""};

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();

      this.tokenInstance = new this.web3.eth.Contract(
        MyToken.abi,
        MyToken.networks[this.networkId] && MyToken.networks[this.networkId].address,
      );
      this.tokenSaleInstance = new this.web3.eth.Contract(
        MyTokenSale.abi,
        MyTokenSale.networks[this.networkId] && MyTokenSale.networks[this.networkId].address,
      );
      this.KYCInstance = new this.web3.eth.Contract(
        KYCcontract.abi,
        KYCcontract.networks[this.networkId] && KYCcontract.networks[this.networkId].address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.listenToTokenTransfer();
      this.setState({loaded: true});

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  connectToMetaMask = async() =>{
    let ethereum = window['ethereum'];
    if (typeof ethereum !== 'undefined') {
      console.log('MetaMask is installed!');
    }
    if (ethereum) {
      this.web3Provider = ethereum;
      try {
        // Request account access
        let address = await ethereum.request({ method: 'eth_requestAccounts' });
        this.setState({
          walletAddress : address[0],
        });
        this.UpdateUserInfo();
        console.log("Account connected: ", this.state.walletAddress); // Account address that you had imported
      } catch (error) {
        // User denied account access...
        console.error("User denied account access");
      }
    }
  }

  handleKYCWhitelisting = async() => {
    await this.KYCInstance.methods.setKYCCompleted(this.state.kycAddress,10).send({from: this.state.walletAddress});
    alert("KYC for "+this.state.kycAddress + " is completed")
    this.setState({kycAddress: ""})
  }

  handlePaymentOfTokens = async() =>{
    let rate = await this.tokenSaleInstance.methods.rate().call({from: this.state.walletAddress});
    let ammount =(Number(this.state.tokenAmmount) * rate);
    let _addr = this.tokenSaleInstance._address;

    await this.web3.eth.sendTransaction({from: this.state.walletAddress,to: _addr,value: ammount});
    alert(this.state.tokenAmmount + " WAIFU TOKENS has been bought");
  }

  UpdateUserInfo = async() =>{
    let _addr = this.tokenSaleInstance._address;
    let wallet_ammt = await this.tokenInstance.methods.balanceOf(this.state.walletAddress).call({from:this.state.walletAddress});
    let WL_Ammt = await this.KYCInstance.methods.checkWhiteListAmmount(this.state.walletAddress).call({from:this.state.walletAddress});
    let Supply = await this.tokenInstance.methods.balanceOf(_addr).call({from:this.state.walletAddress});

    this.setState({
      holdingAmmount:wallet_ammt ,
      WL_A: WL_Ammt,
      totalSupply: Supply
    });
  }

  handleInputChange = (event)  =>{
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name] : value
    });
  }

  listenToTokenTransfer = () =>{
    this.tokenInstance.events.Transfer({to: this.accounts[0]}).on("data",this.UpdateUserInfo);
  }

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <main className="App">
        <h1>WAIFU TOKEN SALE!</h1>
        <button type = "button" onClick ={this.connectToMetaMask}>connect Wallet</button> 
        <hr></hr>
        <table>
          <thead>
              <tr>
                  <th colSpan= "2">{this.state.walletAddress}</th>
              </tr>
          </thead>
          <tbody>
              <tr>
                  <th scope= "row">Your Balance</th>
                  <td>{this.state.holdingAmmount}</td>
              </tr>
              <tr>
                  <th scope= "row">WhiteListed ammount</th>
                  <td>{this.state.WL_A}</td>
              </tr>
              <tr>
                  <th scope= "row">Available Supply</th>
                  <td>{this.state.totalSupply}</td>
              </tr>
          </tbody>
        </table>
        <h2>WAIFU WhiteList</h2>
        Address to allow: <input type="text" name="kycAddress" value={this.state.kycAddress} onChange={this.handleInputChange}/>
        <button type = "button" onClick ={this.handleKYCWhitelisting}>Add to Whitelist</button> 
        <h2>BuyTokens</h2>
        ammount: <input type="number" name="tokenAmmount" value={this.state.tokenAmmount} min ="1" max="10" onChange={this.handleInputChange}/>
        <button type = "button" onClick ={this.handlePaymentOfTokens}>buyTokens</button> 
      </main>
    );
  }
}

export default App;
