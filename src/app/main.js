const {app, Menu, BrowserWindow, Tray} = require('electron')
const path = require('path');
const url = require('url');

/* Keep a global reference of the window object, if you don't, the window will
be closed automatically when the JavaScript object is garbage collected. */
let tray = null
let mainWindow;

// ommfg gui
function runGUI() {
	// Optimize size definitions
	mainWindow = new BrowserWindow({width: 600, height: 480});
	tray = new Tray(path.join(__dirname, '../static/images/sof.png'))

	mainWindow.on('minimize', event => {
		event.preventDefault();
		mainWindow.hide();
	});

	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, '../static/gui.html'),
		protocol: 'file:',
	}));

	const contextMenu = Menu.buildFromTemplate([
		{label: 'show', click: () => {
				mainWindow.show();}},
		{label: 'Item2', type: 'radio', checked: true}
	])

	tray.setToolTip('This is my application.')
	tray.setContextMenu(contextMenu)
	mainWindow.on('closed', () => {
		mainWindow = null
	})

}
function runHeadless() {
	mainWindow = new BrowserWindow({show: false});
	tray = new Tray(path.join(__dirname, '../static/images/sof.png'))

	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, '../static/headless.html'),
		protocol: 'file:',
	}));

	const contextMenu = Menu.buildFromTemplate([
		{label: 'Quit', click: () => {
				mainWindow.close();}}
	])

	tray.setContextMenu(contextMenu)

	mainWindow.on('closed', () => {
		mainWindow = null
	})
}

function createWindow() {
	let args = process.argv;
	if (args.length <= 2) {
		runGUI(args)
	} else {
		runHeadless(args)
	}
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (mainWindow === null) {
		createWindow()
	}
});