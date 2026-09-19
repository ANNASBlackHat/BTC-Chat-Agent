const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = `${projectRoot}/../..`;

const config = getDefaultConfig(projectRoot);

// 1. Watch all files in the monorepo (packages/shared lives outside apps/mobile)
config.watchFolders = [workspaceRoot];

// 2. Let Metro resolve modules from the workspace root (node_modules live there with pnpm)
config.resolver.nodeModulesPaths = [
  `${projectRoot}/node_modules`,
  `${workspaceRoot}/node_modules`,
];

// Transpile the workspace shared package (ships uncompiled TS source)
config.resolver.disableHierarchicalLookup = false;

module.exports = config;
