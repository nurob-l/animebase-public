const assert = require('assert');

const getEntries = require('../src/webpack.multipages').getEntries;
const generatorHtmlWebpackPlugins = require('../src/webpack.multipages').generatorHtmlWebpackPlugins;
const common = require('../src/webpack.common.config');
const dev = require('../src/webpack.dev.config');

describe('#webpack.multipages.js', () => {
  describe('#getEntries() 自动生成多页面入口', () => {
    it('getEntries()应该返回形如格式为{page1: ["入口文件地址"], page2: ["入口文件地址"], ...}的对象', () => {
      console.log(getEntries());
      // assert.strictEqual(JSON.stringify(getEntries()), JSON.stringify({index: ['D:\Myproject\animebase\src\pages\index\index.js']}));
    });
  });
  
  describe('#generatorHtmlWebpackPlugins() 扫描pages文件夹，为每个页面生成一个插件实例对象', () => {
    it('查看generatorHtmlWebpackPlugins()返回的结果', () => {
      console.log(generatorHtmlWebpackPlugins());
    });
  });
});

describe('#webpack.common.config.js', () => {
  describe('#common webpack通用配置对象', () => {
    it('查看webpack.common.config.js的对象', () => {
      console.log(common);
    });
  });
});

describe('#webpack.dev.config.js', () => {
  describe('#dev webpack开发环境配置对象', () => {
    it('查看webpack.dev.config.js的对象', () => {
      console.log(dev);
    });
  });
});