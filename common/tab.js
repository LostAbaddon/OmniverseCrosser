const openUniPage = (url, isWin=false, type="normal", width=1000, height) => new Promise(res => {
	const callback = (tab) => {
		res(tab);
	};

	chrome.tabs.query({url}, tabs => {
		var target = !!tabs ? tabs[0] : null;
		if (!target) {
			if (isWin) {
				let cfg = {
					url,
					width: width,
					focused: true,
					type: type
				};
				if (!!height) cfg.height = height;
				chrome.windows.create(cfg, win => {
					callback(win.tabs[0]);
				});
			}
			else {
				chrome.tabs.create({ url, active: true }, callback);
			}
		}
		else {
			chrome.windows.update(target.windowId, {focused: true}, () => {
				chrome.tabs.update(target.id, {active: true}, callback);
			});
		}
	});
});
const getCurrentId = () => new Promise(res => {
	chrome.tabs.getSelected(tab => {
		res(tab.id);
	});
});

globalThis.OmniverseCrosser = globalThis.OmniverseCrosser || {};

OmniverseCrosser.Tab = {
	openUniPage,
	getCurrentId
};