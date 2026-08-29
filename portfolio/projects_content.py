# -*- coding: utf-8 -*-
"""Project content, rewritten from the Canva deck.

Every claim traces back to something stated or shown in the source. Where the
deck is silent — budgets, metrics, team size, dates — this stays silent too.

Shape is deliberately uniform: one overview paragraph, then two to four
labelled points. The labels vary with what the source actually supports, so a
brand project isn't forced into a product-design template.
"""

LLOYDS_1 = ("https://www.figma.com/proto/pW0xltxYTtqZCBrYiQzO0t/SuvrasiS"
            "?page-id=46%3A6179&node-id=56-8202&viewport=295%2C316%2C0.13"
            "&t=gIh6UJJ7fHhbnS7x-1&scaling=min-zoom&content-scaling=fixed"
            "&starting-point-node-id=56%3A8202&show-proto-sidebar=1")
LLOYDS_2 = ("https://www.figma.com/proto/pW0xltxYTtqZCBrYiQzO0t/SuvrasiS"
            "?page-id=46%3A6179&node-id=56-9255&viewport=-749%2C485%2C0.13"
            "&t=igKPIZqL2HtuyuZ2-1&scaling=min-zoom&content-scaling=fixed"
            "&starting-point-node-id=56%3A6864&show-proto-sidebar=1")
LLOYDS_3 = ("https://www.figma.com/proto/pW0xltxYTtqZCBrYiQzO0t/SuvrasiS"
            "?page-id=46%3A6179&node-id=56-6903&viewport=-3051%2C452%2C0.25"
            "&t=JpXexfOSktroFKdD-1&scaling=min-zoom&content-scaling=fixed"
            "&starting-point-node-id=56%3A6864&show-proto-sidebar=1")

