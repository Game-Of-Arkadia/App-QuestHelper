# App-QuestHelper

QuestHelper is a WebApp that allows you to easily create the LuxDialogues config files.

## Prerequisites

You must have `npm` install on your computer.

You can check with:
```bash
npm -v
```

If you get an error, please look at the [npm installation guide](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

## How to launch

First of all, clone the repository with:
```bash
git clone git@github.com:Game-Of-Arkadia/App-QuestHelper.git
cd App-QuestHelper
```

Then install the node packages modules with the command
```bash
npm install
```
This can take several minutes depending of your internet connexion.


When everything is installed, you can launch the app with:
```bash
npm run dev
```

You should now be able to access the QuestHelper on:
```
http://localhost:8082
```


## Configure as a services

By default, the app is host on `::`, on port `8082` by default.

You can use env variables to change easily with:
- QUESTHELPER_HOST to configure the host
- QUESTHELPER_PORT to configure the port

The app uses only the `/` directory, so you shouldn't have any problem in setting a custom domain.


---

Enjoy !
