const assert = require('assert');

const dataValid = require('@/libs/data-valid');

describe('#data-valid.js', () => {
  describe('#testEmail() 验证用户输入邮箱是否合法', () => {
    it('testEmail("asds")应该返回false', () => {
      assert.strictEqual(dataValid.testEmail("asds"), false);
    });
    
    it('testEmail("asds.cn")应该返回false', () => {
      assert.strictEqual(dataValid.testEmail("asdhjkas.cn"), false);
    });
    
    it('testEmail("@.cn")应该返回false', () => {
      assert.strictEqual(dataValid.testEmail("@.cn"), false);
    });
    
    it('testEmail("aa@cn")应该返回false', () => {
      assert.strictEqual(dataValid.testEmail("aa@cn"), false);
    });
    
    it('testEmail("asdhc@26.top")应该返回true', () => {
      assert.strictEqual(dataValid.testEmail("asdhc@26.top"), true);
    });
    
    it('testEmail("asdhc@qq.com")应该返回true', () => {
      assert.strictEqual(dataValid.testEmail("asdhc@qq.com"), true);
    });
  });
  
  describe('#testUsername() 验证用户输入昵称是否合法', () => {
    it('testUsername("2b")应该返回falase', () => {
      assert.strictEqual(dataValid.testUsername("2b"), false);
    });
    
    it('testUsername("草莓100%")应该返回falase', () => {
      assert.strictEqual(dataValid.testUsername("草莓100%"), false);
    });
    
    it('testUsername("abcdefghijklmnopqrstuvwxyz")应该返回falase', () => {
      assert.strictEqual(dataValid.testUsername("abcdefghijklmnopqrstuvwxyz"), false);
    });
    
    it('testUsername("谢谢")应该返回false', () => {
      assert.strictEqual(dataValid.testUsername("谢谢"), false);
    });
    
    it('testUsername("不客气")应该返回true', () => {
      assert.strictEqual(dataValid.testUsername("不客气"), true);
    });
  });
});