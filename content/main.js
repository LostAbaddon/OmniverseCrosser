globalThis.IsTab = true;
globalThis.IsInject = false;
globalThis.TabID = -1;
globalThis.OmniverseCrosser.init();

var InjectionDone = false;
var TabIdInjected = false;

OmniverseCrosser.inject(
	"common/kernel.js",
	"common/communication.js",
	"injection/main.js"
);

OmniverseCrosser.listen('onInjected', () => {
	InjectionDone = true;
	if (TabID > 0) {
		TabIdInjected = true;
		injectTabID(TabID);
	}
});

OmniverseCrosser.sendMsgAndWait('getTabId').then(result => {
	globalThis.TabID = result.data;
	if (!TabIdInjected && InjectionDone) {
		TabIdInjected = true;
		injectTabID(TabID);
	}
	console.log('[> Current Tab ID: ' + globalThis.TabID + ' <]');
});

console.log('Content :: Ready');