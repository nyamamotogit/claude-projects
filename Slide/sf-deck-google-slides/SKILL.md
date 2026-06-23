---
name: sf-deck-google-slides
description: Build Salesforce-branded Google Slides decks from the official Salesforce Corporate Template 2026. Copies the master template, trims to the layouts you need, and injects content via the Google Slides API while preserving the brand's master fonts (Avant Garde Demi SFDC + Salesforce Sans), color, and visual elements. TRIGGER when the user asks to create, build, generate, or draft a Google Slides presentation / deck / pitch / overview using the Salesforce brand template — by topic ("five slides on Agentforce") or by content brief. DO NOT TRIGGER when user wants HTML slides (use generate-slides), PowerPoint output, image-only mockups (use sf-diagram-nanobananapro), or edits to an existing non-template deck.
---

# sf-deck-google-slides — Salesforce-branded Google Slides decks

Copy → trim → inject content into the official Salesforce Corporate Template 2026, preserving the master's brand fonts, colors, and graphics. Output is a real Google Slides URL the user can hand off to anyone with Drive access.

## Prerequisites

- The user must have a Google Workspace MCP plugin loaded that exposes the following tools (under any namespace — common ones are `mcp__google-workspace__*`):
  - `copy_drive_file`
  - `get_presentation`
  - `get_page`
  - `batch_update_presentation`
  - `create_presentation` (fallback only, not the primary path)
- The user must have view access to the source template ID `15bBgTADtCxDmXeh4PJX3fZBz2yloMkzRepVU2KJoe6M` (Salesforce Corporate Template 2026, owned by the Brand Creative team). If they can't open it, they need to request access first — this skill cannot create assets without read access to the master.

## The template

- **File ID** — `15bBgTADtCxDmXeh4PJX3fZBz2yloMkzRepVU2KJoe6M`
- **Title** — Salesforce Corporate Template 2026 (last edited by Brand Creative on April 24, 2026 at time of skill authoring)
- **Page size** — 16:9 widescreen, 18288000 × 10287000 EMU
- **Master fonts** — Avant Garde Demi SFDC (titles, headings, big stat numbers), Salesforce Sans (body, captions, eyebrows, footers)
- **Slide count** — ~85 slides covering covers, agenda, content layouts, quotes/segues, devices, stats/timelines/calendar/tables, speakers, and thank-yous

The template ships every approved layout. This skill works by **deleting the layouts you don't need** rather than by re-skinning a blank deck — that way every kept slide already has the master's typography, color, and ornamental elements wired up.

## Workflow

1. **Confirm scope when vague** — if the user gives only a topic with no slide-count or audience hint, ask 1–2 questions: target slide count, audience (internal/external/exec), and one or two key messages they want the deck to land. Skip if the brief is already specific enough to outline.

2. **Outline before touching the API** — sketch the deck slide-by-slide with the chosen layout for each. A typical 5–8 slide deck mixes layouts: e.g. cover → segue → three-up cards → big stat → two-up cards → timeline → bold-statement closer. Avoid using the same layout for every slide — variety is part of the brand.

3. **Copy the template** — call `copy_drive_file` with `file_id = 15bBgTAD...` and a `new_name` matching the topic. The copy lands in the user's My Drive root with all 85 source slides.

