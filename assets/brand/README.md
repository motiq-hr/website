# Motiq Labs branding

The approved lockup is the integrated **M + otiq** wordmark with **Labs centered below the full wordmark**. The logo does not include “d.o.o.”. The official company name is used separately where needed.

`master.json` is the editable source. It contains the original M/gripper geometry and outlined paths for the approved Labs subtitle (15 October 2026). Run `npm ci` then `npm run brand:build`; all SVG and PNG assets are reproducible exports, with no runtime font dependency.

| File | Use |
| --- | --- |
| `motiq-horizontal.svg` / `.png` | Main Motiq Labs lockup, transparent background |
| `motiq-reversed.svg` / `.png` | White lockup for dark backgrounds |
| `motiq-black.svg` / `.png` | Black lockup |
| `motiq-forest.svg` / `.png` | Forest version, #1E3A2E |
| `motiq-stacked.svg` / `.png` | Compatibility alias for the approved Labs lockup |
| `motiq-icon*.svg` / `.png` | M symbol only |
| `app-icon*`, `favicon*` | Square app and browser icons |
| `social-preview.png` | Website link preview, 1200 × 630 |

Keep the original proportions and clear space. Use the M symbol for very small or square placements. Do not add shadows, gradients or frames to the logo. Use a reversed logo on dark surfaces. Older filenames are kept so existing links receive the current approved lockup.

Assets are served from `https://www.motiq.hr/assets/brand/`. For email signatures, insert an actual image attachment or use a publicly accessible HTTPS image; a `data:` image copied from a preview is not a reliable email delivery format.
