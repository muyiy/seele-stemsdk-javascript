const { randomBytes }   = require('crypto')
const createKeccakHash  = require('keccak')
const RLP               = require('rlp')
const secp256k1         = require('secp256k1')

const maxShard    = 4

/** @namespace*/
var key = {


  /**
   * @method
   * @param {number} targetShard Target shard
   * @return {object} PrivateKey and address from shard
   * @example
   * key.spawn(1)
   * // returns
   * // {
   * //   address: '0xcc5d9fb5712c17222686b55cad068ecf1dd4f1f1',
   * //   privateKey: '0x51ec37a9351c96a1886f2d951e7f51f3069d0b4f1373b74fb69f91db76623f63'
   * // }
   */
  spawn : function generateKeypairByShard(targetShard){
    targetShard = targetShard || 1;
    let keypair
    if ( 1 <= targetShard && targetShard <= maxShard ) {
      do{
        keypair = generateKeypair()
      } while (this.shard(keypair.address) != targetShard)
      return keypair
    } else {
      throw "invalid shard"
    }
  },


  /**
   * @method
   * @param {string} address Address whose shard will be calculated
   * @return {number} Shard of address
   * @example
   * key.shard('0xcc5d9fb5712c17222686b55cad068ecf1dd4f1f1')
   * // returns
   * // 1
   */
  shard : function shardOfAddress(address){
    var sum = 0
    var buf = Buffer.from(address.substring(2), 'hex')
    for (const pair of buf.entries()) {if (pair[0] < 18){sum += pair[1]}}
    sum += (buf.readUInt16BE(18) >> 4)
    return (sum % maxShard) + 1
  },


  /**
   * @method
   * @param {string} pri Privatekey whose address will be calculated
   * @return {string} Address of private key
   * @example
   * key.addof('0x51ec37a9351c96a1886f2d951e7f51f3069d0b4f1373b74fb69f91db76623f63')
   * // returns
   * // '0x51ec37a9351c96a1886f2d951e7f51f3069d0b4f1373b74fb69f91db76623f63'
   */
  addof : function addressOf(pri){
      var pub = privateToPublic(pri)
      var add = publicToAddress(pub)
      return add
  },

  /**
   * @method
   * @param {string} add Address to be verified
   * @return {string} Validity of address
   * @example
   * key.valid('0x03bcaf796fe8cffd90d1245667921ab83a3a43e1')
   * // returns
   * // true
   */
  valid : function addressValidity(add){
    if (!(/^0x[0-9a-f]{39}1$/.test(add) || /^0x[0-9A-F]{39}1$/.test(add))) {
      return false;
    }
    return true
  }
}

function privateToPublic(privateKey){
  if (privateKey.length!=66){throw "privatekey string should be of lenth 66"}
  if (privateKey.slice(0,2)!="0x"){throw "privateKey string should start with 0x"}
  const inbuf = Buffer.from(privateKey.slice(2), 'hex');
  if (!secp256k1.privateKeyVerify(inbuf)){throw "invalid privateKey"}
  const oubuf = secp256k1.publicKeyCreate(inbuf, false).slice(1);
  return '0x'+oubuf.toString('hex')
}

function publicToAddress(pub){
  var buf = Buffer.from(pub.slice(2), 'hex');
  var add = "0x" + createKeccakHash('keccak256').update(RLP.encode(buf)).digest().slice(12).toString('hex').replace(/.$/i,"1")
  return add;
}

function generateKeypair(){
    let privKey
    do { privKey = randomBytes(32) } while (!secp256k1.privateKeyVerify(privKey))

    // get the public key in a compressed format
    let pubKey = secp256k1.publicKeyCreate(privKey)
    pubKey = secp256k1.publicKeyConvert(pubKey, false).slice(1)

    // Only take the lower 160bits of the hash
    let address = createKeccakHash('keccak256').update(RLP.encode(pubKey)).digest().slice(-20)
    address[19] = address[19]&0xF0|1

    return {
        "address" : "0x" + address.toString('hex'),
        "privateKey" : "0x" + privKey.toString('hex'),
    }
}

module.exports = key
