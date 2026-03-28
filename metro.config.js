// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Tambahkan db ke assetExts
defaultConfig.resolver.assetExts.push('db');

module.exports = defaultConfig;
