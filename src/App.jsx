import React, { useEffect, useState } from "react";
import { ethers, utils } from "ethers";
import './App.css';
import abi from "./utils/waveportal.json"

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allRecs, setAllRecs] = useState([]);
  const [totalrecs, settotalrecs] = useState(0);
  const [inputlink, setinputlink] = useState("");
  const [inputdescription, setinputdescription] = useState("");
  const [buttonstatustext, setbuttonstatustext] = useState("Submit");
  const [buttonstatus, setbuttonstatus] = useState(false);

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

  const submit = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        /*
        * You're using contractABI here
        */
        const musicPortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await musicPortalContract.getTotalRecs();
        console.log("Retrieved total rec count...", count.toNumber());



        const waveTxn = await musicPortalContract.makeRec(inputlink, inputdescription);
        console.log("Mining...", waveTxn.hash);
        setbuttonstatustext("MINING . . .");
        setbuttonstatus(true);
        // can write a function here from // https://www.w3schools.com/js/js_timing.asp to be able to do // // changing dots
        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);
        setbuttonstatustext("Another one?")
        setbuttonstatus(true);

        count = await musicPortalContract.getTotalRecs();
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
  <div className = "background-image">
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          👋 Hi, I'm Antony.
        </div>

        <div className="bio" >
          Thanks for stopping by.  This is my first dapp using Rinkeby!  I'm looking for music reccomendations.  Feel free to leave one below or just browse :)
        </div>

          {/*
         <button className="waveButton" onClick={wave}>
           Drop a song reccomendation!
         </button>
        */}


{ /*
        <form>
    <label>
    Name:
    <input type="text" name="name" />
    </label>
  <input type="submit" value="Submit" />
</form>
*/ }

      

        <input onChange= {event => setinputlink(event.target.value)} type="text" placeholder="Drop a link!" class="inputfield" id = "inputsonglink"/>

        <input onChange= {event => setinputdescription(event.target.value)} type="text" placeholder="Brief description of song/playlist" class="inputfield" id = "inputsonglink"/>

         <button className="waveButton" onClick={submit} disabled={ buttonstatus || (inputdescription.trim().length <= 0 || inputlink.trim().length <= 0)}>
           {buttonstatustext}
         </button>
        

        {/*
        * If there is no account render the connect wallet button
        */}

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        <div className =  "waves-container">
        
        {allRecs.slice(0).reverse().map((rec, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "18px", padding: "8px" }}>
              <div>Link: {rec.link}</div>
              <div>Description: {rec.description.toString()}</div>
              <div>Time: {rec.timestamp.toString()}</div>
              <div style = {{marginTop: "5px"}}>Address: {rec.reccomender}</div>
            </div>)
        })}
      </div>
      </div>
    </div>
    </div>
  );
}

export default App