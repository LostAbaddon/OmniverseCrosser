const ExtChannelName = 'OmniverseCrosser';

const ReplyAction = '__reply';
const InjectedAction = '__onInjected__';
const InjectTidAction = '__injectedTid__';

const ListenerPool = {};
const ResponsorPool = {};
const RequestPool = {};

const sendToTab = (msg, tid=0) => new Promise(res => {
	if (tid === 0) {
		chrome.tabs.query({ active: true, lastFocusedWindow: true }).then(tabs => {
			var current = tabs[0];
			if (!current) return res();
			current = current.id;
			msg.target.id = current;
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
const handleRequest = async msg => {
	var callback;
	if (msg.action === ReplyAction) {
		callback = ResponsorPool[msg.eid];
		if (!callback) return;
		delete ResponsorPool[msg.eid];
	}
	else {
		callback = ListenerPool[msg.action];
		if (!callback) return;
		if (!!msg.eid) {
			RequestPool[msg.eid] = [msg.from, msg.target];
		}
	}

	let result, err;
	try {
		result = await callback(msg);
	}
	catch (e) {
		result = null;
		err = e.message || e.msg || e;
	}
	if (msg.action === ReplyAction || result === undefined) return;
	OmniverseCrosser.reply(msg.eid, result, err);
};
const packMessage = (eid, action, data, fromId, fromInside, targetId, targetInside, err) => {
	return {
		eid,
		channel: ExtChannelName,
		action,
		data,
		err,
		from: {
			id: fromId,
			inside: fromInside
		},
		target: {
			id: targetId,
			inside: targetInside
		}
	};
};

globalThis.OmniverseCrosser = globalThis.OmniverseCrosser || {};

globalThis.OmniverseCrosser.onInit(() => {
	if (IsTab) {
		if (IsInject) {
			window._onExtInjected = callback => {
				window.postMessage({
					channel: ExtChannelName,
					action: InjectedAction
				});
			};
		}
		else {
			window.injectTabID = tid => {
				window.postMessage({
					channel: ExtChannelName,
					action: InjectTidAction,
					tid
				});
			};
		}

		window.addEventListener('message', (evt) => {
			var msg = evt.data;

			if (!msg || msg.channel !== ExtChannelName || !msg.action) return;

			if (msg.action === InjectedAction) {
				if (!IsInject && !!ListenerPool.onInjected) {
					ListenerPool.onInjected();
				}
				return;
			}
			if (msg.action === InjectTidAction) {
				if (IsInject && !!ListenerPool.onInjectTID) {
					ListenerPool.onInjectTID(msg);
				}
				return;
			}

			// repost
			if (IsInject) {
				if (TabID !== -1 && msg.target.id !== -1 && msg.target.id !== TabID) {
					return;
				}
				else if (!msg.target.inside) {
					return;
				}
			}
			else {
				if (TabID !== -1 && msg.target.id !== -1 && msg.target.id !== TabID) {
					chrome.runtime.sendMessage(msg);
					return;
				}
				else if (msg.target.inside) {
					return;
				}
			}

			// handle
			handleRequest(msg);
		});
	}

	if (!IsInject) {
		chrome.runtime.onMessage.addListener(async (msg, sender, resp) => {
			resp();

			if (!msg || msg.channel !== ExtChannelName || !msg.action) return;

			// repost
			var reposted = false;
			if (IsTab) {
				if (TabID !== -1 && msg.target.id !== TabID) {
					chrome.runtime.sendMessage(msg);
					reposted = true;
				}
				else if (msg.target.inside) {
					window.postMessage(msg);
					reposted = true;
				}
			}
			else {
				if (msg.from.id === -1) msg.from.id = sender.tab.id;
				if (msg.target.id !== TabID) {
					sendToTab(msg, msg.target.id);
					reposted = true;
				}
			}
			if (reposted) return;

			// handle
			handleRequest(msg);
		});
	}
});

globalThis.OmniverseCrosser.sendMsg = (action, data, target=0, isInject=false, fromInside=IsInject) => {
	var message = packMessage(null, action, data, TabID, fromInside, target, isInject);

	if (IsTab) {
		if (IsInject || isInject) {
			window.postMessage(message);
		}
		else {
			chrome.runtime.sendMessage(message);
		}
	}
	else {
		message.from.id = 0;
		sendToTab(message, target);
	}
};
globalThis.OmniverseCrosser.sendMsgAndWait = (action, data, target=0, isInject=false, fromInside=IsInject) => new Promise(async res => {
	var eid = OmniverseCrosser.newId();
	ResponsorPool[eid] = res;

	var message = packMessage(eid, action, data, TabID, fromInside, target, isInject);

	if (IsTab) {
		if (IsInject || isInject) {
			window.postMessage(message);
		}
		else {
			chrome.runtime.sendMessage(message);
		}
	}
	else {
		message.from.id = 0;
		sendToTab(message, target);
	}
});
globalThis.OmniverseCrosser.reply = (eid, data, err) => {
	if (!eid) return;

	var requester = RequestPool[eid];
	if (!requester) {
		return;
	}
	else {
		delete RequestPool[eid];
	}

	var message = packMessage(eid, ReplyAction, data, requester[1].id, requester[1].inside, requester[0].id, requester[0].inside, err);

	if (IsTab) {
		if (IsInject) {
			window.postMessage(message);
		}
		else {
			chrome.runtime.sendMessage(message);
		}
	}
	else {
		sendToTab(message, requester[0].id);
	}
};
globalThis.OmniverseCrosser.listen = (action, callback) => {
	if (!action || !callback) return;
	ListenerPool[action] = callback;
};



	// window.postMessage({
	// 	requester: 'OmniMarket-Insider',
	// 	reply: false,
	// 	action,
	// 	token,
	// 	msg,
	// });