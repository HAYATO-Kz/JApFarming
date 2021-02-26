const { assert } = require('chai')

const TokenFarm = artifacts.require("TokenFarm")
const JapToken = artifacts.require("JapToken")
const DaiToken = artifacts.require("DaiToken")

require('chai').use(require('chai-as-promised')).should()

function tokens(n){
    return web3.utils.toWei(n, 'ether')
}

contract('TokenFarm', ([owner, investor]) => {
    let daiToken, japToken, tokenFarm

    before(async ()=> {
        daiToken = await DaiToken.new()
        japToken = await JapToken.new()
        tokenFarm = await TokenFarm.new(japToken.address, daiToken.address)

        await japToken.transfer(tokenFarm.address, tokens('1000000'))

        await daiToken.transfer(investor, tokens('100'), {from: owner})
    })

    describe('Mock Dai deployment', async () => {
        it('has a name', async()=> {
            const name = await daiToken.name()
            assert.equal(name, "Mock DAI Token")
        })
    })

    describe('JAp Token deployment', async () => {
        it('has a name', async()=> {
            const name = await japToken.name()
            assert.equal(name, "JAp Token")
        })

        it('contract has tokens', async()=> {
            let balance = await japToken.balanceOf(tokenFarm.address)
             assert.equal(balance.toString(), tokens('1000000'))
        })
    })

    describe('Farming Tokens', async () => {
        it('reward investor for staking mDai tokens', async()=> {
            let result

            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor wallet before staking')

            await daiToken.approve(tokenFarm.address, tokens('100'), {from: investor})
            await tokenFarm.stakeTokens(tokens('100'), {from:investor})

            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('0'), 'investor wallet after staking')

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens('100'), 'Token farm wallet after staking')

            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens('100'), 'investor staking balance after staking')

            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'true', 'investor staking status after staking')

            await tokenFarm.issueTokens({from: owner})

            result = await japToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor JAp wallet after issue stake')

            await tokenFarm.issueTokens({from:investor}).should.be.rejected
            await tokenFarm.unstakeTokens({ from: investor})

            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor mock DAI wallet after staking')

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens('0'), 'Token farm mock DAI wallet after staking')

            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens('0'), 'investor staking balance after staking')

            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'false', 'investor staking status after staking')
        })
    })
})