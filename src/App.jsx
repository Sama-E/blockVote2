import './App.css'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers';
import {contractABI, contractAddress} from './Constant/constant';

import Login from './components/Login';
import Connected from './components/Connected';
import Finished from './components/Finished';


function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [votingStatus, setVotingStatus] = useState(true);
  const [remainingTime, setremainingTime] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [number, setNumber] = useState('');
  const [CanVote, setCanVote] = useState(true);

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

  // VOTING

  // VOTE
  const vote = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract (
      contractAddress, contractABI, signer
    );

    const tx = await contractInstance.vote(number);
    await tx.wait();
    canVote();
  }

  // CAN VOTE
  const canVote = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract (
      contractAddress, contractABI, signer
    );
    const voteStatus = await contractInstance.voters(await signer.getAddress());
    setCanVote(voteStatus);
  }

  // GET VOTERS STATUS
  const getCurrentStatus = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract (
      contractAddress, contractABI, signer
    );
    const status = await contractInstance.getVotingStatus();
    console.log(status);
    setVotingStatus(status);
  }

  // ELECTIONS

  // GET CANDIDATES
  const getCandidates = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract (
      contractAddress, contractABI, signer
    );
    const candidatesList = await contractInstance.getAllVotesOfCandiates();
    const formattedCandidates = candidatesList.map((candidate, index) => {
      return {
        index: index,
        name: candidate.name,
        voteCount: candidate.voteCount.toNumber()
      }
    });
    setCandidates(formattedCandidates);
  }

  // GET REMAINING TIME OF ELECTION
  const getRemainingTime = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract (
      contractAddress, contractABI, signer
    );
    const time = await contractInstance.getRemainingTime();
    setremainingTime(parseInt(time, 16));
  }

  const handleNumberChange = async (e) => {
    setNumber(e.target.value);
  }

  // OWNER - METAMASK ACCOUNT

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
      { votingStatus ? 
        (isConnected ? 
          (<Connected 
            account = {account}
            candidates = {candidates}
            remainingTime = {remainingTime}
            number= {number}
            handleNumberChange = {handleNumberChange}
            voteFunction = {vote}
            showButton = {CanVote}/>
          ) :          
          (<Login connectWallet = {connectToMetaMask}/>)
        ) : 
        (<Finished />)
      }
    </>
  )
}

export default App
