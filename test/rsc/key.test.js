const key       = require('../src/key.js');
const assert    = require('chai').assert;
const sle       = require('../sle')

describe('key', function() {
  describe('shard', function() {
    it('Return shard of address', function() {
      assert.equal(sle.key.shard('0x15dcb0a38ae4aef2bd88def8c3588a1196d0d2b1'), 1);
      assert.equal(sle.key.shard('0x6bce7e284bd2b884d55f86a6af02a40c067f68f1'), 2);
      assert.equal(sle.key.shard('0x74fef56b59998f0d6fcc3da76163a0f466081fd1'), 3);
      assert.equal(sle.key.shard('0x3dd6ed2b8ffbe21bb1a848b95caaf01234244c71'), 4);
    });
  });
  describe('addof', function() {
    it('Return address of privatekey', function() {
      assert.equal(sle.key.addof('0x75aa4a29c343e3e61bb2f5541838988803ca54a47a9ad22b5a7409954bac75b2'), '0x15dcb0a38ae4aef2bd88def8c3588a1196d0d2b1');
      assert.equal(sle.key.addof('0xcab645d1ef8b93e8b18b5955c0a69695d1d402b1be2e963d3ad433901f02cd56'), '0x6bce7e284bd2b884d55f86a6af02a40c067f68f1');
      assert.equal(sle.key.addof('0xd10fddbe805f8b6db67ad95443a6e50388a2c942e21d437d40a042514d94405d'), '0x74fef56b59998f0d6fcc3da76163a0f466081fd1');
      assert.equal(sle.key.addof('0x88be348a7e632640bb8fb82e8c2df90d3a1a32497d995134aadba0acd39afd8e'), '0x3dd6ed2b8ffbe21bb1a848b95caaf01234244c71');
    });
  });
  describe('spawn', function() {
    it('Generate privatekey-address-pair from shard', function(){
      assert.equal(sle.key.spawn(1).address.length, 42);
      assert.equal(sle.key.spawn(1).privateKey.length, 66);
    });
  });
  describe('valid', function() {
    it('Checks the validity of the address', function() {
      assert.equal(sle.key.valid('0x15dcb0a38ae4aef2bd88def8c3588a1196d0d2b1'), true);
      assert.equal(sle.key.valid('0x15dcb0a38Ae4aef2bd88def8c3588a1196d0d2b1'), false);
    })
  })
});
