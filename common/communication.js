const ReplyAction = '__reply';
const IsTab = !!globalThis.window;
const ListenerPool = {};
const ResponsorPool = {};
const RequestPool = {};

const sendToTab = (msg, tid=0) => new Promise(res => {
	if (tid === 0) {
		chrome.tabs.query({ active: true, lastFocusedWindow: true }).then(tabs => {
			var current = tabs[0];
			if (!current) return res();
			current = current.id;
			chrome.tabs.sendMessage(current, msg, () => res());
		});
	}
	else {
		chrome.tabs.get(tid, tab => {
			if (!tab) return res();
			chrome.tabs.sendMessage(tab.id, msg, () => res());
		});
	}
});

globalThis.OmniverseCrosser = globalThis.OmniverseCrosser || {};

globalThis.OmniverseCrosser.onInit(() => {
	chrome.runtime.onMessage.addListener(async (msg, sender, resp) => {
		resp();
		if (!msg.action || !msg.action) return;

		if (msg.from < 0) {
			if (!IsTab) {
				msg.from = sender.tab.id;
			}
			else {
				msg.from = 0;
			}
		}

		var callback;
		if (msg.action === ReplyAction) {
			callback = ResponsorPool[msg.eid];
			delete ResponsorPool[msg.eid];
		}
		else {
			callback = ListenerPool[msg.action];
			if (!!msg.eid) {
				RequestPool[msg.eid] = msg.from;
			}
		}
		if (!callback) return;

		let result = await callback(msg);
		if (msg.action === ReplyAction || result === undefined) return;
		OmniverseCrosser.reply(msg.eid, result);
	});
});

globalThis.OmniverseCrosser.sendMsg = (action, msg, target=0) => {
	if (IsTab) {
		chrome.runtime.sendMessage({
			action,
			data: msg,
			from: -1,
			target
		});
	}
	else {
		sendToTab({
			action,
			data: msg,
			from: 0,
			target
		}, target);
	}
};
globalThis.OmniverseCrosser.sendMsgAndWait = (action, msg, target=0) => new Promise(async res => {
	var eid = newId();
	ResponsorPool[eid] = res;

	if (IsTab) {
		chrome.runtime.sendMessage({
			eid,
			action,
			data: msg,
			from: -1,
			target
		});
	}
	else {
		sendToTab({
			eid,
			action,
			data: msg,
			from: 0,
			target
		}, target);
	}
});
globalThis.OmniverseCrosser.reply = (eid, msg) => {
	if (!eid) return;

	if (IsTab) {
		chrome.runtime.sendMessage({
			action: ReplyAction,
			eid,
			data: msg,
		});
	}
	else {
		let requester = RequestPool[eid];
		if (!requester) {
			requester = 0;
		}
		else {
			delete RequestPool[eid];
		}

		sendToTab({
			action: ReplyAction,
			eid,
			data: msg,
		}, requester);
	}
};
globalThis.OmniverseCrosser.listen = (action, callback) => {
	if (!action || !callback) return;
	ListenerPool[action] = callback;
};