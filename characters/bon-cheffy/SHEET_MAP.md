# Bon Cheffy sheet map

Pack folder: `characters/bon-cheffy/`
Canon: **Jonathan Lock** - floating white chef hat + dark-purple outline + eyes + mouth only. No head/body. No secondary Figma props on sheet cells.

Sheet size: **1254x1254** (3x3 of 418x418), real alpha.

## Directions (`directions.png`) - procedural eye-shift

Source: eye-less SVG base (eye paths removed; yellow spark marks absent; **white hat band `Vector_3` `#F9FBFC` kept**). For each of 9 cells, composite **only** two solid black eye ovals at the look offset onto a copy of that base. Hat + band + mouth stay pixel-fixed.

| Cell | Direction (viewer) | Method |
|------|--------------------|--------|
| 0 | up-left | eyes shifted left+up (~12%/10% of hat width) |
| 1 | up | eyes shifted up |
| 2 | up-right | eyes shifted right+up |
| 3 | left | eyes shifted left (faces viewer left) |
| 4 | center | base pose |
| 5 | right | eyes shifted right |
| 6 | down-left | eyes shifted left+down |
| 7 | down | eyes shifted down |
| 8 | down-right | eyes shifted right+down |

Hat + band + mouth are pixel-fixed across cells (shoulder spread ~0%).

### Ghost-eye fix

Look-left / look-right previously showed faint center-eye remnants (semi-transparent outlines on magenta). Rebuild clears eyes completely from the base first, then pastes opaque procedural ovals - never blend or shift in place. Center-eye alpha on left/right cells is 0.

### White-band restore

Clean-up for the hat–mouth gap had dropped `Vector_3` (white band fill `#F9FBFC`) from the eye-less base, so the band rendered solid dark purple (`#2B2147`) from the outline silhouette. Restored `Vector_3` on `_base_eyeless.svg` / `_base_directions.svg`. Hard-clear only the open gap **below** the band (between band bottom and mouth), not the band itself. Magenta check: band strip under puff is mostly `#F9FBFC`, not dark purple.

## Reactions (`reactions.png`) - face-only

| Cell | Key | Source | Face encoding | Props stripped |
|------|-----|--------|---------------|----------------|
| 0 | blink | derived `base.svg` | both eyes -> horizontal closed arcs | - |
| 1 | heart | `smitten.svg` | pink heart-eyes + smile | floating hearts |
| 2 | sparkle | `razz.svg` | wink + tongue (mouth) | side pink strokes |
| 3 | surprised | `shock.svg` | tall ovals + O-mouth | yellow marks |
| 4 | wink | derived `base.svg` | viewer-right eye closed | - |
| 5 | bashful | `invalid-email.svg` | ovals + frown | sweat, warning triangle |
| 6 | sleepy | `link-expired.svg` | closed sad arcs + frown | tears, broken-link icon |
| 7 | dizzy | `error.svg` | slanted angry eyes + frown | red anger vein |
| 8 | delighted | derived from `base.svg` (fresh-start motif) | upward happy closed arcs + smile | butterfly omitted entirely |

Every reaction cell keeps its white hat-band fill (derived cells use restored `Vector_3`; expression `_face_*.svg` files preserve each file's white-band path).

## Build notes

- Directions method: **procedural eye-shift** (hero frames were reference only).
- Pack name: `bon-cheffy` only.
- Verify (this ship): boop shift 0.00px, palette ~88.7%, width change ~11.5%.