# title, client, discipline, overview, [(label, detail)], pages, links, wide
PROJECTS = [

    ("THE LINE", "NEOM", "Concept · AI product design",
     "THE LINE is NEOM's linear city in Saudi Arabia — zero-car, zero-street, powered by "
     "renewable energy. This concept asks how AI could make daily life inside it feel "
     "intuitive rather than engineered, adapting the city to the person instead of the "
     "other way round.",
     [("Approach",
       "Built around distinct resident personas, each with their own needs, motivations "
       "and lifestyle, then traced end-to-end through a single journey."),
      ("Solution",
       "Intelligent search, contextual recommendations, personalised customisation and "
       "AI-driven services that read individual preferences, behaviours and goals."),
      ("Shown here",
       "The persona set, then one resident's path from search and refinement through "
       "property customisation, interior views, privilege offers and an AI assistant "
       "scheduling on her behalf.")],
     [6, 7, 8, 9, 10], [], True),

    ("Verve Mobile Banking", "Self-initiated", "Product design · Design system",
     "A mobile banking product built as an experiment in AI-assisted design tooling — "
     "exploring Figma MCP alongside Cursor and Figma Make to see how far they could "
     "reshape a working design process.",
     [("Product",
       "Onboarding, biometric face authentication, account balance, spending activity "
       "and transaction views across a connected set of screens."),
      ("Design system",
       "Verve Design System v3.0: brand and logo construction, design principles, a full "
       "colour system, navigation patterns and CTA states."),
      ("Takeaway",
       "The tooling changed the workflow rather than just the output — described in the "
       "source as a genuine shift in how the work gets made.")],
     [11, 12], [("Live prototype", "https://verve.figma.site/")], False),

    ("Nexyra", "Nexyra", "Web · Design system",
     "A responsive, mobile-first services site for an AI and consulting business, built "
     "to make a complex and abstract offering legible to a first-time visitor.",
     [("Outcome",
       "Strong visual hierarchy, seamless navigation and a premium, modern interface."),
      ("Brand foundation",
       "The Nexyra mark, built on a purple-to-blue gradient and wide letter spacing, "
       "expressing the four brand pillars: innovation, intelligence, elegance and a "
       "future-forward outlook."),
      ("Design system",
       "v2.0 — colour, typography, navigation and CTA patterns, form elements and "
       "responsive representations across breakpoints.")],
     [13, 14, 15], [("Visit the website", "https://nexyra.figma.site/")], False),

    ("Lloyd's Travel", "Lloyds Banking Group", "Agentic AI · Product design",
     "Smarter travel, designed for you — an agentic AI travel hub that plans the trip "
     "before the customer asks. The premise: help people plan fast, spend wisely and stay "
     "in control of the budget throughout.",
     [("The idea",
       "The customer lands on the Travel Hub to find trips already built for them — "
       "duration, trip type, predicted budget and a recommended itinerary. All that's "
       "left is to confirm and book."),
      ("Agentic behaviour",
       "Change the budget and the agent scans the web to rebuild booking options across "
       "the whole itinerary, then assembles and displays the revised trip before booking."),
      ("Always-on assistant",
       "A contextual AI agent sits alongside the journey for quick tips, and opens into a "
       "full conversation for customers who want to build the trip with it."),
      ("Also shown",
       "Three interactive prototypes, the AI travel slides, and a nudging tool for "
       "in-context budget prompts.")],
     [16, 17, 18, 19, 20],
     [("Concept 01 prototype", LLOYDS_1),
      ("Concept 02 prototype", LLOYDS_2),
      ("Concept 03 prototype", LLOYDS_3)], True),

    ("Project Verdant", "Lloyds Banking Group", "AI concept · Storyboarding",
     "Verdant was framed internally as a large opportunity: supporting British businesses "
     "in their growth while realising value from a deep data asset and making customers' "
     "lives better. The work was to make that proposition tangible enough to back.",
     [("Approach",
       "Researched and developed an understanding of the client's requirements for the AI "
       "project before any visual work began."),
      ("Craft",
       "AI imagery generated in Adobe Firefly, assembled into a visual storyboard "
       "supporting the proposal."),
      ("The vision",
       "An AI-powered offsite media network with loyalty integration — told through two "
       "personas, Laura, a marketing manager at a mid-corporate sports retail client, and "
       "Tom, a sports retail customer, with the value stated separately for advertiser "
       "and customer.")],
     [21, 22, 23, 24], [], False),

    ("Leukoplast Design System", "Leukoplast", "Design system · Web",
     "A new design system built outward from the Leukoplast brand and carried all the way "
     "through to the website and online profiles.",
     [("Scope",
       "Brand foundations through to page validation, UI components, navigation patterns "
       "and product page templates."),
      ("Applied",
       "Campaign and product pages — including the Leukoplast Eco sustainable dressings "
       "range — built from the system rather than designed one-off.")],
     [25, 26, 27, 28], [], False),

    ("IQOS Marketing Email", "Philip Morris International", "Email · Design system",
     "Email campaign design across a range of PMI products, with a design system "
     "underneath it to hold brand consistency as the volume of campaigns grew.",
     [("The problem",
       "Multiple products and campaigns pulling in different directions, with brand "
       "consistency getting harder to maintain at every release."),
      ("The answer",
       "A shared system of components and rules so each new campaign email starts from "
       "the brand rather than negotiating with it.")],
     [29, 30], [], False),

    ("Puramino Email Templates", "Reckitt · Mead Johnson", "Campaign email",
     "Campaign and product email templates for Puramino, defined as a reusable set rather "
     "than a series of individual designs.",
     [("Brand elements",
       "A documented kit — colour, heading hierarchy, body styles and button treatments — "
       "so templates stay on-brand as they are reused and extended."),
      ("Coverage",
       "Offer-led acquisition emails, product education and campaign sends, built "
       "responsive across desktop and mobile.")],
     [31, 32], [], False),

    ("All Things Beauty", "Unilever", "Pitch · User journey",
     "A successful project pitch for an AI-driven beauty publishing launch, argued through "
     "the people it would serve rather than through the technology behind it.",
     [("The cast",
       "Four personas — Mila, Trung, Ana and Scarlett — each at a different age and a "
       "different point in their relationship with beauty."),
      ("The argument",
       "The tools help each of them evolve their own personal beauty brand, from "
       "elevating a routine to building a skin-healing journey to finding an authoritative "
       "next chapter in skincare."),
      ("Method",
       "Every persona traced as a full journey — trigger, discovery, recommendation, "
       "purchase — with the reasoning written alongside each step.")],
     [33, 34, 35, 36, 37, 38, 39], [], True),

    ("HSBC Financial Planning", "HSBC", "Presentation design",
     "The playbook for the HSBC Financial Planning Service, designed to hold together "
     "across a long, image-led document.",
     [("Brand discipline",
       "Built to the HSBC digital colour palette, with the hexagon device used "
       "structurally to frame imagery rather than applied as decoration."),
      ("Consistency",
       "A repeating page architecture that survives dense text, full-bleed photography "
       "and mixed content without losing its shape.")],
     [40, 41], [], False),

    ("Meta Lead Solution Training Guide", "Meta · Publicis Media", "Brand · Presentation",
     "Design for a Meta training programme guide. The objective was a highly polished, "
     "visually refined document that aligns with and reflects Meta's rich and distinctive "
     "brand identity.",
     [("System",
       "Built to Meta's digital colour palette, with the infinity mark used as a framing "
       "device that carries imagery through cover, divider and content pages."),
      ("Deliverables",
       "Cover designs, divider slides and content layouts — a complete set rather than a "
       "template and a handful of examples.")],
     [42, 43, 44, 45], [], False),

    ("Capital Ability Network", "Capital Group", "Brand identity",
     "A design proposal for CAN, Capital Group's ability community, sitting alongside the "
     "company's other CG communities.",
     [("The idea",
       "The wordmark drops the crossbar from the 'A'. The visible disability is the "
       "missing bar; the invisible one is that it still reads as an A regardless. A second "
       "route shows nothing obviously missing, only something not quite right."),
      ("System",
       "Standard wordmarks for consistent use throughout, plus two more prominent options "
       "for advertising, aligned with the wider CG community identities."),
      ("Applied",
       "Promotional merchandise and outdoor advertising across billboard and street-level "
       "formats.")],
     [46, 47, 48, 49, 50], [], False),

    ("China Vista Strategy", "Capital Group", "Brand campaign",
     "A hero image for the China Vista strategy, created to run across every marketing "
     "surface for the launch of the LUX fund in 2023 — starting with the IB NBB in 2022.",
     [("The ask",
       "One image strong enough to carry NBBs, the landing page, brochures, advertising "
       "and PR, together with an appropriate tagline."),
      ("Approach",
       "Started from a creative brief built around a questionnaire, identified the theme "
       "and focus areas along with the look and feel, then ran competitor research across "
       "Fidelity China, JPM China and UBS China."),
      ("Process",
       "Collaborated with copy editors and the marketing team on multiple taglines to "
       "narrow the search, researched and shortlisted imagery for mock-ups, then created "
       "and shared a mood board with the client to finalise.")],
     [51, 52, 53], [], False),

    ("HP Campaigns & Digital Ads", "Hewlett Packard", "Campaign · Digital",
     "Campaign work, landing pages and digital advertising running on HP.com across "
     "consumer and business product lines.",
     [("Consumer",
       "The Sex and the City 2 tie-in — a Spring Collection landing page built around the "
       "film's release."),
      ("Business",
       "Product-led campaigns including the business-building colour work and the "
       "full-size goodness, half the full-size space desktop campaign."),
      ("Formats",
       "Landing pages and display advertising built to sit within the existing HP.com "
       "product experience.")],
     [54, 55, 56], [], False),

    ("Shaped by the early web", "Archive", "Web design",
     "Where the work started. The journey began in 2000, when Macromedia Flash ruled the "
     "web and, alongside Photoshop, was the go-to tool for building rich visual "
     "experiences.",
     [("The craft",
       "Blending Flash animation with HTML and CSS to turn static designs into dynamic, "
       "interactive interfaces — the challenge that made the medium interesting."),
      ("Where it led",
       "That early fascination with digital interaction evolved into a deep interest in "
       "Material Design and its design philosophy."),
      ("The archive",
       "A decade of sites across healthcare, orthodontics, technology, recruitment, "
       "travel and retail.")],
     [57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68], [], True),

    ("Logo Design", "Various clients", "Identity",
     "Marks built for clients across a spread of industries, each aiming for something "
     "distinct and memorable for the business behind it.",
     [("Range",
       "Healthcare and radiology, cancer care, executive transport, moving and logistics, "
       "insurance, lending, interactive agencies and energy.")],
     [69, 70], [], False),
]
