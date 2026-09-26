# Lanternfall: Story Bible

Merged from `writers/lore.md`, `writers/characters.md` and `writers/timeline.md`. Where they disagree, `content-spec.md` wins. The playable prologue lives in `content/story.js`.

**Tone:** cute, funny, heartfelt. Short lines (max 100 characters, aim for 50 to 80). No walls of text. Every choice that matters shows a toast, emote, item or world change right away, and is remembered later.

## 1. World

**Candlemere** is a gentle world of tide-towns, lantern festivals and fat sheep. Its light is made of kept promises.

- **Glims:** every kept promise leaves a warm mote of light. Big promises, big light. A wedding vow can light a street.
- **Wicks:** glass lanterns that hold glims. They power ferries, mills and bridges. A healthy village glows gold after dusk.
- **Dimspots:** broken promises leave grey patches where color drains away. Stand in one and you forget small things.
- **Gameplay read:** glowing means cared for. Grey means something was let go.

**The mystery:** Puddlewick's wicks are going out one by one, and no promise was broken. Each dark wick steals a memory of someone loved. The glims are not dying. They are being *taken*.

**Deep history (kept light):** long ago the sky was dark (the Long Dusk). River folk sang the first light into a lantern, the **First Lantern**, holding the oldest promise of all: "the light will always come back." Its keepers, the **Wickwardens**, became a paperwork order. Their secret: the First Lantern is missing. The song that kept it survives only as a lullaby, the **Keeping Song**, whose last verse nobody understands.

**Factions:** the Wickwardens (blue coats, huge ledgers, hiding things), the Tidehands (river traders who seal deals with one hand in the water), and the Hush (grey-veiled pilgrims who vow to make no vows; many are grieving, not cruel).

## 2. Puddlewick and the Meadow

A crooked harbor on stilts where the **Tamble** meets the sea. Gulls on every roof, a wick on every door. It makes lantern glass, glowing fishing floats and plum cakes (served at promise feasts; nobody remembers why).

Founded 200 years ago around **Old Tamsy**, a ferrywoman who promised to row anyone across, any hour, for free. When she grew old, the village built **Tamsy's Span**, powered by her first glim. The Span "broke in a storm" the same night the first wick went out. It was sabotaged.

Across the river lies **Tamblemeadow**: clover, reeds, an old oak, wisps of wild starlight, and the first Dimspot anyone in Puddlewick has seen.

## 3. Cast

**Tavi** (hero, sprite Hunter). A river foundling who washed up in a basket with a lantern that never goes out. Runs errands for everyone. Says little; the player speaks through Kind, Bold and Sly choices. The lantern hums near Umbra's magic.

**Sella** (romance, sprite Woman). Lanternwright's apprentice. Proud, witty, laughs too loud at her own puns, burns toast, hides failed lanterns in a crate. Dream: light the meadow at night. Hates flattery, loves honesty. Tic: "Don't lick it."

**Village cast** (each has a voice tic):

| Name | Role | Sprite | Tic |
|---|---|---|---|
| Old Fen | elder | OldMan | calls Tavi a new wrong name each time (Tulip, Turnip, Toad) |
| Marla | innkeeper | Villager2 | calls everyone "sprout", keeps a soup ledger |
| Gil | fisher | OldMan2 | ends lines with "eh, fish?" |
| Hobb | carpenter | Villager3 | counts on his fingers when nervous (always) |
| Coral | merchant | Villager5 | prices everything, even smiles |
| Bram | bridge guard | Knight | salutes before and after lines |
| Nettie | gossip | Villager4 | "You didn't hear it from me." The village's memory |
| Nan Wren | lullaby singer | OldWoman | "dear heart"; forgetting her grandchild's name |
| Pim | Nan Wren's grandchild | Child | "BOOM!", names every rock Steve |

