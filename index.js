module.exports = function (bundler) {
    bundler.addAssetType('.autorouter', require.resolve('./src/RouterAsset.js'));
};