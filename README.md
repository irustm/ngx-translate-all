# ngx-translate-all

Automate translate Angular project

<img src="https://raw.githubusercontent.com/jamaks/ngx-translate-all/master/assets/screen2.png" alt="screen angular counter" width="600">

## Usage

```bash
npx ngx-translate-all --format ngx-translate --in ru --out en,fr --outPath src/assets/i18n

# or to define a tsconfig
npx ngx-translate-all --format ngx-translate -p ./ngx-translate-all-test/tsconfig.json --in ru --out en,fr --outPath ./ngx-translate-all-test/src/assets/i18n
```
## CLI options
- --format `ngx-translate` or `i18n`
- --in `ru`
- --out `en,fr`
- --outPath `./ngx-translate-all-test/src/assets/i18n`

## Migrate tool

[ngx-translate-migrate](https://github.com/irustm/ngx-translate-migrate) - Tool for migrate from ngx-translate to Angular i18n.

## License
MIT
