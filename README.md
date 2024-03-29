:warning: **Experimental**

# VS Code Streaming Screen

VS Code extension to display the code in a seperate window that can be used as a browser source for streaming software. This allows a display specifically adapted to the stream without having to change the display for the programmer/streamer.

![VS Code Streaming Demo](projects/sender/public/img/demo-animation.gif)

## Why?

I like to program on a big screen with very little font size, so that I can see as much as possible from the file I'm working on. But for a stream viewer this is nearly impossible to read, because of the streaming resolution and sometimes the distance to the screen. I tried to zoom in OBS, but then it becomes blurry very quickly and I often coded offscreen.

## How?

The idea is to use a seperate VS Code web instance and sync it with your real VS Code. You can configure the web instance how you want your viewers to see the code. The extension starts a local webserver (http://localhost:1870/), which you can access with any modern browser, or a browser source in any streaming software.

## Commands

(Type "Code Streaming" in command menu (Strg + Shift + P) to select command)

- Start
- Restart
- Stop
- EditStyles
- SaveStyles

## Features

- Cursor synchronization
- Syntax highlighting
- Cursor focusation
- Selection synchronization
- Text animations

## Requirements

To run this, you need just VS Code and any streaming software, which can show a browser source.

## Extension Settings

This extension contributes the following settings:

- `.port`: Port for local webserver and websocket connection. Must be the same as in web instance settings.

## Development

- Start development server: Open project in VS Code, go to "Run and Debug" and run script "Sender watch". A new VS Code debugging instance and two tasks (one for receiver and sender) should open. Let these tasks open, they will watch code and compile changes.
- Use development plugin: In VS Code debugging instance open commands menu (Strg + Shift + P), type "Code Streaming" and select "Start Code Streaming". The server should start and is available under configured port (For example: http://localhost:1870/).

## Known Issues

- No Text decoration sync (At the moment not possible, because there is no way to get them over the vscode extension api. At least I do not know of any solution)
- Cursor doesn't show, if you interacted with the web instance. Just reload the browser source/window and it should work again.
- Desync sometimes when to much text changes in to less time

## Additional Help

- CSS animations: ![GreenBoyGreen](https://github.com/GreenBoyGreen)

**Enjoy!**