4. **Trim** — call `get_presentation` to list slide IDs (the layouts you don't keep need to be deleted by ID). Build a `batch_update_presentation` request that:
   - `deleteObject` for every slide ID you don't want
   - `duplicateObject` for any layout you need more than once (e.g. two three-up card slides with different content)
   - `updateSlidesPosition` to reorder kept slides into your outline sequence

5. **Inject content** — for each kept slide:
   - Call `get_page` to get its shape (text-box) IDs
   - For every shape that holds placeholder copy, run a `deleteText` (textRange `ALL`) followed by an `insertText` to swap in your content **without touching `fontFamily`, `fontSize`, or `foregroundColor`** — the master styles them
   - **Do NOT use `replaceAllText`** for this. Placeholder strings in the template have hidden whitespace, smart quotes, and odd typos (e.g. `"Salesforce is aplatform for change."` is missing a space) that don't match what `get_presentation` reads back. Direct shape-level delete+insert is reliable; replaceAllText silently no-ops.
   - **Card shapes hold both header AND body in one text box.** When overwriting a card, write the full string `"<HEADER>\n<BODY>"` into the single shape. Do not split header and body across separate shapes — you'll either lose one or break the layout.
   - When you duplicate a slide via `duplicateObject`, the new copy gets fresh shape IDs prefixed `SLIDES_API*`. Always re-fetch them with `get_page` before injecting.

6. **Verify** — call `get_presentation` once at the end and skim the slide-by-slide text echo. If a slide still shows template placeholder copy ("Subtitle", "Footer", "Salesforce is a platform for change", "First level is Salesforce Sans Normal..."), you missed a shape.

7. **Hand back the edit URL.** Include a one-line caveat about any stats or claims that came from the LLM rather than a sourced number — those need owner verification before external use.

## Layout catalog (stable slide IDs in the source template)

These IDs are stable in `15bBgTADtCxDmXeh4PJX3fZBz2yloMkzRepVU2KJoe6M`. After copying, the IDs carry over to the copy unchanged, so you can target them directly.

### Covers
| ID | Use for |
|---|---|
| `g2f42db121f4_2_400` | Cover with title + subtitle + presenter contact block |
| `g2f42db121f4_2_482` | Cover variant 2 |
| `g2f42db121f4_2_623` | Cover variant 3 |

### Agenda + section dividers
| ID | Use for |
|---|---|
| `g2f42db121f4_2_2254` | Agenda with 6 numbered items |
| `g2f42db121f4_2_1795` | Segue (section divider) |
| `g38e250adfd8_2_242` / `_247` / `_252` | Segue variants |

### Title-and-content
| ID | Use for |
|---|---|
| `g2f42db121f4_2_703` | Title, single line, with body content + bullet hierarchy |
| `g3a32debb3bf_604_13` | Same, alt color treatment |
| `g2f42db121f4_2_727` | Title, two lines, hero copy + supporting paragraph |
| `g3a32debb3bf_604_66` | Same, alt color treatment |
| `g2f42db121f4_2_772` | Title, two columns — compare/contrast |
| `g3a32debb3bf_604_88` | Same, alt color treatment |
| `g2f42db121f4_2_802` | Title, three columns |
| `g3a32debb3bf_604_137` | Same, alt color treatment |

### Cards (multi-up)
| ID | Use for |
|---|---|
| `g2f42db121f4_2_1104` | Card large (single hero card) |
| `g3a32debb3bf_624_19` | Card large variant |
| `g3a42bf1ea24_185_13` | Card XL (single full-width card) |
| `g2f42db121f4_2_1177` | Cards — two up |
| `g3a32debb3bf_624_0` | Cards — two up variant |
| `g2f42db121f4_2_1242` | Cards — three up (header + body in same shape) |
| `g3a32debb3bf_604_137` | Three columns alt |
| `g2f42db121f4_2_1298` | Cards — four up |
| `g3a32debb3bf_604_508` | Cards — four up variant |
| `g3a32debb3bf_604_208` | Cards — five up |
| `g3a32debb3bf_624_8` | Cards — five up variant |
| `g3a32debb3bf_604_277` | Cards — five up variation |
| `g3a32debb3bf_604_421` | Cards — six up boxes |
| `g3a32debb3bf_604_438` | Cards — six up rectangles |
| `g3a32debb3bf_792_33` | Reflections / Next Steps (numbered four cards) |

### Image + content combos
| ID | Use for |
|---|---|
| `g2f42db121f4_2_874` | Image right, two lines title + body |
| `g2f42db121f4_2_959` | Image right large, two lines |
| `g38e250adfd8_14_4923` | Content left, card right |

### Quotes + bold statements
| ID | Use for |
|---|---|
| `g2f42db121f4_2_1451` | Quote with attribution |
| `g2f42db121f4_2_1762` | Quote variant |
| `g2f42db121f4_2_1492` | Bold statement (closer / hero text) |
| `g2f42db121f4_2_1535` | Big statement with subtitle |
| `g38e250adfd8_9_99` / `_104` / `_109` | Big statement color variants |

### Stats
| ID | Use for |
|---|---|
| `g2f42db121f4_2_1629` | Big stat with description (radial graphic) |
| `g3b67f368867_202_0` | Stat callouts — radial monochromatic |
| `g3b67f368867_202_47` | Three up: photos with stat |
| `g3b67f368867_202_65` / `_82` | Three up: photos with stat + radial variants |
| `g3b67f368867_202_106` | Three up: large stat container |
| `g3b67f368867_202_32` | Three up: photos with stat (alt) |

### Devices (product shots)
| ID | Use for |
|---|---|
| `g38e250adfd8_10_12` | Desktop product, two-line title |
| `g2f42db121f4_2_1920` | Mobile product, two-line title |

### Timelines / tables / calendar
| ID | Use for |
|---|---|
| `g3a42bf1ea24_185_24` | Timeline by quarters |
| `g3afb8df5a6c_725_3849` | Calendar (5-event row) |
| `g3afb8df5a6c_725_2843` / `_2835` | Table — Action Items |
| `g3afb8df5a6c_725_0` | Table cards — headline only |
| `g3afb8df5a6c_725_31` | Table cards — with subhead |
| `g3b67f368867_202_893` | Two tables — balance |

### Speakers
| ID | Use for |
|---|---|
| `g2f42db121f4_2_2158` | One speaker |
| `g2f42db121f4_2_2197` | Two speakers |
| `g2f42db121f4_2_1953` | Three speakers |
| `g2f42db121f4_2_2000` | Four speakers |
| `g2f42db121f4_2_2054` | Five speakers |
| `g3a32debb3bf_624_142` | Ten speakers |

### Thank-yous + closers
| ID | Use for |
|---|---|
| `g2f42db121f4_2_2323` / `_2326` | Thank-you slides |
| `g3a32debb3bf_624_2607` / `_2616` | Thank-you variants |

## Recipes

### "Five slides on <topic>"
Cover → three-up stats → three-up cards → big stat → bold statement closer.

### "10–12 slide overview deck"
Cover → segue → title-two-column → cards-three-up → big-stat → cards-four-up → image-right → quote → timeline → segue → cards-three-up → bold closer.

### "Customer pitch"
Cover → segue → big-statement → cards-three-up (the pillars) → cards-four-up (proof points) → quote → timeline → bold closer → thank-you.

### "Internal status update"
Cover → reflections-next-steps → cards-three-up (this period / next period / risks) → table-action-items → calendar → bold closer.

## Common pitfalls

- **Don't override fontFamily.** The template's master assigns Avant Garde Demi SFDC to titles and Salesforce Sans to body. Setting `fontFamily` on insertText breaks the brand and falls back to whatever Google Slides finds locally.
- **Don't duplicate shape boundaries.** A "card" in the template is one text box, not two. Header and body both live in the same shape and are styled by the master's paragraph rules. Overwriting only the header leaves a body that no longer matches.
- **Don't assume `replaceAllText` works.** It almost always silently no-ops on this template because the placeholder strings include non-breaking spaces and stray typos. Use `deleteText`/`insertText` per shape.
- **Verify slide count after deletion.** `get_presentation` should show exactly the kept slides plus any duplicates you created. If a `duplicateObject` was rejected (e.g. you tried to duplicate after deleting the source), the silent failure leaves you short.
- **Numbers are not sourced.** Anything you draft (adoption %, ROI, customer counts) is illustrative until verified — flag this clearly in your handoff message so the user knows to swap in real figures before sharing externally.
- **Image-bearing layouts copy with placeholder photos.** If your topic doesn't fit a "people / device / hero photo" placeholder, prefer a non-image layout — replacing photos via the API is hostile.

## When the user types `/sf-deck-google-slides <args>`

`$ARGUMENTS` is the topic + any constraints (slide count, audience, must-have sections). Treat empty `$ARGUMENTS` as a request to confirm scope before doing anything.
