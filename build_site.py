# -*- coding: utf-8 -*-
"""Builds index.html from the content extracted out of the Canva deck."""

import html
import os

OUT = "/home/claude/site"

from projects_content import PROJECTS
from experience_content import EXPERIENCE

BIO = [
    "Strategic Brand &amp; Digital Leader with 23+ years of experience driving brand "
    "transformation, digital experience, and customer-centric product design across "
    "Financial Services, Technology, FMCG, Healthcare, Hospitality, and Smart Cities.",
    "Proven in developing brand strategy, governance, design systems, and AI-enabled "
    "digital experiences while leading global creative teams to strengthen brand presence, "
    "enhance customer engagement, and drive business growth.",
    "Expertise includes Brand Management, Design Leadership, Product Design, UX/UI, "
    "executive stakeholder management, and building scalable, customer-focused brand "
    "ecosystems that connect strategy, creativity, and technology.",
]

SKILLS = [
    ("Brand &amp; leadership", [
        "Brand Strategy &amp; Positioning", "Brand Governance &amp; Brand Standards",
        "Brand Management", "Creative Leadership", "Digital Strategy",
        "Marketing Campaign Management", "Campaign Planning &amp; Execution",
        "Executive Stakeholder Management"]),
    ("Design &amp; experience", [
        "Product Design", "UX/UI Design", "Customer Experience Design", "Service Design",
        "Design Systems", "User Research", "Accessibility"]),
    ("Digital delivery", [
        "Digital Transformation", "Agile Delivery", "Design Operations",
        "Cross-functional Leadership", "Project &amp; Programme Management",
        "AI-powered Customer Experiences", "Innovation Strategy"]),
    ("Tools", [
        "Figma &amp; FigJam", "Figma MCP", "Claude Design", "Adobe Creative Suite",
        "Miro", "Jira &amp; Confluence", "Agile / Scrum"]),
]

EDUCATION = [
    ("2019", "Post Graduate Certificate in Marketing &amp; Brand Management",
     "MICA — Mudra Institute of Communications, Ahmedabad"),
    ("1998", "Bachelor of Commerce (Hons.)", "Calcutta University"),
]


def slug(t):
    return "".join(c if c.isalnum() else "-" for c in t.lower()).strip("-").replace("--", "-")


def project_html(p, i):
    title, client, disc, overview, points, pages, links, wide = p
    sid = slug(title)
    hero = pages[0]
    gallery = ",".join("s%02d" % n for n in pages)
    cls = "work__item work__item--wide" if wide else "work__item"
    count = len(pages)

    link_html = ""
    if links:
        link_html = '<p class="work__links">' + "".join(
            '<a href="%s" target="_blank" rel="noopener">%s <span aria-hidden="true">\u2197</span></a>'
            % (html.escape(u, quote=True), html.escape(t)) for t, u in links
        ) + "</p>"

    pts = "".join(
        '<div class="work__point"><dt>%s</dt><dd>%s</dd></div>' % (lab, txt)
        for lab, txt in points
    )

    return f'''
        <article class="{cls}" id="{sid}">
          <p class="work__meta"><span>{client}</span><span>{disc}</span></p>

          <button class="work__open" type="button"
                  data-gallery="{gallery}"
                  data-title="{html.escape(title, quote=True)}"
                  aria-label="View {html.escape(title, quote=True)} \u2014 {count} images">
            <span class="work__frame">
              <img src="assets/thumb/s{hero:02d}.jpg" alt="{html.escape(title, quote=True)}"
                   loading="lazy" decoding="async" width="1800" height="1012">
              <span class="work__count">{count} {'image' if count == 1 else 'images'}</span>
            </span>
          </button>

          <div class="work__body">
            <h3 class="work__name">{title}</h3>
            <div class="work__text">
              <p class="work__overview">{overview}</p>
              <dl class="work__points">{pts}</dl>
              {link_html}
            </div>
          </div>
        </article>'''


def skills_html():
    out = []
    for name, items in SKILLS:
        lis = "".join("<li>%s</li>" % s for s in items)
        out.append(f'<div class="caps__group"><h3>{name}</h3><ul>{lis}</ul></div>')
    return "\n        ".join(out)


