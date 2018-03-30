const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// ommfg gui
function runGUI() {
	// Optimize size definitions
	mainWindow = new BrowserWindow({width: 600, height: 480});

	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, '../static/gui.html'),
		protocol: 'file:',
	}));

	mainWindow.on('closed', () => {
		mainWindow = null
	})
}

// 4pr0z
function runHeadless() {
	mainWindow = new BrowserWindow({width: 800, height: 600});

	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, '../static/headless.html'),
		protocol: 'file:',
	}));

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