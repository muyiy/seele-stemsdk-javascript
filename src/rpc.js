var commands = module.exports.commands = {
  "seele":[
    'subGen',
    'getInfo',
    'getBalance',
    'addTx',
    'getAccountNonce',
    'getBlockHeight',
    'getBlock',
    'getBlockByHash',
    'getBlockByHeight',
    'call',
    'getLogs',
    'getCode',
    'generatePayload',
    'estimateGas',
    'getBlockTransactionCount',
    'getBlockTransactionCountByHeight',
    'getBlockTransactionCountByHash',
    'getTransactionByBlockIndex',
    'getTransactionByBlockHeightAndIndex',
    'getTransactionByBlockHashAndIndex',
    'getReceiptByTxHash',
    'getTransactionsFrom',
    'getTransactionsTo',
    'getAccountTransactions',
    'getBlockTransactions',
    'getBlockTransactionsByHeight',
    'getBlockTransactionsByHash'
  ],
  "txpool":[
    'getTransactionByHash',
    'getDebtByHash',
    'getGasPrice',
    'getTxPoolContent',
    'getTxPoolTxCount',
    'getPendingTransactions',
    'getPendingDebts'
  ],
  "download":[
    'getStatus',
    'isSyncing'
  ],
  "network":[
    'getPeersInfo',
    'getPeerCount',
    'getNetVersion',
    'getProtocolVersion',
    'getNetworkID',
    'isListening'
  ],
  "miner":[
    'start',
    'stop',
    'status',
    'getCoinbase',
    'getTarget',
    'getWork',
    'setThreads',
    'setCoinbase',
    'getThreads'
  ],
  "debug":[
    'printBlock',
    'dumpHeap',
    'getTPS'
  ],
  "monitor":[
    'nodeInfo',
    'nodeStats'
  ],
  "subchain":[
    "getBlockCreator",
    "getBalanceTreeRoot",
    "getBalanceTreeRoot",
    "getTxTreeRoot",
    "getBlockSignature",
    "getBlockInfoForStem",
    "getTxMerkleInfo",
    "getBalanceMerkleInfo",
    "getRecentTxTreeRoot",
    "getRecentTxMerkleInfo",
    "getAccountTx",
    "getUpdatedAccountInfo",
    "getFee",
    "getRelayInterval",
  ]
}


var isCommand = module.exports.isCommand = function(command) {
  for (const namespace in commands) {
    for (const key in commands[namespace]) {
      if (commands[namespace][key] === command){
        return true
      }
    }
  }
}

var getNamespace = module.exports.getNamespace = function(command) {
  for (const namespace in commands) {
    for (const key in commands[namespace]) {
      if (commands[namespace][key] === command){
        return namespace
      }
    }
  }
}

if (typeof window !== 'undefined' && window.XMLHttpRequest) {
  XMLHttpRequest = window.XMLHttpRequest;
} else {
  XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
}

/**@class */
class seeleJSONRPC {

  /**
   * constructor - Initialize rpc object
   * method
   * @param  {string} address node address
   * @param  {string} timeout timeout number
   */
  constructor(address, timeout) {
    this.host = address || 'http://localhost:8037';
    this.timeout = timeout || 30000;
  }

  prepareRequest(async) {
    var request = new XMLHttpRequest();
    request.withCredentials = false;
    request.timeout = this.timeout;
    request.open('POST', this.host, async);
    request.setRequestHeader('Content-Type', 'application/json');
    return request;
  }

  send(command) {
    var currHost = this.host;
    return new Promise((resolve, reject) => {
      if(!isCommand(command)){
        this.invalid(command)
        reject(new Error(`command ${command} does not exist`))
      }
      var args = Array.prototype.slice.call(arguments, 1)
      if (typeof args[args.length - 1] === 'function') {
        resolve = args[args.length - 1].bind(this);
        reject = args.pop().bind(this);
      }

      var request = this.prepareRequest(true)
      var rpcData = JSON.stringify({
        id: new Date().getTime(),
        method: getNamespace(command).concat("_").concat(command),
        params: args
      });

      request.onload = function () {
        if (request.readyState === 4 && request.timeout !== 1) {
          var result = JSON.parse(request.responseText)
          try {
            if (result.error) {
              result.error.args = JSON.stringify(args)
              result.error.command = command.toString()
              resolve(result)
            } else {
              resolve(result.result)
            }
          } catch (exception) {
            reject(new Error(exception))
          }
        }
      };

      request.ontimeout = () => {
        console.error('time out');
        // reject(args,new Error('CONNECTION TIMEOUT: timeout of ' + currHost + ' ms achieved'));
        reject(new Error('CONNECTION TIMEOUT: timeout of ' + currHost + ' ms achieved'))
      };

      request.onerror = function () {
        if(request.status == 0){
          reject(new Error('CONNECTION ERROR: Couldn\'t connect to node '+currHost +'.'))
        }else{
          reject(new Error(request.statusText))
        }
      };

      try {
        request.send(rpcData);
      } catch (error) {
        reject(JSON.parse(JSON.stringify(error)))
      }
      return request;
    })
  }

  sendSync(command) {
    if(!isCommand(command)){
      this.invalid(command)
      reject(new Error(`command ${command} does not exist`))
    }
    var args    = Array.prototype.slice.call(arguments, 1)

    var request = this.prepareRequest(false)
    var rpcData = JSON.stringify({
      id: new Date().getTime(),
      method: getNamespace(command).concat("_").concat(command),
      params: args
    });

    request.onerror = function () {
      throw request.statusText
    };

    try {
      request.send(rpcData);
    } catch (error) {
      console.log(error)
      throw new Error('CONNECTION ERROR: Couldn\'t connect to node '+ this.host +'.');
    }

    var result = request.responseText;

    try {
      // console.log(result);
      result = JSON.parse(result);
      if (result.error) {
        throw new Error(JSON.stringify(result));
      }

      return result.result
    } catch (exception) {
      throw new Error(exception + ' : ' + JSON.stringify(result));
    }
  }

  invalid(command) {
    return console.log(new Error('No such command "' + command + '"'));
  }
}

for (const namespace in commands) {
  commands[namespace].forEach(command => {
    var cp = seeleJSONRPC.prototype
    cp[command] = function() {
      return this.send(command, ...arguments);
    }
  })
}

module.exports = seeleJSONRPC;
