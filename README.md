# App-QuestHelper

QuestHelper is a WebApp that allows you to easily create the LuxDialogues config files via an interactive graphical interface.

## 🚀 Key Features of QuestHelper

-⚙️ **Multi-Conversations & Multiple Quests** : Manage multiple conversations and quests within each adventure, offering a rich and dynamic experience.

-🧩 **Create Interactive Dialogues** : Easily add custom dialogues for your characters, including interactive questions, redirections, and player choices.

-🎭 **Customizable Characters & Dialogue Presets** : Create and manage multiple characters with dialogue presets, enabling varied interactions tailored to each scenario.

-✍️ **Dynamic Character Name Editing** : Easily modify character names within dialogues for maximum flexibility, depending on the game's context.

-🛡️ **Fully Local** : All your data is securely stored in your browser, with nothing leaving your machine.

-📱 **Responsive Design** : Enjoy a seamless experience across Desktop PC, Laptop, and Mobile devices.


## 🛠️ How to Install 

> [!NOTE]
> Ensure that `npm` is installed on your system. You can verify the installation by running `npm -v`.
>
>If you encounter an error, please refer to the [npm installation guide](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) for assistance.

1. **Install the repository**:
Open your terminal and run the following command to download the git repository:

```bash
git clone git@github.com:Game-Of-Arkadia/App-QuestHelper.git
cd App-QuestHelper
```

2. **Install dependencies**:
After pulling the repo, install the node modules with:

```bash
npm install
```

This can take several minutes depending of your internet connexion.

3. **Running QuestHelper**:
After installation, you can start QuestHelper by executing:

```bash
npm run dev
```

This will start the QeustHelper server, which you can access at [http://localhost:8082](http://localhost:8082)


## 🐳 Configure QuestHelper as a service

## Configuration

By default, the app runs on `::` (all interfaces) and port `8082`. You can customize both settings using environment variables:

| Variable | Purpose |
|----------|---------|
| `QUESTHELPER_HOST` | Set the host address |
| `QUESTHELPER_PORT` | Set the port number |

**Example:**
```bash
QUESTHELPER_HOST='0.0.0.0' QUESTHELPER_PORT=3000 npm run dev
```

Since the app only uses the root `/` path, you can safely use a custom domain or reverse proxy without conflicts.


## 💬 Support

If you have any questions, suggestions, or need assistance, please open an issue.


---

Created by [Pamplemom](https://github.com/PamplemomM) - Enjoy !
