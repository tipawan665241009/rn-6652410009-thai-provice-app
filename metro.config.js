const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Keep it simple to avoid 'nullthrows' errors in Metro
// Just add support for .mjs if needed, but remove manual path overrides
config.resolver.sourceExts.push('mjs', 'cjs');

module.exports = config;
