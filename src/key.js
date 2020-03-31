var Web3 = require('web3');
var web3 = new Web3

/** @namespace */
var key = {

  /**
   * generateKeypair - description
   *
   * @returns {type}  description
   */
  spawn : function generateKeypair(){
    const pair = web3.eth.accounts.create();
    return {
      address: pair.address,
      privateKey: pair.privateKey
    };
  },


  /**
   * addressOf - description
   *
   * @param  {type} privateKey description
   * @returns {type}            description
   */
  addof: function addressOf(privateKey){
    const pair = web3.eth.accounts.privateKeyToAccount(privateKey);
    return pair.address
  }

}

module.exports = key
