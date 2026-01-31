import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: '__MSG_extensionName__',
    description: '__MSG_extensionDescription__',
    default_locale: 'en',
    permissions: [
      'storage',
      'tabs',
      'unlimitedStorage',
      'bookmarks',
    ],
    commands: {
      'save-all-tabs': {
        suggested_key: {
          default: 'Alt+Shift+S',
        },
        description: '__MSG_commandSaveAllTabs__',
      },
    },
  },
});
