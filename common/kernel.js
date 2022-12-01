const CallbackPool = new Map();
CallbackPool.set('init', new Set());

globalThis.OmniverseCrosser = {};

globalThis.OmniverseCrosser.newId = (len=8) => {
	var id = [];
	for (let i = 0; i < len; i ++) {
		id.push(Math.floor(Math.random() * 36).toString(36));
	}
	return id.join('');
};
globalThis.OmniverseCrosser.newEle = (tag, id, ...classList) => {
	var ele = document.createElement(tag || 'div');
	if (!!id) ele.id = id;
	if (!!classList) {
		classList = classList.flat(Infinity);
		classList.forEach(c => ele.classList.add(c));
	}
	return ele;
};

globalThis.OmniverseCrosser.onInit = cb => {
	if (!cb) return;
	CallbackPool.get('init').add(cb);
};
globalThis.OmniverseCrosser.init = () => {
	var cbs = CallbackPool.get('init');
	if (!cbs) return;
	for (let cb of cbs) {
		cb();
	}
	cbs.clear();
	CallbackPool.delete('init');
};