**Future companions:** Brusk (a monk who broke his vow of silence and cannot stop talking), Kiri (a swordswoman hunting the moths that stole her town's light). Optional second romance: Lucan, a runaway noble, terrible at fishing, excellent at fish poetry.

## 4. The Villain: Umbra, the Hushwarden

Once the most gifted Wickwarden alive, keeper of the First Lantern. As a child on the Flood Night, the village let its lanterns go dark to save oil, and he waited all night on the mudflats for a light that never came. Later he watched someone he loved wait forever on a promise never kept.

**His conclusion:** promises are cruelty on a delay. **His goal:** seal every glim in Candlemere into the First Lantern. No new promises, no broken ones, no night ever again. Everyone safe, forever.

- **Sympathetic:** he wants no one to ever wait at a dark window again. He is gentle with children and brings sweets.
- **Wrong:** a promise that cannot break is a cage. Taking the glims takes the memories they were made from.
- **Motif:** grey moths (they circle his hat, and appear wherever light goes missing), violet flame.
- **Prologue:** first a hungry **Hooded Stranger** at the inn, then the polite **Lantern Inspector** in the plaza, who names himself at the end.
- **Secret (Ch3):** Tavi's lantern holds the last free glim of the First Lantern. Umbra himself set that basket on the river. Tavi is the thing he once saved.

## 5. Romance Arc (Sella)

Affinity `aff_sella`, 0 to 5. Greetings change by tier:

| Tier | Greeting |
|---|---|
| 0 | "Oh. It's you. Mind the glass, please." |
| 1 | "Evening, Tavi. Need a wick trimmed, or just loitering?" |
| 2 | "Tavi! Perfect timing. Hold this. Don't lick it." |
| 3 | "I saved you the good stool. The one that doesn't wobble." |
| 4 | "You're late. I was worried. I was NOT worried. Hi." |

**Prologue moments:** (1) the lopsided lantern: honesty +1, flattery -1; (2) the moth stall: share your lantern +1, "what's in it for me" -1; (3) carrying planks: accept help +1, tease her +1, "I don't need help" -1; (4) her reaction to rotten planks (-1 if you shrug) and to the wisp (+1 befriended, -1 if you say "light is light"); (5) the **shared lantern walk** home if affinity is 2 or more (+1, `shared_walk`).

**Later:** Ch1 first hand-hold, Ch2 she admits fear of the dark, Ch3 rooftop confession (accept, defer, decline), Ch4 tending scene and their own lullaby, Ch5 she sings the Keeping Song with Tavi if trust is high. Callback line in Ch3: "You didn't let me walk in the dark."

## 6. Chapter Plan

**Prologue: The Broken Bridge** (playable slice, 15 to 25 minutes)
1. Tavi wakes at dusk. Old Fen: Nan Wren's wick went out; she is forgetting her song; only meadow starlight can help. Gives 10 gold.
2. Hobb needs 3 Good Planks, or can rush it with rotten ones. Planks: Gil (for a promise to find his bobber), Coral (10 gold, or fix her moth-cursed lantern with Sella), and the inn crates (under a cat).
3. Side beats: Marla's lost memory of her husband; the Hooded Stranger asks for food; Sella's jar and plank-carrying.
4. At the mended break, Tavi's lantern hums: the beams were cut. Keep or toss the violet shard. Tell Bram the truth or keep quiet. Night falls.
5. Meadow: bottle the wisp or befriend it; fetch Gil's bobber from the reeds; walk lost Pim home; touch the Dimspot (a memory flash: "I'll come back for you, little light").
6. Heal Nan Wren (full with the jar, half with the wisp). She sings the Keeping Song's first lines. Sella offers the shared walk.
7. The Lantern Inspector waits by the well. He reacts to everything you did, names himself Umbra, and leaves. End card.

**Chapter 1: The Lantern Tax.** Wickwarden collectors arrive to take "surplus light". The collector is Umbra's true-believer friend (the rival). Nettie's "Moth Man" rumor comes true. Big choice: hide the village's shared stranger-lantern or pay the tax with it. Sella stands beside Tavi.

**Chapter 2: The Wisp Hollows.** Caves under the meadow; find the hidden well of starlight. A mentor who knew Umbra as a child. Forgive the mentor (learn the Keeping Song) or expose the Wardens (militia, mentor leaves).

**Chapter 3: The Capital of Bottled Stars.** Infiltrate Umbra's Lightworks. Learn where Tavi's lantern came from. Free the bottled glims (riot) or steal the blueprints (stealth). Rooftop confession.

**Chapter 4: The Flats of the Flood Night.** Walk through Umbra's memory of AK 981. Light a lantern for the child he was, or leave the past alone.

**Chapter 5: The First Lantern.** Stop the Great Sealing. Reseal the light (safe, dim) or open it to everyone (bright, risky, shared).

## 7. Consequence Ledger (prologue flags)

| Flag | Seen now | Echo later |
|---|---|---|
| `bridge_flimsy` | dark creaky bridge, Hobb and Bram nervous, Sella scolds | Span collapses in Ch1 floods; Ch5 approach is a detour |
| `stranger_fed` / `stranger_refused` | moth toast, Marla and Nettie gossip, Umbra's opening line | Umbra "takes your light last"; he hesitates once in Ch3 |
| `told_truth` / `kept_quiet` | Bram tells everyone or arrests clouds | village suspects sabotage early and resists the tax in Ch1 |
| `kept_shard` / `shard_tossed` | Umbra: "keep it warm" or "the river gives things back" | shard resonates in the Lightworks, unlocking the basket memory in Ch3 |
| `wisp_bottled` / `wisp_friend` | jar in hotbar or wisp follower; Sella reacts | wisp clans hostile or guiding in Ch2; friend wisp takes a hit in Ch5 |
| `singer_healed` / `singer_half` | all wicks relit and Pim's name remembered, or half a song | full: she teaches the lost verse in Ch2 |
| `child_escort` | Pim safe on the porch | mirrors the Flood Night; Umbra wavers in Ch4 |
| `shared_walk` | big heart toast, Nettie saw | Sella's Ch3 confession callback |
| `bobber_sold` / `gil_done` | glim toast or broken-promise toast, Gil sulks | Gil's boat and shanty (Ch1 river travel) |
| `stall_fixed` | Coral's lantern lit at night | Coral discounts; she refuses to sell to the Inspector |
| `marla_kind` | free cake, heart emote | Marla feeds the village in the Ch1 tax famine |

A hidden **Warmth vs Hoard** reading of these flags (sharing, mercy, honesty vs bottling, force, secrecy) steers the endings.

## 8. Endings

- **Every Window Lit** (high Warmth, wisp befriended, lantern lit for young Umbra, light opened): Umbra joins the song. The glims return to everyone, Puddlewick becomes the valley's festival town, Sella and Tavi relight the stranger's lantern together.
- **The Keeper** (mixed, or light resealed): the world is safe but dim. Tavi stays below as keeper, one lantern glowing up through the river each night. Sella sings to it. Umbra lives, humbled, rebuilding the Span.
- **The Bright Kingdom** (high Hoard): Umbra completes the Great Sealing. No night falls, no promises remain, the lullaby is forgotten. Last shot: Tavi's lantern flickers out under an endless, silent sky.

**Prologue end card:** one base line, one line per matching consequence (bridge, singer, walk, stranger, truth), then the tease: "Chapter 1: The Lantern Tax. The moths are coming."
