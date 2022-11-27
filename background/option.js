import { openUniPage } from '../common/tab.js';

const OptionPageUrl = '/page/option.html';

const showOptionPage = async () => {
	if (!chrome.runtime.openOptionsPage) {
		await chrome.runtime.openOptionsPage();
	}
	else {
		await openUniPage(chrome.runtime.getURL(OptionPageUrl), true, 'popup', 1000);
	}
};

export {
	showOptionPage
};