def experience_html():
    out = []
    for when, org, place, roles, summary, highlights in EXPERIENCE:
        # one title held across two postings shouldn't print twice
        grouped = []
        for r, d in roles:
            if grouped and grouped[-1][0] == r:
                grouped[-1][1].append(d)
            else:
                grouped.append([r, [d] if d else []])
        rh = "".join(
            f'<li><span class="track__role">{r}</span>'
            + "".join(f'<span class="track__detail">{d}</span>' for d in ds)
            + "</li>"
            for r, ds in grouped
        )
        hh = ""
        if highlights:
            hh = '<ul class="track__wins">' + "".join(
                f"<li>{h}</li>" for h in highlights) + "</ul>"

        out.append(f'''<li>
          <p class="track__when">{when}</p>
          <div class="track__main">
            <h3 class="track__org">{org}</h3>
            <p class="track__where">{place}</p>
            <ul class="track__roles">{rh}</ul>
            <p class="track__summary">{summary}</p>
            {hh}
          </div>
        </li>''')
    return "\n        ".join(out)


def education_html():
    return "\n        ".join(
        f'''<li>
          <p class="track__when">{y}</p>
          <h3 class="track__org">{d}</h3>
          <p class="track__where">{i}</p>
        </li>''' for y, d, i in EDUCATION
    )


nav_projects = "".join(project_html(p, i) for i, p in enumerate(PROJECTS))

DOC = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Suvrasis Pal — Brand &amp; Digital Leader</title>
<meta name="description" content="Portfolio of Suvrasis Pal — brand and digital leader with 23+ years in brand strategy, design systems and AI-enabled product experience. London, UK.">
<!-- Once you have a domain, add: <link rel="canonical" href="https://yourdomain.com/"> -->

<meta property="og:title" content="Suvrasis Pal — Brand &amp; Digital Leader">
<meta property="og:description" content="23+ years of brand transformation, digital experience and customer-centric product design.">
<meta property="og:type" content="website">
<meta property="og:image" content="assets/full/s06.jpg">
<meta name="twitter:card" content="summary_large_image">

<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..125,400..800&family=DM+Mono:wght@400;500&family=Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,300..500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/style.css">

<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Suvrasis Pal",
  "jobTitle": "Brand & Digital Leader",
  "address": {{ "@type": "PostalAddress", "addressLocality": "London", "addressCountry": "UK" }},
  "sameAs": ["https://www.linkedin.com/in/suvrasis/"]
}}
</script>
</head>
<body>

<a class="skip" href="#main">Skip to content</a>

<header class="bar">
  <div class="shell bar__inner">
    <a class="bar__mark" href="#top">Suvrasis&nbsp;<b>Pal</b></a>
    <nav class="bar__nav" aria-label="Sections">
      <a href="#work">Work</a>
      <a href="#about">About</a>
      <a href="#capabilities">Capabilities</a>
      <a href="#experience">Experience</a>
      <a href="#contact">Contact</a>
    </nav>
  </div>
  <div class="progress" aria-hidden="true"></div>
</header>

