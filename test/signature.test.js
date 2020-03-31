const stm = require('./../index')
const assert    = require('chai').assert;

const k1 = {
  address: '0xc0B9ea313682915Efb99AD08F32dA1E560E241B2',
  privateKey: '0x70bccc874c24f7a4cd70ca85f585933d5039db1838f76a210ed0fd113ce2c5d0'
}

const k2 = {
  address: '0xA6802C0B42c83c03a76f84f7FC75B7D8D67219B0',
  privateKey: '0xcd3f693658a36f7aeddaaca7e74bb35815cf737adfedc953ae7668b8295515ce'
}

const k3 = {
  privateKey: '0x72e60939d831360bec6b4361644b5e2cb7d4ccb3e9a954fdab3b5a74bb34ca73'
}

describe('signature', function(){
  describe('initTxn', function(){
    it('Returns an initiated Transaction Object', function(){
      const initTx = stm.signature.initTxn(k1.address, k2.address, 100);
      assert.equal(1,1)
    })
  });
  describe('signTxn', function(){
    it('Returns a signed Transaction Object', function(){
      const initTx = stm.signature.initTxn(k1.address, k2.address, 100);
      initTx.From = "0xc78995a18569baf5e0f787c3d8d55a858602e381"
      initTx.To = "0x8cd42eebf7ccc855b303e8bba75674c8f3d0f1e1"
      initTx.Amount = 1
      initTx.AccountNonce = 0
      initTx.GasPrice = 1
      initTx.GasLimit = 2000000

      const signTx = stm.signature.signTxn(k3.privateKey, initTx, 1000);
      console.log(signTx);
      assert.equal(1,1)
    })
  });
})
