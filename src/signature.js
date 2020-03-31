const createKeccakHash  = require('keccak')
const RLP               = require('rlp')
const secp256k1         = require('secp256k1')

/** @namespace*/
var signature = {

  /**
   * @method
   * @param {string} prikey Privatekey used to sign transaction
   * @param {object} tx Transaction object to be signed
   * @return {object} Signed transaction object
   * @example
   * signature.signTxn()
   * // returns
   */
  signTxn: function signTransaction(prikey, tx, largestPackHeight){

    var val = [
      tx.From,
      tx.To,
      tx.Amount,
      tx.AccountNonce,
      tx.GasPrice,
      tx.GasLimit
    ]

    var hashForStem = "0x"+createKeccakHash('keccak256').update(RLP.encode(val)).digest().toString('hex')
    var signForStem = secp256k1.sign(Buffer.from(hashForStem.slice(2), 'hex'), Buffer.from(prikey.slice(2), 'hex'))
    // var signatureForStem = Buffer.concat([signForStem.signature, Buffer.from([signForStem.recovery])]).toString('base64')
    var signatureForStem = "0x"+ Buffer.concat([signForStem.signature, Buffer.from([signForStem.recovery])]).toString('hex')
    // console.log(signatureForStem);
    var payloadExtra = [
      largestPackHeight,
      hashForStem,
      signatureForStem
    ]
    // console.log(payloadExtra);
    tx.Payload = '0x'+RLP.encode(payloadExtra).toString('hex')
    // tx.Payload = "0x"+createKeccakHash('keccak256').update(RLP.encode(payloadExtra)).digest().toString('hex')

    var infolist = [
      tx.Type,
      tx.From,
      tx.To,
      tx.Amount,
      tx.AccountNonce,
      tx.GasPrice,
      tx.GasLimit,
      tx.Timestamp,
      tx.Payload
    ]

    var hash = "0x"+createKeccakHash('keccak256').update(RLP.encode(infolist)).digest().toString('hex')
    var signature = secp256k1.sign(Buffer.from(hash.slice(2), 'hex'), Buffer.from(prikey.slice(2), 'hex'))
    var sign = Buffer.concat([signature.signature, Buffer.from([signature.recovery])]).toString('base64')
    var Data = tx
    var txDone = {
      "Hash": hash,
      "Data": Data,
      "Signature": {
        "Sig": sign,
      }
    }
    return txDone
  },

  /**
   * @method
   * @param {string} from Sender address
   * @param {string} to Receiver address
   * @param {number} amount Send amount
   * @return {object} transaction object
   * @example
   * signature.initTxn()
   * // returns
   */
  initTxn: function initiateTransaction(from, to, amount){
    //verify from, to, amount, payload?
    return {
          "Type":         0,
          "From":         from,
          "To":           to,
          "Amount":       amount,
          "AccountNonce": 0,
          "GasPrice":     10,
          "GasLimit":     200000,
          "Timestamp":    0,
          "Payload":      ''
    }
  }
}

module.exports = signature;