<main id="main">

  <section class="hero shell" id="top">
    <p class="eyebrow">Portfolio — Brand &amp; digital leader — London, UK</p>

    <h1 class="hero__name">
      <span>Suvrasis</span>
      <span class="is-outline">Pal</span>
    </h1>

    <div class="hero__body">
      <div>
        <p class="hero__lede">
          Brand transformation, digital experience and customer-centric product
          design — across financial services, technology, FMCG, healthcare,
          hospitality and smart cities.
        </p>
        <a class="ulink" href="#work">See the work ↓</a>
      </div>

      <dl class="hero__meta">
        <div><dt>Currently</dt><dd>Head of Brand &amp; Digital,<br>The Confidence Academy</dd></div>
        <div><dt>And</dt><dd>Web Design Consultant,<br>Akoni Technologies</dd></div>
        <div><dt>Focus</dt><dd>Brand · Product &amp; UX · AI experience</dd></div>
        <div><dt>Experience</dt><dd>23+ years</dd></div>
      </dl>
    </div>
  </section>

  <section class="section" id="work">
    <div class="shell">
      <div class="section__head">
        <h2 class="section__title">Selected work</h2>
        <p class="section__note">
          Sixteen projects, from AI-driven city concepts and agentic banking prototypes
          to design systems, brand identity and campaign work. Open any one to page
          through it.
        </p>
      </div>

      <div class="work">{nav_projects}
      </div>
    </div>
  </section>

  <section class="section" id="about">
    <div class="shell">
      <div class="section__head">
        <h2 class="section__title">About</h2>
      </div>

      <div class="about">
        <div class="about__portrait">
          <img src="assets/portrait.jpg" alt="Portrait of Suvrasis Pal" width="1000" height="1000" loading="lazy">
        </div>

        <div class="about__text">
          <p>{BIO[0]}</p>
          <p>{BIO[1]}</p>
          <p>{BIO[2]}</p>
          <p class="about__aside">
            The journey began in 2000, when Macromedia Flash ruled the web. Alongside
            Photoshop it was the go-to tool for rich visual experiences, and the challenge
            of blending Flash animation with HTML and CSS turned static designs into
            interactive ones. That early fascination with digital interaction became a
            lasting interest in design systems and how they hold experience together.
          </p>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="capabilities">
    <div class="shell">
      <div class="section__head">
        <h2 class="section__title">Capabilities</h2>
      </div>
      <div class="caps">
        {skills_html()}
      </div>
    </div>
  </section>

  <section class="section" id="experience">
    <div class="shell">
      <div class="section__head">
        <h2 class="section__title">Experience</h2>
      </div>
      <ol class="track">
        {experience_html()}
      </ol>

      <h3 class="sub">Education</h3>
      <ol class="track track--tight">
        {education_html()}
      </ol>
    </div>
  </section>

  <section class="section contact" id="contact">
    <div class="shell">
      <p class="eyebrow">Work with me</p>
      <h2 class="contact__title">Building digital products, brands and experience.</h2>

      <form class="cform" id="cform" novalidate>
        <!-- Web3Forms public access key. Public by design: it identifies the
             destination inbox and grants no account access. Submissions are
             delivered to whichever address this key was registered with. -->
        <input type="hidden" name="access_key" value="6a434485-55fa-4f55-9dba-e4066a8c6835">
        <input type="hidden" name="subject" value="New message from your portfolio">
        <input type="hidden" name="from_name" value="Suvrasis Pal portfolio">

        <!-- honeypot: bots fill it, people never see it -->
        <input type="checkbox" name="botcheck" class="cform__pot" tabindex="-1" autocomplete="off">

        <div class="cform__row">
          <p class="cform__field">
            <label for="cf-name">Full name</label>
            <input id="cf-name" name="name" type="text" autocomplete="name"
                   required aria-describedby="cf-name-err">
            <span class="cform__err" id="cf-name-err" hidden></span>
          </p>
          <p class="cform__field">
            <label for="cf-email">Email</label>
            <input id="cf-email" name="email" type="email" autocomplete="email"
                   required aria-describedby="cf-email-err">
            <span class="cform__err" id="cf-email-err" hidden></span>
          </p>
        </div>

        <p class="cform__field">
          <label for="cf-message">Details</label>
          <textarea id="cf-message" name="message" rows="5"
                    required aria-describedby="cf-message-err"></textarea>
          <span class="cform__err" id="cf-message-err" hidden></span>
        </p>

        <div class="cform__foot">
          <button class="cform__send" type="submit">Send message</button>
          <p class="cform__status" id="cf-status" role="status" aria-live="polite"></p>
        </div>
      </form>

      <ul class="contact__list">
        <li><a href="https://www.linkedin.com/in/suvrasis/" target="_blank" rel="noopener"><span>LinkedIn</span><span>linkedin.com/in/suvrasis&nbsp;↗</span></a></li>
        <!-- Add your email: uncomment this line and replace both addresses below.
        <li><a href="mailto:you@yourdomain.com"><span>Email</span><span>you@yourdomain.com&nbsp;↗</span></a></li>
        -->
        <li><span class="contact__static"><span>Based in</span><span>London, UK</span></span></li>
      </ul>
    </div>
  </section>

</main>

<footer class="foot">
  <div class="shell foot__inner">
    <span>© <span id="yr">2026</span> Suvrasis Pal</span>
    <span>London, UK</span>
  </div>
</footer>

<!-- lightbox -->
<div class="lb" id="lb" hidden role="dialog" aria-modal="true" aria-label="Project viewer">
  <div class="lb__bar">
    <p class="lb__title" id="lbTitle"></p>
    <p class="lb__count" id="lbCount"></p>
    <a class="lb__full" id="lbFull" href="#" target="_blank" rel="noopener">Full size ↗</a>
    <button class="lb__close" id="lbClose" type="button" aria-label="Close viewer">Close ✕</button>
  </div>
  <button class="lb__nav lb__nav--prev" id="lbPrev" type="button" aria-label="Previous slide">‹</button>
  <figure class="lb__stage"><img id="lbImg" src="" alt=""></figure>
  <button class="lb__nav lb__nav--next" id="lbNext" type="button" aria-label="Next slide">›</button>
</div>

<script src="js/main.js"></script>
</body>
</html>
'''

os.makedirs(OUT, exist_ok=True)
with open(os.path.join(OUT, "index.html"), "w") as f:
    f.write(DOC)

print("index.html written —", len(PROJECTS), "projects,",
      sum(len(p[5]) for p in PROJECTS), "slides")
