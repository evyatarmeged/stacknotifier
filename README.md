# Stack Overflow Notifier
> #### A cross-platform command line application for Stack Overflow addicts

### Linux
![lin1](https://i.imgur.com/UAeInyK.png)

![lin2](https://image.ibb.co/ceBLdy/linux_msg.png)

### Windows

![win1](https://image.ibb.co/iMChrJ/index.png)

![win2](https://image.ibb.co/joSMBJ/win2.png)

### Mac
![mac](https://image.ibb.co/fQsgQd/mac.jpg)

## Features
* Get **notifications** about new questions, inbox messages and reputation changes
* Built with **Electron** for **cross-platform** desktop notifications
* Grabbing an API token with **Selenium**, Stack Overflow Notifier will then use the **Stack Exchange API** to 
notify you about new inbox messages and reputation changes. Limited to 10,000 API calls a day.
* **Tray** icon for easy termination


## Installation
To run Stack Overflow Notifier you'll need to have [Electron](https://github.com/electron/electron) installed globally.<br>
To install it, run:<br>
```npm install electron --global```

Then install Stack Overflow Notifier using npm:<br>
`npm install stacknotifier --global`

*Note: To run the preceding commands, [Node.js](http://nodejs.org) and [npm](https://npmjs.com) must be installed.*

Or clone this repository and run with `electron src/app/main.js`<br>
 
## Usage
Run `stacknotifier` with the mandatory `-i` and `-t` for query interval and tags.<br>
All tags provided should be present in order for a question to match, so chaining many tags will
not yield many results.<br>
Specifying `username` and `password` should ideally be done only once, and they should be loaded
from the package's config.yaml with the `--config` flag onwards.<br>
If `--config` is called without arguments, stacknotifier will try to save/load a config.yaml in the stacknotifier folder,
else, it will look in the provided path.
Stack Overflow Notifier will try to re-use the previously obtained API token (up to 24h at the moment) for faster init time. 

##### Example
```
stacknotifier -i 2 -t javascript,node.js,electron
> Fetching [Javascript][Node.js][Electron] questions every 2 minutes
```
##### Available Flags 
```
Usage: stacknotifier [-i interval] [-t tags] [OPTIONAL]

Options:
-i, --interval <n>         Interval in minutes to query Stack Overflow for new questions. max: 60, min: 0.5
-t, --tags [tags]          Comma separated tags to filter questions by. Must match tags from the SOF tag list.
-u, --username [username]  Stack Overflow (Google) Username or Email
-p, --password [password]  Stack Overflow (Google) Password
-c, --config               Load/save credentials from this path. If config file path is not supplied,
                           will try to save to a default config file in the stacknotifier folder. File format should be YAML
--show-config              Show saved username and password
-h, --help                 output usage information
```

## A Word on Linux and Electron
I started Stack Overflow Notifier as a command line tool but after realizing Ubuntu's notification center
cannot respond to on-click events, I have thrown Electron in the mix as well.<br>
Designing a basic electron GUI version along with the CLI version seemed obvious but I had to stop 
due to lack of time and will hopefully get back to it in the near future.<br>

Currently tested on Ubuntu 18.04, notifications on-click work out of the box. Not sure about another distributions,
but seems like it should work ootb as well.<br> 
To enable on-click in Ubuntu 16.04 I had to switch from the default `notify-osd` and I
have found [this workaround](https://askubuntu.com/a/239928) which offers a working alternative.


## Contribute

PRs accepted, no special guidelines. Tips and suggestions are most welcome.

## License

MIT
