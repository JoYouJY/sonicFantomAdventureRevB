console.log("start");
// document.body.appendChild(Object.assign(document.createElement("script"), { type: "text/javascript", src: "./web3modal.js" }));
// document.body.appendChild(Object.assign(document.createElement("script"), { type: "text/javascript", src: "./web3.min.js" }));
// Create script elements and set their src attributes
////const web3ModalScript = document.createElement("script");
////web3ModalScript.type = "text/javascript";
////web3ModalScript.src = "./web3modal.js";

////const web3Script = document.createElement("script");
////web3Script.type = "text/javascript";
//dont know what version you got
////web3Script.src = "./web3.min.js";

//const web3 = new Web3(Web3.givenProvider) ;

var web3;
var userAccount;

async function GetWeb3(){

  console.log("getWeb3");
  console.log(Web3.givenProvider);

  web3 = new Web3(Web3.givenProvider);



  // const rpcUrl = 'https://rpcapi.sonic.fantom.network/';
  // const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));

  // const newChainId = 64240; // Replace with the desired chain ID

  // web3.eth.getChainId()
  //     .then(currentChainId => {
  //         if (currentChainId !== newChainId) {
  //             web3.currentProvider.send({
  //                 method: 'eth_chainId',
  //                 params: [newChainId],
  //                 jsonrpc: '2.0',
  //                 id: 1,
  //             }, (err, response) => {
  //                 if (!err) {
  //                     console.log(`Switched to chain ID: ${newChainId}`);
  //                 } else {
  //                     console.error(`Error switching chain ID: ${err}`);
  //                 }
  //             });
  //         } else {
  //             console.log(`Already on chain ID: ${newChainId}`);
  //         }
  //     })
  //     .catch(error => {
  //         console.error(`Error getting current chain ID: ${error}`);
  //     });




  // web3 = new Web3("https://rpcapi.sonic.fantom.network/");
  
  console.log(web3.version);
    
  try {
     //await window.ethereum.send('eth_requestAccounts');
     await window.ethereum.enable();
  } catch (error) {
      // Check if the error is a "User denied account authorization" error
      if (error.code === 4001) {
          // Open the MetaMask wallet app using deep linking
          window.location.href = 'ethereum:';
      } else {
          console.log("window.ethereum.enable() error")
          console.log(error);
      }
  }
  
  var userAccounts = await web3.eth.getAccounts();
  userAccount = userAccounts[0]

}


  const call_type = {
    CONNECT: 1,
    SEND_CONTRACT: 2,
  };

  const response_type = {
    ERROR   : 1,
    HASH    : 2,
    RECEIPT : 3,
    ACCOUNT_NUMBER: 4,
    READ_RESPONSE: 5,
  };



// document.getElementById('btn-connectwallet').addEventListener("click", function(event) {
//   ConnectWallet()
// }, {once: false});

// const web3 = new Web3(Web3.givenProvider) ;
// const from = await web3.eth.getAccounts();

async function ConnectWallet(){
  console.log("ConnectWallet()");

  await GetWeb3();
  
  console.log("ConnectWallet() getweb3 done");
  console.log(window.ethereum.isConnected());
  console.log(userAccount);

  var userAccounts = await web3.eth.getAccounts();
  userAccount = userAccounts[0]
  
  console.log(userAccounts);
  console.log(userAccount);

  response(response_type.ACCOUNT_NUMBER, userAccount)
}


// ConnectWallet();

function JsCallFunction(type, arg_string){
  console.log("JsCallFunction")
  console.log(type)
  console.log(arg_string)


  if(type == call_type.CONNECT){    
    ConnectWallet()  
  }
  else if (type == call_type.SEND_CONTRACT){
    arg_string = arg_string.toString()
    if (arg_string.startsWith("<sendContract>") && arg_string.endsWith("</sendContract>")){
      const removeSyntax = arg_string.substring("<sendContract>".length).slice(0,arg_string.length-("<sendContract>".length+"</sendContract>".length));
      const splited_text = removeSyntax.split("_%_");
      
      if (splited_text.length == 8){

          var bridge_id   = splited_text[0];
          var address     = splited_text[1];
          var method      = splited_text[2];
          var args        = splited_text[3];
          var price       = splited_text[4];
          var gasLimit    = splited_text[5];
          var gasPrice    = splited_text[6];
          var abi         = splited_text[7];



          sendContract(bridge_id, method, abi, address, args, price, gasLimit, gasPrice) 

      }
    }

  }

}
window.JsCallFunction = JsCallFunction;



