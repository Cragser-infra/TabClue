import { tagListStorage, settingsStorage } from '@/storage';
import { generateId } from '@/lib/id';
import { extractDomain } from '@/lib/domain';
import { formatSessionName } from '@/lib/date';
import type { TabItem, GroupItem, TagItem } from '@/types/tab';
import type { RuntimeMessage } from '@/types/messages';

async function handleSaveAllTabs(
  payload?: { targetTagId?: string }
): Promise<{ success: boolean; savedCount: number; groupId: string; tabIds: number[] }> {
  const chromeTabs = await chrome.tabs.query({ currentWindow: true });

  const savableTabs = chromeTabs.filter(
    (t) =>
      t.url &&
      !t.url.startsWith('chrome://') &&
      !t.url.startsWith('chrome-extension://') &&
      !t.url.startsWith('about:')
  );

  const tabs: TabItem[] = savableTabs.map((t) => ({
    id: generateId(),
    title: t.title || 'Untitled',
    url: t.url!,
    favIconUrl: t.favIconUrl,
    domain: extractDomain(t.url!),
    savedAt: new Date().toISOString(),
  }));

  const group: GroupItem = {
    id: generateId(),
    name: formatSessionName(new Date()),
    createdAt: new Date().toISOString(),
    tabs,
    isLocked: false,
  };

  const tagList = await tagListStorage.getValue();
  const targetTagId = payload?.targetTagId || 'staging-area';
  const tagIndex = tagList.findIndex((t) => t.id === targetTagId);

  if (tagIndex >= 0) {
    tagList[tagIndex].groups.unshift(group);
  }

  await tagListStorage.setValue(tagList);

  const tabIds = savableTabs.map((t) => t.id).filter((id): id is number => id !== undefined);

  return {
    success: true,
    savedCount: tabs.length,
    groupId: group.id,
    tabIds,
  };
}

async function handleCloseTabs(tabIds: number[]): Promise<void> {
  const extensionTabs = await chrome.tabs.query({ currentWindow: true });
  const extensionUrls = extensionTabs
    .filter((t) => t.url?.startsWith('chrome-extension://'))
    .map((t) => t.id)
    .filter((id): id is number => id !== undefined);

  const toClose = tabIds.filter((id) => !extensionUrls.includes(id));

  if (toClose.length > 0) {
    await chrome.tabs.remove(toClose);
  }
}

async function handleOpenDashboard(path?: string): Promise<void> {
  const optionsUrl = chrome.runtime.getURL('/options.html');
  const tabs = await chrome.tabs.query({ url: `${optionsUrl}*` });

  if (tabs.length > 0 && tabs[0].id) {
    await chrome.tabs.update(tabs[0].id, { active: true });
    if (tabs[0].windowId) {
      await chrome.windows.update(tabs[0].windowId, { focused: true });
    }
  } else {
    await chrome.tabs.create({ url: path ? `${optionsUrl}#${path}` : optionsUrl });
  }
}

async function checkBookmarkStatus(urls: string[]): Promise<Record<string, boolean>> {
  const result: Record<string, boolean> = {};
  for (const url of urls) {
    try {
      const bookmarks = await chrome.bookmarks.search({ url });
      result[url] = bookmarks.length > 0;
    } catch {
      result[url] = false;
    }
  }
  return result;
}

export default defineBackground(() => {
  // Left-click on the extension icon: save all tabs, open dashboard, close saved tabs
  chrome.action.onClicked.addListener(async (_tab) => {
    const result = await handleSaveAllTabs();
    if (result.success) {
      await handleOpenDashboard();
      await handleCloseTabs(result.tabIds);
    }
  });

  chrome.runtime.onMessage.addListener(
    (message: RuntimeMessage, _sender, sendResponse) => {
      switch (message.type) {
        case 'SAVE_ALL_TABS':
          handleSaveAllTabs(message.payload).then(sendResponse);
          return true;
        case 'CLOSE_SAVED_TABS':
          handleCloseTabs(message.payload.tabIds);
          break;
        case 'OPEN_DASHBOARD':
          handleOpenDashboard(message.payload?.path);
          break;
        case 'GET_BOOKMARK_STATUS':
          checkBookmarkStatus(message.payload.urls).then((result) => {
            sendResponse({ type: 'BOOKMARK_STATUS_RESULT', payload: result });
          });
          return true;
      }
    }
  );

  chrome.commands.onCommand.addListener(async (command) => {
    if (command === 'save-all-tabs') {
      const result = await handleSaveAllTabs();
      if (result.success) {
        await handleOpenDashboard();
        await handleCloseTabs(result.tabIds);
      }
    }
  });

  chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === 'install') {
      await tagListStorage.getValue();
      await settingsStorage.getValue();
    }
  });
});
