import { useEffect, useState } from 'react';

const browser = chrome;
export async function browserTabsCreate(params: any) {
  return await browser.tabs.create(params);
}
export async function browserTabsGetCurrent() {
  return await browser.tabs.getCurrent();
}
export const openExtensionInTab = async () => {
  const url = browser.runtime.getURL('home.html');
  const tab = await browserTabsCreate({ url });
  return tab;
};

export const extensionIsInTab = async () => {
  return Boolean(await browserTabsGetCurrent());
};

export const useExtensionIsInTab = () => {
  const [isInTab, setIsInTab] = useState(false);
  useEffect(() => {
    const init = async () => {
      const inTab = await extensionIsInTab();
      setIsInTab(inTab);
    };
    init();
  }, []);
  return isInTab;
};
export async function browserTabsQuery(params: any) {
  return await browser.tabs.query(params);
}
export const getActiveTab = async () => {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
};

export async function browserStorageGet(val: any) {
  return await browser.storage.local.get(val);
}

export async function browserStorageSet(val: any) {
  return await browser.storage.local.set(val);
}

export async function browserWindowsGetCurrent(params?: any) {
  return await browser.windows.getCurrent(params);
}

export async function browserWindowsCreate(params?: any) {
  return await browser.windows.create(params);
}

export async function browserWindowsUpdate(windowId: number, updateInfo: any) {
  return await browser.windows.update(windowId, updateInfo);
}

export async function browserWindowsRemove(windowId: number) {
  return await browser.windows.remove(windowId);
}
export function browserWindowsOnFocusChanged(listener) {
  browser.windows.onFocusChanged.addListener(listener);
}

export function browserWindowsOnRemoved(listener) {
  browser.windows.onRemoved.addListener(listener);
}

export function browserTabsOnUpdated(listener) {
  browser.tabs.onUpdated.addListener(listener);
}

export function browserTabsOnRemoved(listener) {
  browser.tabs.onRemoved.addListener(listener);
}

export function browserRuntimeOnConnect(listener) {
  browser.runtime.onConnect.addListener(listener);
}

export function browserRuntimeOnInstalled(listener) {
  browser.runtime.onInstalled.addListener(listener);
}

export function browserRuntimeConnect(extensionId?: string, connectInfo?: any) {
  return browser.runtime.connect(extensionId!, connectInfo);
}
