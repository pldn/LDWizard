# Upgrading

## Version 1.1.2 to 2.0.0

* In your configuration file replace

    ```ts
    export default wizardConfig;
    ```

    With

    ```ts
    globalThis.config = wizardConfig;
    ```

* Add `--add.ignore-engines true` to your `.yarnrc` file (or create one at the root of your project)
* Upgrade to node version 18
