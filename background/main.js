import { showOptionPage } from './option.js';

console.log('This Is Back End');

chrome.action.onClicked.addListener(async (tab) => {
	console.log('On Action Click', tab);
	showOptionPage();
});
// chrome.runtime.onInstalled.addListener(() => {
// 	chrome.action.setBadgeText({
// 		text: "OFF",
// 	});
// });