<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/brand/motiq-reversed.svg">
  <img src="assets/brand/motiq-horizontal.svg" alt="Motiq" width="220">
</picture>

# Motiq website

Public website and canonical brand assets for [Motiq](https://www.motiq.biz), an engineering team working across private AI, robotics, automation and cloud infrastructure.

The site is static HTML, CSS and JavaScript, with English (`index.html`) and Croatian (`hr.html`) pages. GitHub Pages publishes the root of `master` to **www.motiq.biz**.

## Local preview

```sh
python3 -m http.server 8766 --bind 127.0.0.1
```

Open `http://127.0.0.1:8766`. Check both languages, light/dark themes and mobile layout before publishing. HTML references a content-hashed CSS export; after editing `css/style.css`, generate a matching hashed copy and update both pages.

## Logo

[`assets/brand/master.json`](assets/brand/master.json) is the only editable source of the approved M + gripper logo. All SVG and PNG files are derived exports. The [brand guide](assets/brand/README.md) covers variants and usage.

```sh
npm ci
npm run brand:build
```

Node dependencies are used for asset generation only. The public website needs no Node server. The standalone `motiq.final.html` file is an earlier design draft; the live entry points are `index.html` and `hr.html`.
