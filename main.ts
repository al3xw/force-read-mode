import { Plugin, MarkdownView, PluginSettingTab, Setting } from 'obsidian';


interface ForceReadModePluginSettings {
    targetFolderPaths: string[];  // Array of folder paths
}

const DEFAULT_SETTINGS: ForceReadModePluginSettings = {
    targetFolderPaths: [ ]	// Array of folder paths is empty by default
};


export default class ForceReadModePlugin extends Plugin {
    settings: ForceReadModePluginSettings;

    // Plugin initialization
    async onload() {
        // Load settings
        await this.loadSettings();

        // Register the settings tab
        this.addSettingTab(new ForceReadModeSettingTab(this.app, this));

        // Register an event for when the layout changes
        this.registerEvent(
            this.app.workspace.on('layout-change', this.onLayoutChange.bind(this))
        );
    }

    // Handle layout changes
    private async onLayoutChange() {
        // Get all open leaves in the workspace
        const leaves = this.app.workspace.getLeavesOfType('markdown');

        // Iterate over each leaf
        leaves.forEach((leaf) => {
            // Ensure the leaf has a MarkdownView
            if (!(leaf.view instanceof MarkdownView)) {
                return;
            }
        
            // Get the file currently opened in the leaf
            const file = leaf.view.file;
        
            // If no file is present, skip
            if (!file) {
                return;
            }
        
            // Check if the file is within any of the target folders or their subfolders
            const isInTargetFolder = this.settings.targetFolderPaths.some(path => file.path.startsWith(path));
            
            if (!isInTargetFolder) {
                return;
            }
        
            // Force the view into preview (read mode)
            leaf.setViewState({
                ...leaf.getViewState(),
                state: { mode: 'preview' } // Force preview (read mode)
            });
        });        
    }

    // Load settings
    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    // Save settings
    async saveSettings() {
        await this.saveData(this.settings);
    }
}

class ForceReadModeSettingTab extends PluginSettingTab {
    plugin: ForceReadModePlugin;

    constructor(app: any, plugin: ForceReadModePlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        // Add a setting for folder paths
        new Setting(containerEl)
            .setName('Force Read Mode').setHeading()
            .setName('Target Folder Paths')
            .setDesc('Specify the folder paths where markdown files should always open in read mode.')
            .addTextArea(text => text
                .setPlaceholder('Enter folder paths, one per line')
                .setValue(this.plugin.settings.targetFolderPaths.join('\n'))
                .onChange(async (value) => {
                    // Update the settings with the new folder paths
                    this.plugin.settings.targetFolderPaths = value.split('\n').map(path => path.trim()).filter(path => path.length > 0);
                    await this.plugin.saveSettings();
                }));
    }
}
