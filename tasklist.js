const electron = require('electron');
const path = require('path');
const url = require('url');

// SET ENV
process.env.NODE_ENV = 'development';

const {app, BrowserWindow, Menu, ipcMain} = electron;

let index;
let addTask;

// Listen for app to be ready
app.on('ready', function(){
  // Create new window
  index = new BrowserWindow({});
  // Load html in window
  index.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes:true
  }));
  // Quit app when closed
  index.on('closed', function(){
    app.quit();
  });

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert menu
  Menu.setApplicationMenu(mainMenu);
});

// Handle add item window
function createAddTask(){
  addTask = new BrowserWindow({
    width: 300,
    height:200,
    title:'Add Shopping List Item'
  });
  addTask.loadURL(url.format({
    pathname: path.join(__dirname, 'addTask.html'),
    protocol: 'file:',
    slashes:true
  }));
  // Handle garbage collection
  addTask.on('close', function(){
    addTask = null;
  });
}

// Catch item:add
ipcMain.on('item:add', function(e, item){
  index.webContents.send('item:add', item);
  addTask.close(); 
  // Still have a reference to addWindow in memory. Need to reclaim memory (Grabage collection)
  //addWindow = null;
});

// Create menu template
const mainMenuTemplate =  [
  // Each object is a dropdown
  {
    label: 'File',
    submenu:[
      {
        label:'Add Item',
        click(){
          createAddTask();
        }
      },
      {
        label:'Clear Items',
        click(){
          index.webContents.send('item:clear');
        }
      },
      {
        label: 'Quit',
        accelerator:process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click(){
          app.quit();
        }
      }
    ]
  },
];
// If OSX, add empty object to menu
if(process.platform == 'darwin'){
  mainMenuTemplate.unshift({});
}

// Add developer tools option if in dev
if(process.env.NODE_ENV !== 'production'){
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu:[
      {
        role: 'reload'
      },
      {
        label: 'Toggle DevTools',
        accelerator:process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      }
    ]
  });
}
