import '../common/kernel.js';
import '../common/communication.js';
import { showOptionPage } from './option.js';

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

OmniverseCrosser.listen('test1', msg => {
	console.log('Backend-1 got msg:', msg.data);
	return "FUCK YOU!!!";
});
OmniverseCrosser.listen('test2', async msg => {
	console.log('Backend-2 got msg:', msg.data);
	var result = await OmniverseCrosser.sendMsgAndWait('reply-test1', 'FUCK YOU AGAIN!!!');
	console.log('Backend-3 got msg:', result.data);
	OmniverseCrosser.sendMsg('reply-test2', 'FUCK YOU THIRD!!!');
});

console.log('Backend :: Ready');