async function JsGetFunction(type, arg_string){
  console.log("JsGetFunction")
  console.log(type)
  console.log(arg_string)


  arg_string = arg_string.toString()
  if (arg_string.startsWith("<readContract>") && arg_string.endsWith("</readContract>")){
    const removeSyntax = arg_string.substring("<readContract>".length).slice(0,arg_string.length-("<readContract>".length+"</sendContract>".length));
    const splited_text = removeSyntax.split("_%_");
    
    if (splited_text.length == 5){

      var bridge_id   = splited_text[0];
      var address     = splited_text[1];
      var method      = splited_text[2];
      var args        = splited_text[3];
      var abi         = splited_text[4];

      console.log(bridge_id);
      console.log(address);
      console.log(method);
      console.log(args);
      // console.log(abi);



      var responseString = await readContract(bridge_id, method, abi, address, args, ) 

      
      console.log(JSON.stringify(responseString));

      response(response_type.READ_RESPONSE, bridge_id.toString() + "_%_" + JSON.stringify(responseString))

      return(JSON.stringify(responseString));
    }
  }


}
window.JsGetFunction = JsGetFunction;

async function readContract(id, method, abi, contract, args) {
  
  // navigator.clipboard.writeText("<ContractRead>")
  return new Promise(async (resolve, reject) => {
    try {
      const from = (await web3.eth.getAccounts())[0];
      console.log("readContract");
      console.log(method);
      const result = await new web3.eth.Contract(JSON.parse(abi), contract).methods[method](...JSON.parse(args)).call();
      console.log(result);
      resolve(result); // Resolve the Promise with the result
    } catch (error) {
      console.error(error);
      reject(error); // Reject the Promise in case of an error
    }
  });
}



async function sendContract(id, method, abi, contract, args, value, gasLimit, gasPrice) {
    const from = (await web3.eth.getAccounts())[0];

    console.log(id)
    console.log(from)
    console.log(contract)
    console.log(method)
    console.log(args)
    console.log(value)
    console.log(gasLimit)
    console.log(gasPrice)
    // args = "[\"0xC69658BC4Ec4e903Bc0A04e50705A5225Aa88dfc\", 1]";
    console.log(args)

    new web3.eth.Contract(JSON.parse(abi), contract).methods[method](...JSON.parse(args))
        .send({
          from,
          value,
          gas: gasLimit ? gasLimit : undefined,
          gasPrice: gasPrice ? gasPrice : undefined,
        })
        .on("transactionHash", async (transactionHash) => {
          response(response_type.HASH, transactionHash)
          console.log("artificial delay ppooii");
          const logg = await pollForReceipt(transactionHash);
	        console.log(logg);
        })
        .on("error", (error) => {
          response(response_type.ERROR, error.message)
        })
        .on("receipt", function(receipt) {
  
          receipt["method"] = method;
          console.log(method);
          console.log(String(receipt));
          response(response_type.RECEIPT, JSON.stringify(receipt))
          
        });
}

async function response(respondType, message){

  var responseString = "<response>" + respondType + "_%_" + message + "</response>"

  window.unityInstance.SendMessage("JavascriptBridgeManager", "ResponseToUnity", responseString);

}
//---------support function-----------------
async function pollForReceipt(txHash) {
  const receipt = await web3.eth.getTransactionReceipt(txHash);

  if (receipt) {
    // The transaction has been mined
    return receipt;
  } else {
    // The transaction has not been mined yet
    await delay(300); // Wait for 1 second
    return pollForReceipt(txHash);
  }
}
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
//----------------------------------------

window.getAggressiveGasPrice = async function() {
  try {
    // Retrieve the current gas price
    const gasPrice = await web3.eth.getGasPrice();

    // Convert the gas price to BigInt
    const gasPriceBigInt = BigInt(gasPrice);

    // Adjust the gas price by multiplying with a factor (e.g., 2 for 100% increase)
    const aggressiveGasPrice = gasPriceBigInt * BigInt(15) / BigInt(10); // Multiplies by 1.5 as an example

    // Convert the gas price to Gwei or other units if desired
    const aggressiveGasPriceGwei = web3.utils.fromWei(aggressiveGasPrice.toString(), 'gwei');

    console.log('Aggressive gas price:', aggressiveGasPriceGwei, 'Gwei');
    window.unityInstance.SendMessage("Web3Manager", "UpdateGasPrice", aggressiveGasPrice.toString());
    return aggressiveGasPrice.toString(); // Return the aggressive gas price
  } catch (error) {
    console.error('Error:', error);
    throw error; // Throw the error
  }
};

//--------------------------------------
const fantomChain = {
  chainId: "0x" + (64165).toString(16), // Convert decimal to hexadecimal
  chainName: "Fantom Sonic Builders Testnet", // Network name
  rpcUrls: ["https://rpc.sonic.fantom.network/"], // RPC URL
  nativeCurrency: {
    symbol: "FTM", // Native token symbol
    decimals: 18, // Native token decimals
  },
  blockExplorerUrls: ["https://public-sonic.fantom.network"], // Block explorer URL
};

const addFantomChain = async () => {
  if (window.ethereum && window.ethereum.isMetaMask) {
    // Check for MetaMask injection and availability
    try {
      console.log(fantomChain);
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            ...fantomChain, // Include all chain details
          },
        ],
      });
      console.log("Fantom Sonic chain added successfully!");
    } catch (error) {
      console.error("Error adding Fantom Sonic chain:", error);
    }
  } else {
    console.warn("MetaMask not detected or unavailable.");
  }
};

addFantomChain();
