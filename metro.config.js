// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Tambahkan db dan wasm ke assetExts
defaultConfig.resolver.assetExts.push('db', 'wasm');

module.exports = defaultConfig;
