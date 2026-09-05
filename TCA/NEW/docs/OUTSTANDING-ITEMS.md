# Outstanding items — read before launch

Everything below is either unconfirmed, missing, or a decision that needs a
person to make it. Nothing here was invented to fill a gap; where source
material ran out, the site says so on the page rather than guessing.

Ordered by risk.

---

## 1. The refund amount contradicts itself — BLOCKER

The site says your deposit comes back when you attend. The supplied
`deposit-model.png` says **£8 is returned on a £10 deposit (80%), with £2
retained** for transaction and administration costs.

Those are different promises, and this is the single most trust-critical
number on the page. It currently appears in the deposit FAQ marked
*"Placeholder — confirm before launch"*.

**Decide:** is the refund the full deposit, or the deposit minus a stated
admin retention? Whichever it is, state the exact figure both on this page
and at the point of payment.

---

## 2. Illness policy — undefined

The model states plainly that a deposit is kept if you do not attend, with
no exceptions. No separate illness policy exists in any supplied material,
so none is published.

**Decide:** is there any provision — transferring a deposit to a later
session with notice, for example — or does the no-exceptions rule apply in
every case?

---

## 3. TCA-cancellation policy — undefined

What happens to a deposit when *TCA* cancels was never documented.

**Decide:** the refund timeframe and method, and whether attendees are moved
to the next session or refunded by default.

---

## 4. Waitlist form submits nowhere

Client-side validation and success state work. No data is stored or sent.
See *Wiring up the waitlist form* in `README.md`.

Also needed before it collects real data:
- A privacy notice, linked from the consent checkbox
- A lawful basis under UK GDPR for holding names, emails and phone numbers

---

## 5. Event listings are placeholders

All dates, times and venues are marked *"Placeholder listing"* on the page.
The session **types** are real — taken from TCA's published programme
description. The scheduling detail is not.

---

## 6. Two of three blog posts are empty

The Volunteer Verification post is real. The other two cards read *"Post
title to be added"*.

The current blog content could not be retrieved: `confidenceacademy.uk`
blocks automated access and the posts are not indexed anywhere. Send titles,
dates and opening lines and they drop straight into the existing card
component. All three cards currently link to the site homepage rather than
to individual post URLs.

---

## 7. Team photographs and biographies

Fourteen of fifteen team cards show initials and role only. Rayhana
Sultan's biography is real, drawn from TCA's published organisation profile.
No other biographies or headshots were supplied, and none were invented.

The card layout already accommodates a photograph and a two-line bio.

---

## 8. Verify the TikTok handle

The supplied URL is `https://www.tiktok.com/@.confidence.academy` — with a
leading full stop. TikTok usernames normally cannot begin with a period, so
this may be a typo for `@confidence.academy`. Used exactly as supplied;
TikTok blocks automated access so it could not be checked.

Instagram (`confidence.academy.uk`) looks structurally fine.

Facebook and YouTube icons are present but deliberately inert, labelled
"coming soon", pending real accounts.

---

## 9. Favicon vs. brand book

The brand book (§03) flags that **no icon-only version of the mark exists**,
and recommends a plain "TCA" monogram as the interim favicon — explicitly
*not* presented as the trademark — until a true icon lockup is commissioned
from the original designer.

The current favicon uses the supplied runner artwork, at the client's
direct instruction. That is a deliberate, informed departure from the brand
book, not an oversight. Flagging it so the decision is on record.

The brand book also notes no reversed (light-on-dark) logo exists. The
footer therefore places the logo on a white card, which is the sanctioned
treatment (§10) rather than a workaround.

---

## 10. Photography direction vs. the brand book

Photo credits have been removed and the imagery is now young-adult only, per
instruction. Both sit against the brand book: §06 requires diverse ages as
the rule for every gallery, and the site's own copy still promises sessions
for *everyone*, *all fitness levels* and *people returning to exercise*.

Removing credits is within the Unsplash licence — no compliance risk. The
imagery question is a positioning decision worth making consciously. Detail
in `PHOTOGRAPHY.md`.

---

## 11. Red hover on heading text

The text hover state on FAQ questions and blog titles is back to brand Red
`#CF142B`, at 5.55:1 against white. That clears AA comfortably, and is a
better result than the Sky Blue it replaced, which measured only 3.34:1.

Worth noting for the record: this is heading text turning red on hover,
which sits against the earlier instruction that red should not be used for
heading text. The default state is Royal Blue at 13.5:1 and only the
transient hover is red, so the rule holds for everything at rest. Flagged
so the exception is a decision rather than a drift.

---

## 12. Sky Blue category labels

The blog card categories (Volunteer recognition / Placeholder) are Sky Blue
`#4A90D9`. On the white card that measures **3.34:1**. At 11.5px bold
uppercase they count as normal text, so AA asks for 4.5:1 — a stable,
predictable shortfall rather than a moving one. The brand's own text-safe
variant `--sky-dark` `#1D4E89` gives **8.39:1** and is a one-word change if
you want it compliant.

The event card categories (Group exercise / Workshop / Online seminar) are
white, holding 5.98:1 in the worst case and 16.22:1 in the best against the
72% Royal Blue block. Sky Blue was tried there and reverted: it fell to
between 1.79:1 and 4.85:1 depending on the photograph, because the two blues
are neighbouring hues at similar lightness.

Resolved along the way: both label types were being overridden by
`.card p{color:var(--slate)}`, which outranked them on specificity. Every
colour set on those labels had been computing as slate regardless of what the
rule said. Both selectors are now specific enough to win.

---

## 12. Smaller checks

- **Obesity statistic.** The About copy cites "nearly 60% of the UK
  population in 2023/24". Health Survey for England data puts adults
  classed as overweight or obese nearer 64%, so the figure may understate
  the case or come from a different measure. Confirm the source.
- **`robots.txt`** references a sitemap that does not exist yet.
- **Social handles** for Facebook and YouTube, when created.
- **Individual blog post URLs**, when available.
