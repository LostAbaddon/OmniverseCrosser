const normalizeURL = url => {
	if (!!url.match(/^(ht|f)tps?/i)) return url;
	return chrome.runtime.getURL(url);
};
const injectJS = url => new Promise(res => {
	var tag = OmniverseCrosser.newEle('script');
	tag.src = url;
	tag.onload = () => {
		res();
	};
	tag.onerror = (err) => {
		console.group();
		console.error('Load ' + url + ' failed.');
		console.error(err);
		console.groupEnd();
		res();
	};
	document.body.appendChild(tag);
});
const injectCSS = url => {
	var tag = OmniverseCrosser.newEle('link');
	tag.setAttribute('type', 'text/css');
	tag.setAttribute('rel', 'stylesheet');
	tag.href = url;
	document.body.appendChild(tag);
};

globalThis.OmniverseCrosser = globalThis.OmniverseCrosser || {};

globalThis.OmniverseCrosser.inject = async (...filelist) => {
	filelist = filelist.flat(Infinity);
	await Promise.all(filelist.map(async url => {
		if (!!url.match(/\.js$/i)) {
			url = normalizeURL(url);
			await injectJS(url);
		}
		else if (!!url.match(/\.css$/i)) {
			url = normalizeURL(url);
			await injectCSS(url);
		}
	}));
};