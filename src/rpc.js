const commands = module.exports.commands = {
  'seele': [
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
    'getBlockTransactionsByHash',
  ],
  'txpool': [
    'getTransactionByHash',
    'getDebtByHash',
    'getGasPrice',
    'getTxPoolContent',
    'getTxPoolTxCount',
    'getPendingTransactions',
    'getPendingDebts',
  ],
  'download': [
    'getStatus',
    'isSyncing',
  ],
  'network': [
    'getPeersInfo',
    'getPeerCount',
    'getNetVersion',
    'getProtocolVersion',
    'getNetworkID',
    'isListening',
  ],
  'miner': [
    'start',
    'stop',
    'status',
    'getCoinbase',
    'getTarget',
    'getWork',
    'setThreads',
    'setCoinbase',
    'getThreads',
  ],
  'debug': [
    'printBlock',
    'dumpHeap',
    'getTPS',
  ],
  'monitor': [
    'nodeInfo',
    'nodeStats',
  ],
};

const isCommand = module.exports.isCommand = function(command) {
  for (const namespace in commands) {
    if (commands.hasOwnProperty(namespace)) {
      for (const key in commands[namespace]) {
        if (commands[namespace].hasOwnProperty(key)) {
          if (commands[namespace][key] === command) {
            return true;
          }
        }
      }
    }
  }
};

const getNamespace = module.exports.getNamespace = function(command) {
  for (const namespace in commands) {
    if (commands.hasOwnProperty(namespace)) {
      for (const key in commands[namespace]) {
        if (commands[namespace].hasOwnProperty(key)) {
          if (commands[namespace][key] === command) {
            return namespace;
          }
        }
      }
    }
  }
};

if (typeof window !== 'undefined' && window.XMLHttpRequest) {
  XMLHttpRequest = window.XMLHttpRequest;
} else {
  XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
}

/** @class */
class seeleJSONRPC {
  /**
   * constructor - initiate rpc object
   *
   * @param  {string} address rpc address
   * @param  {number} timeout timeout
   */
  constructor(address, timeout) {
    this.host = address || 'http://localhost:8037';
    this.timeout = timeout || 30000;
  }


  /**
   * prepareRequest - description
   *
   * @param  {bool} async async function or not
   * @return {type}       description
   */
  prepareRequest(async) {
    const request = new XMLHttpRequest();
    request.withCredentials = false;
    request.timeout = this.timeout;
    request.open('POST', this.host, async);
    request.setRequestHeader('Content-Type', 'application/json');
    return request;
  }


  /**
   * send - description
   *
   * @param  {string} command command name
   * @return {type}         description
   */
  send(command) {
    const currHost = this.host;
    return new Promise((resolve, reject) => {
      if (!isCommand(command)) {
        this.invalid(command);
        reject(new Error(`command ${command} does not exist`));
      }
      const args = Array.prototype.slice.call(arguments, 1);
      if (typeof args[args.length - 1] === 'function') {
        resolve = args[args.length - 1].bind(this);
        reject = args.pop().bind(this);
      }

      const request = this.prepareRequest(true);
      const rpcData = JSON.stringify({
        id: new Date().getTime(),
        method: getNamespace(command).concat('_').concat(command),
        params: args,
      });

      request.onload = function() {
        if (request.readyState === 4 && request.timeout !== 1) {
          const result = JSON.parse(request.responseText);
          try {
            if (result.error) {
              result.error.args = JSON.stringify(args);
              result.error.command = command.toString();
              resolve(result);
            } else {
              resolve(result.result);
            }
          } catch (exception) {
            reject(new Error(exception));
          }
        }
      };

      request.ontimeout = () => {
        console.error('time out');
        // reject(args,new Error('CONNECTION TIMEOUT: timeout of ' + currHost + ' ms achieved'));
        reject(new Error('CONNECTION TIMEOUT: timeout of ' + currHost + ' ms achieved'));
      };

      request.onerror = function() {
        if (request.status == 0) {
          reject(new Error('CONNECTION ERROR: Couldn\'t connect to node '+currHost +'.'));
        } else {
          reject(new Error(request.statusText));
        }
      };

      try {
        request.send(rpcData);
      } catch (error) {
        reject(JSON.parse(JSON.stringify(error)));
      }
      return request;
    });
  }


  /**
   * sendSync - description
   *
   * @param  {string} command command name
   * @return {type}         description
   */
  sendSync(command) {
    if (!isCommand(command)) {
      this.invalid(command);
      reject(new Error(`command ${command} does not exist`));
    }
    const args = Array.prototype.slice.call(arguments, 1);

    const request = this.prepareRequest(false);
    const rpcData = JSON.stringify({
      id: new Date().getTime(),
      method: getNamespace(command).concat('_').concat(command),
      params: args,
    });

    request.onerror = function() {
      throw request.statusText;
    };

    try {
      request.send(rpcData);
    } catch (error) {
      console.log(error);
      throw new Error('CONNECTION ERROR: Couldn\'t connect to node '+ this.host +'.');
    }

    let result = request.responseText;

    try {
      // console.log(result);
      result = JSON.parse(result);
      if (result.error) {
        throw new Error(JSON.stringify(result));
      }

      return result.result;
    } catch (exception) {
      throw new Error(exception + ' : ' + JSON.stringify(result));
    }
  }


  /**
   * invalid - check command validity
   *
   * @param  {string} command command name
   * @return {type}         description
   */
  invalid(command) {
    return console.log(new Error('No such command "' + command + '"'));
  }
}

for (const namespace in commands) {
  if (commands.hasOwnProperty(namespace)) {
    commands[namespace].forEach((command) => {
      const cp = seeleJSONRPC.prototype;
      cp[command] = function() {
        return this.send(command, ...arguments);
      };
    });
  }
}

module.exports = seeleJSONRPC;
