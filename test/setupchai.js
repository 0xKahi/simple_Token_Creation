"use strict";
var chai = require("chai");
const BN = web3.utils.BN;
const chaiBN = require("chai-bn")(BN);

var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.use(chaiBN);


module.exports = chai;