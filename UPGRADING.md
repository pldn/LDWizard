# Upgrading

## 1.1.2 to 2.0.0

In your configuration file replace

```ts
export default wizardConfig;
```

With

```ts
window.config = wizardConfig;
```

And add `--add.ignore-engines true` to your `.yarnrc` file (or create one at the root of your project)
