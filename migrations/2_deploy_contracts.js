const TokenFarm = artifacts.require("TokenFarm")
const JapToken = artifacts.require("JapToken")
const DaiToken = artifacts.require("DaiToken")

module.exports = async function(deployer, network, accounts) {

  await deployer.deploy(DaiToken)
  const daiToken = await DaiToken.deployed()

  await deployer.deploy(JapToken)
  const japToken = await JapToken.deployed()

  await deployer.deploy(TokenFarm, japToken.address, daiToken.address)
  const tokenFarm = await TokenFarm.deployed()

  await japToken.transfer(tokenFarm.address, "1000000000000000000000000")

  await daiToken.transfer(accounts[1], "100000000000000000000")
};
