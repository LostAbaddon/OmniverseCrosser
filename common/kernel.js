const newId = (len=8) => {
	var id = [];
	for (let i = 0; i < len; i ++) {
		id.push(Math.floor(Math.random() * 36).toString(36));
	}
	return id.join('');
};

const CallbackPool = new Map();
CallbackPool.set('init', new Set());

globalThis.OmniverseCrosser = {};

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

globalThis.newId = newId;