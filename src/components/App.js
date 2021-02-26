import React, { useState, useEffect} from 'react'
import Web3 from 'web3'

import DaiToken from '../abis/DaiToken.json'
import JapToken from '../abis/JapToken.json'
import TokenFarm from '../abis/TokenFarm.json'

import Navbar from './Navbar'
import Main from './Main'

import './App.css'


const App = () => {

  const [account, setAccount] = useState('0x0')
  const [daiToken, setDaiToken] = useState({})
  const [japToken, setJapToken] = useState({})
  const [tokenFarm, setTokenFarm] = useState({})
  const [daiTokenBalance, setDaiTokenBalance] = useState('0')
  const [japTokenBalance, setJapTokenBalance] = useState('0')
  const [stakingBalance, setStakingBalance] = useState('0')
  const [loading, setLoading] = useState(false)


  useEffect(async()=>{
    setLoading(true)
    await loadWeb3()
    await loadBlockchainData()
    setLoading(false)
  },[])

  const loadBlockchainData = async () => {
    const web3 = window.web3

    const accounts = await web3.eth.getAccounts()
    setAccount(accounts[0])
    console.log('account: ',accounts[0])
    const networkId = await web3.eth.net.getId()
    console.log('Network ID: ', networkId)

    const daiTokenData = DaiToken.networks[networkId]
    if(daiTokenData){
      const _daiToken = new web3.eth.Contract(DaiToken.abi, daiTokenData.address)
      setDaiToken(_daiToken)
      const _daiTokenBalance = await _daiToken.methods.balanceOf(accounts[0]).call()
      setDaiTokenBalance(_daiTokenBalance.toString())
      console.log('DAI balance: ',_daiTokenBalance.toString())
    } else {
      window.alert('DAI token contract not deployed to detected network')
    }

    const japTokenData = JapToken.networks[networkId]
    if(japTokenData){
      const _japToken = new web3.eth.Contract(JapToken.abi, japTokenData.address)
      setJapToken(_japToken)
      const _japTokenBalance = await _japToken.methods.balanceOf(accounts[0]).call()
      setJapTokenBalance(_japTokenBalance.toString())
      console.log('Jap balance: ',_japTokenBalance.toString())
    } else {
      window.alert('JAp token contract not deployed to detected network')
    }

    const tokenFarmData = TokenFarm.networks[networkId]
    if(tokenFarmData){
      const _tokenFarm = new web3.eth.Contract(TokenFarm.abi, tokenFarmData.address)
      setTokenFarm(_tokenFarm)
      const _stakingBalance = await _tokenFarm.methods.stakingBalance(accounts[0]).call()
      setStakingBalance(_stakingBalance.toString())
      console.log(' token farm balance: ',_stakingBalance.toString())
    } else {
      window.alert('Token farm contract not deployed to detected network')
    }
  }

  const loadWeb3 = async () => {
    if(window.ethereum){
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if(window.web3){
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else{
      window.alert('Non-ethereum browser detected. You should consider trying MetaMask!!!')
    }
  }

  const stakeTokens = async (amount) => {
    setLoading(true)
    console.log('account stake: ',account)
    console.log('token', tokenFarm._address)
    await daiToken.methods.approve(tokenFarm._address, amount).send({ from: account }).on('transactionHash', (hash) => {
      tokenFarm.methods.stakeTokens(amount).send({ from: account }).on('transactionHash', async (hash) => {
        window.location.reload();
      })
    })
  }

  const unstakeTokens = async (amount) => {
    setLoading(true)
    console.log('account unstake: ',account)
    await tokenFarm.methods.unstakeTokens().send({ from: account }).on('transactionHash', async (hash) => {
      window.location.reload();
    })
  }

    return (
      <div>
        <Navbar account={account} />
        <div className="container-fluid mt-5">
          { loading & account !== '0x0' ? <h1>Loading....</h1> :  <Main
        daiTokenBalance={daiTokenBalance}
        japTokenBalance={japTokenBalance}
        stakingBalance={stakingBalance}
        stakeTokens={stakeTokens}
        unstakeTokens={unstakeTokens}
      />}
        </div>
      </div>
    );

}

export default App;
