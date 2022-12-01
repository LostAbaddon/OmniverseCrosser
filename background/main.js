import '../common/kernel.js';
import '../common/communication.js';
import { showOptionPage } from './option.js';

globalThis.IsTab = false;
globalThis.IsInject = false;
globalThis.TabID = 0;
globalThis.OmniverseCrosser.init();

chrome.action.onClicked.addListener(async (tab) => {
	console.log('On Action Click', tab);
	showOptionPage();
});
// chrome.runtime.onInstalled.addListener(() => {
// 	chrome.action.setBadgeText({
// 		text: "OFF",
// 	});
// });

OmniverseCrosser.listen('getTabId', msg => {
	return msg.from.id;
});

console.log('Backend :: Ready');