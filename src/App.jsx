import './App.css'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers';
import {contractABI, contractAddress} from './Constant/constant';

import Login from './components/Login';
import Connected from './components/Connected';



function App() {
  const [ provider, setProvider] = useState(null);
  const [ account, setAccount ] = useState(null);
  const [ isConnected, setIsConnected ] = useState(false);

  useEffect(() => {
    if(window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return() => {
      if(window.ethereum){
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  });

  // HANDLE METAMASK ACCOUNT CHANGE
  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0 && account !== accounts[0]) {
      setAccount(accounts[0]);
      canVote();
    } else {
      setIsConnected(false);
      setAccount(null);
    }
  }


  // CONNECT TO METAMASK
  const connectToMetaMask = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        console.log("Metamask Connected : " + address);
        setIsConnected(true);
      } catch (err) {
        console.error(err);
      }
    } else {
      console.error("Metamask is not detected in the browser")
    }
  }

  return (
    <>
      { isConnected ? (<Connected account = {account} />) : (<Login connectWallet = {connectToMetaMask} />) }
    </>
  )
}

export default App
