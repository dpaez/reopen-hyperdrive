# Seed content, download from another process


## Usage

1.
```sh
node content.js
```

This will display a key, copy that.

2.
```sh
node index.js [key]
```

Paste the key as an argument and run `index.js`

## Expected

`content.js` should seed a file with a key. `index.js` should download the content from the key passed as an arg. Content should be replicated and logged in stdout.

## Current

`index.js` is emitting an error saying data.json is not found. `ENOENT`
