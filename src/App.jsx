import React, { useEffect, useState } from "react";
import { ethers, utils } from "ethers";
import './App.css';
import abi from "./utils/waveportal.json"

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allRecs, setAllRecs] = useState([]);

  const contractAddress = "0x001A3F375620aA1255cCC1100CFFE2eC757Bcc2e";
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        await getAllRecs();

      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
  * Implement your connectWallet method here
  */

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        /*
        * You're using contractABI here
        */
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalRecs();
        console.log("Retrieved total rec count...", count.toNumber());

        const waveTxn = await wavePortalContract.makeRec("linktospotify", "Some song");
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalRecs();
        console.log("Retrieved total something count...", count.toNumber());
        await getAllRecs();
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getAllRecs = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const musicPortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        // calling getAllRecs from smart contracts, this is where we read from the smart contract we have deployed.  It is almost acting as a server.
        const recs = await musicPortalContract.getAllRecs();
        console.log("original recs from contract", recs)


        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let formattedrecs = [];
        recs.forEach(rec => {
          formattedrecs.push({
            reccomender: rec.reccomender,
            timestamp: new Date(rec.timestamp * 1000),
            link: rec.link,
            description: rec.description
          });
        });

        /*
         * Store our data in React State
         */
        setAllRecs(formattedrecs);
        console.log(formattedrecs);
        console.log("updated to all recs to ...", allRecs);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          👋 Hey there!
        </div>

        <div className="bio">
          Hi, I'm Antony and this is my first Dapp. . .  I'm looking for some music reccomendations.  Drop a Spotify or Soundcloud link below!  Don't worry this is on the testnet (switch to Rinkeby Network on Metamask) so making a reccomendation doesn't cost any real money.
        </div>

        <button className="waveButton" onClick={wave}>
          Drop a song reccomendation!
        </button>

        {/*
        * If there is no account render the connect wallet button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {allRecs.map((rec, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {rec.reccomender}</div>
              <div>Time: {rec.timestamp.toString()}</div>
              <div>link: {rec.link}</div>
            </div>)
        })}
      </div>
    </div>
  );
}

export default App