# Chrome extension with Angular — from zero to a little hero

[Article - Chrome extension with Angular](https://medium.com/angular-in-depth/chrome-extension-with-angular-why-and-how-778200b87575)

## Background script

The background script is the extension’s event handler; it contains listeners for browser events that are important to the extension. It lies dormant until an event is fired then performs the instructed logic. An effective background script is only loaded when it is needed and unloaded when it goes idle.

## Content script

Extensions that read or write to web pages utilize a content script. The content script contains JavaScript that executes in the contexts of a page that has been loaded into the browser. Content scripts read and modify the DOM of web pages the browser visits.
We’re not going to touch these in this tutorial (well, almost)

## Popup (in browser action)
If a browser action has a popup, the popup appears when the user clicks the icon. The popup can contain any HTML contents that you like, and it’s automatically sized to fit its contents.

Spoiler: this is where we use Angular

## The Background Script

To remind you, background script is:
the extension’s event handler; it contains listeners for browser events that are important to the extension.

In our case we would like to listen to web navigation completed event, do the URL matching and enable the extension if there is a match.
1. Install the types for Chrome API: `npm i -D @types/chrome`
2. Add `chrome` to `types` entry in `tsconfig.app.json` like below:
```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./out-tsc/app",
    "types": ["chrome"]
  },
  "files": [
    "src/main.ts",
    "src/polyfills.ts",
    "src/background.ts"
  ],
  "include": [
    "src/**/*.d.ts"
  ]
}
```
## Compiling background script as part of Angular build
Since the background scripts run in a context different than the extension’s popup we cannot just add it to the scripts section in angular.json .
Anything that’s in scripts section is compiled by Angular CLI into scripts chunk and loaded by index.html (a popup context in our case).
This is also the reason we can’t just import the background script in main.ts or any other file that is compiled as part of popup build.
What we can do is creating another entry for background script in Webpack build that Angular CLI runs behind the scenes.
For that purpose we’ll use Custom Webpack Builder:
1. Install it: `npm i -D @angular-builders/custom-webpack`
2. Update angular.json :
```json
"projects": {
  "angular-chrome-extension": {
    ...
    "architect": {
      "build": {
        "builder": "@angular-builders/custom-webpack:browser",
        "options": {
          "customWebpackConfig": {
            "path": "./custom-webpack.config.js"
          }
          ...
        },
        ...
```
3. In the root of your workspace create a file called custom-webpack.config.js with the following content: 
```javascript
module.exports = {
    entry: { background: 'src/background.ts' },
}
```
4. Run ng build .


## Background page live reload

Currently the background script behaves much like the manifest — it is reloaded only when you reload the extension.
It is very annoying to go to Extensions page and press Reload button every time you change a name of a variable in the background script.

So what can be done here? Since we’ve already incorporated Custom Webpack Builder in our build chain we can benefit from it a bit more.

There is a [webpack-extension-reloader](https://www.npmjs.com/package/webpack-extension-reloader) plugin that does exactly what we want. It augments background script code with code that listens to the changes of the chunks and when there was a change in the background chunk it tells Chrome to reload the extension.
1. Install extension reloader plugin: `npm i -D webpack-extension-reloader`
2. Create a file named `custom-webpack-dev.config.js` in the root of your workspace:
```javascript
const ExtensionReloader = require('webpack-extension-reloader')
const config = require('./custom-webpack.config');

module.exports = {...config, 
    mode: 'development',
    plugins: [new ExtensionReloader({
        reloadPage: true,
        entries: {
            background: 'background'
        }
    })]
}
```
3. Add dev configuration to angular.json :
```json
      ...
      "architect": {
        "build": {
          ...
          "configurations": {
            "dev": {
              "customWebpackConfig": {
                "path": "./custom-webpack-dev.config.js"
              }
            },
            "production": {
          ...
```

Let’s make sure it works:
1. Run the build with this config: `ng build --watch --configuration=dev`
2. Reload the extension (the old background script still lacks the live reload code, so you have to do it one last time)
3. Navigate to http://google.com
4. See page action enabled
5. Go to background.ts and change the URL match pattern to blahblah
6. Navigate to http://google.com
7. See page action disabled

## Adding color picker

This will be an easy one. We will use ngx-color-picker component.
Install ngx-color-picker: npm i ngx-color-picker
Add ColorPickerModule to imports in app.module.ts:
```javascript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ColorPickerModule } from 'ngx-color-picker';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    ColorPickerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

3. Add color property to app.component.ts :
```javascript
export class AppComponent {
  color: string;
  constructor() { }
}
```

4. Replace default Angular content with color picker in app.component.html :
```html
<span [style.color]="color" 
  [cpToggle]="true" 
  [cpDialogDisplay]="'inline'" 
  [cpPositionRelativeToArrow]="true"
  [(colorPicker)]="color" 
  [cpOKButtonText]="'Apply'" 
  [cpOKButton]="true">
</span>
```
Refer to the color picker README for detailed API description

5. If you don’t want the white frame around the color picker remove the margins from body in styles.scss:
```css
body {
    margin: 0;
}
```

# AngularChromeExtension

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 10.0.6.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
# [angular-chrome-extension](https://medium.com/angular-in-depth/chrome-extension-with-angular-why-and-how-778200b87575)
