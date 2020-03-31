const createKeccakHash  = require('keccak')
const RLP               = require('rlp')
const secp256k1         = require('secp256k1')

/** @namespace*/
var signature = {


  /**
   * @method
   * @param {string} prikey Privatekey used to sign message
   * @param {string} msg Message to be signed
   * @return {string} String signature
   * @example
   * signature.signMsg()
   * // returns
   */
  signMsg: function signMessageString(prikey, msg){
    var hash      = createKeccakHash('keccak256').update(RLP.encode(msg)).digest().toString('hex')
    var signature = secp256k1.sign(Buffer.from(hash, 'hex'), Buffer.from(prikey.slice(2), 'hex'))
    var sign      = Buffer.concat([signature.signature, Buffer.from([signature.recovery])]).toString('base64')
    return sign
  },


  /**
   * @method
   * @param {string} prikey Privatekey used to sign transaction
   * @param {object} tx Transaction object to be signed
   * @return {object} Signed transaction object
   * @example
   * signature.signTxn()
   * // returns
   */
  signTxn: function signTransaction(prikey, tx){
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
    // console.log(RLP.encode(infolist));
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
   * @param {string} sign Signature of signed message
   * @param {string} msg Signed message
   * @return {string} Address string
   * @example
   * signature.tellMsg()
   * // returns
   */
  tellMsg: function recoverMessageString(sign, msg){
    var totalB= Buffer.from(sign, 'base64')
    var signB = totalB.slice(0,64)
    var rcvrB = totalB.slice(64)
    var hashB = Buffer.from(createKeccakHash('keccak256').update(RLP.encode(msg)).digest().toString('hex'), 'hex')
    var rcvr  = [...rcvrB]
    var pubk  = secp256k1.recover(hashB, signB, rcvr[0], false).slice(1)
    var addr  = publicToAddress('0x'+pubk.toString('hex'))
    return addr
  },


  /**
   * @method
   * @param {string} sign Signature of signed transaction
   * @param {string} hash Hash of transaction
   * @return {string} Address string
   * @example
   * signature.tellTxn()
   * // returns
   */
  tellTxn: function recoverTransaction(sign, hash){
    var totalB= Buffer.from(sign, 'base64')
    var signB = totalB.slice(0,64)
    var rcvrB = totalB.slice(64)
    var hashB = Buffer.from(hash.slice(2), 'hex')
    var rcvr  = [...rcvrB]
    var pubk  = secp256k1.recover(hashB, signB, rcvr[0], false).slice(1)
    var addr  = publicToAddress('0x'+pubk.toString('hex'))
    return addr
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

function publicToAddress(pub){
  var buf = Buffer.from(pub.slice(2), 'hex');
  var add = "0x" + createKeccakHash('keccak256').update(RLP.encode(buf)).digest().slice(12).toString('hex').replace(/.$/i,"1")
  return add;
}

module.exports = signature
