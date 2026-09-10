import json
from datetime import date, timedelta

# ---------- helpers ----------

def d(y, m, day):
    return date(y, m, day)

def nth_weekday(year, month, weekday, n):
    # weekday: Monday=0 ... Sunday=6
    first = date(year, month, 1)
    offset = (weekday - first.weekday()) % 7
    result = first + timedelta(days=offset + 7 * (n - 1))
    return result

def last_weekday(year, month, weekday):
    if month == 12:
        nxt = date(year + 1, 1, 1)
    else:
        nxt = date(year, month + 1, 1)
    last_day = nxt - timedelta(days=1)
    offset = (last_day.weekday() - weekday) % 7
    return last_day - timedelta(days=offset)

def iso(dt):
    return dt.isoformat()

# Easter Sundays (verified against gov.uk bank holidays + independent sources)
EASTER = {2026: date(2026, 4, 5), 2027: date(2027, 3, 28)}

events = []

def add(id_, name, dt, category, priority, desc, requirements, tasks=None, notes=""):
    events.append({
        "id": id_,
        "name": name,
        "date": iso(dt),
        "category": category,
        "priority": priority,
        "description": desc,
        "requirements": requirements,
        "tasks": tasks,  # None => assign template by priority later
        "notes": notes,
    })

# =====================================================================
# TASK TEMPLATES
# =====================================================================
FULL_TASKS = [
    "Event concept approved",
    "Copywriting completed",
    "Main event banner designed",
    "Social media graphics created",
    "Instagram post prepared",
    "Facebook post prepared",
    "TikTok content prepared",
    "Website updated",
    "Email/social campaign prepared",
    "Final approval completed",
    "Published",
]
STANDARD_TASKS = [
    "Concept approved",
    "Copywriting completed",
    "Social media graphics created",
    "Instagram post prepared",
    "Facebook post prepared",
    "Final approval completed",
    "Published",
]
LIGHT_TASKS = [
    "Content drafted",
    "Social media post prepared",
    "Final approval completed",
    "Published",
]

# =====================================================================
# SEASONAL / CULTURAL  (category: seasonal)
# =====================================================================
add("halloween-2026", "Halloween", d(2026,10,31), "seasonal", "high",
    "Spooky-season engagement moment. High social reach; great excuse for a fun, energetic confidence-building activity or open day.",
    "Themed banner, IG/FB/TikTok content, website banner, email blast.")
add("bonfire-night-2026", "Bonfire Night", d(2026,11,5), "seasonal", "medium",
    "Guy Fawkes Night — community bonfire/fireworks events create a natural tie-in for family and community messaging.",
    "Social graphics, community safety messaging, local event shout-outs.")
add("black-friday-2026", "Black Friday", d(2026,11,27), "seasonal", "high",
    "Major UK retail moment. Strong opportunity for membership offers and programme sign-up discounts.",
    "Offer graphics, email campaign, website banner, paid social push.")
add("cyber-monday-2026", "Cyber Monday", d(2026,11,30), "seasonal", "medium",
    "Digital extension of Black Friday — good for online bookings and digital programme sign-ups.",
    "Email reminder, social countdown graphics.")
add("small-business-saturday-2026", "Small Business Saturday UK", d(2026,12,5), "community", "low",
    "Celebrates UK small enterprises and community organisations — good local-partnership shout-out day.",
    "Social post celebrating local partners and community suppliers.")
add("giving-tuesday-2026", "Giving Tuesday", d(2026,12,1), "community", "medium",
    "Global day of generosity following Black Friday/Cyber Monday — strong fit for community fundraising or scholarship appeals.",
    "Appeal graphic, email, social posts, website donation banner.")
add("christmas-2026", "Christmas Day", d(2026,12,25), "seasonal", "high",
    "The biggest seasonal moment of the year. Warm, community-focused messaging; wind-down of term activities.",
    "Festive banner, video greeting, social content series, email newsletter, gift/voucher promotion.")
add("boxing-day-2026", "Boxing Day", d(2026,12,26), "seasonal", "low",
    "Good moment for 'New Year fitness prep starts here' soft messaging as people plan January goals.",
    "Light social teaser for January programmes.")
add("nye-2026", "New Year's Eve", d(2026,12,31), "seasonal", "medium",
    "Reflective, forward-looking moment — sets up New Year resolution messaging.",
    "Year-in-review graphic/video, countdown social content.")
add("nyd-2027", "New Year's Day", d(2027,1,1), "seasonal", "high",
    "Peak 'New Year, New You' interest — the single biggest annual window for new member acquisition.",
    "Campaign launch banner, email blast, paid social, website hero update.")
add("blue-monday-2027", "Blue Monday", d(2027,1,19), "mental-health", "medium",
    "Popularly dubbed the 'most depressing day of the year' — a valuable myth-busting/mental-health-positive messaging opportunity.",
    "Myth-busting social post, uplifting content series, mental health resource share.")
add("cny-2027-early", "Chinese New Year (Year of the Sheep)", d(2027,2,6), "seasonal", "low",
    "Recognises Lunar New Year for diverse local communities.",
    "Simple social greeting graphic.")
add("shrove-tuesday-2027", "Shrove Tuesday (Pancake Day)", d(2027,2,9), "seasonal", "low",
    "Light-hearted, family-friendly content moment.",
    "Fun social post/reel, family activity tie-in.")
add("valentines-2027", "Valentine's Day", d(2027,2,14), "family", "medium",
    "'Love yourself' / self-confidence angle; also a family and community connection moment.",
    "Self-love themed graphics, social content, email tie-in.")
add("st-patricks-2027", "St Patrick's Day", d(2027,3,17), "other", "low",
    "Light community/social engagement moment.",
    "Simple themed social post.")
add("mothers-day-2027", "Mother's Day (Mothering Sunday)", d(2027,3,7), "family", "high",
    "Family-focused celebration — strong angle for parent & child sessions and family membership offers.",
    "Family campaign graphics, email, in-centre signage, social content.")
add("spring-clean-2027", "Great British Spring Clean", d(2027,3,19), "community", "low",
    "National community litter-picking campaign (dates provisional pending Keep Britain Tidy confirmation) — good community-pride tie-in.",
    "Community event promotion, volunteer sign-up graphic.")
add("comic-relief-2027", "Comic Relief / Red Nose Day", d(2027,3,19), "community", "medium",
    "National fundraising day — strong fit for a fun fitness challenge fundraiser.",
    "Fundraising challenge graphic, social content, email, in-centre collection materials.")
add("easter-2027", "Easter Sunday", d(2027,3,28), "seasonal", "high",
    "Major seasonal holiday with school break — great family activity and open-day opportunity.",
    "Easter activity banner, family programme promotion, social content series, email newsletter.")
add("st-georges-2027", "St George's Day", d(2027,4,23), "other", "low",
    "Light national-pride community content moment.",
    "Simple themed social post.")
add("fathers-day-2027", "Father's Day", d(2027,6,20), "family", "high",
    "Family-focused celebration — strong angle for parent & child sessions and family membership offers.",
    "Family campaign graphics, email, in-centre signage, social content.")
add("eid-fitr-2027", "Eid al-Fitr", d(2027,3,10), "seasonal", "low",
    "Recognises the end of Ramadan for Muslim members and the wider community (date subject to moon sighting).",
    "Simple, respectful social greeting graphic.")
add("eid-adha-2027", "Eid al-Adha", d(2027,5,17), "seasonal", "low",
    "Recognises Eid al-Adha for Muslim members and the wider community (date approximate, subject to moon sighting).",
    "Simple, respectful social greeting graphic.")
add("diwali-2026", "Diwali", d(2026,11,8), "seasonal", "low",
    "Festival of Lights — inclusive community celebration moment.",
    "Simple social greeting graphic, community shout-out.")
add("diwali-2027", "Diwali", d(2027,10,29), "seasonal", "low",
    "Festival of Lights — inclusive community celebration moment.",
    "Simple social greeting graphic, community shout-out.")
add("black-friday-2027", "Black Friday", d(2027,11,26), "seasonal", "high",
    "Major UK retail moment. Strong opportunity for membership offers and programme sign-up discounts.",
    "Offer graphics, email campaign, website banner, paid social push.")
add("cyber-monday-2027", "Cyber Monday", d(2027,11,29), "seasonal", "medium",
    "Digital extension of Black Friday — good for online bookings and digital programme sign-ups.",
    "Email reminder, social countdown graphics.")
add("small-business-saturday-2027", "Small Business Saturday UK", d(2027,12,4), "community", "low",
    "Celebrates UK small enterprises and community organisations — good local-partnership shout-out day.",
    "Social post celebrating local partners and community suppliers.")
add("giving-tuesday-2027", "Giving Tuesday", d(2027,11,30), "community", "medium",
    "Global day of generosity following Black Friday/Cyber Monday — strong fit for community fundraising or scholarship appeals.",
    "Appeal graphic, email, social posts, website donation banner.")
add("christmas-2027", "Christmas Day", d(2027,12,25), "seasonal", "high",
    "The biggest seasonal moment of the year. Warm, community-focused messaging; wind-down of term activities.",
    "Festive banner, video greeting, social content series, email newsletter, gift/voucher promotion.")
add("boxing-day-2027", "Boxing Day", d(2027,12,26), "seasonal", "low",
    "Good moment for 'New Year fitness prep starts here' soft messaging as people plan January goals.",
    "Light social teaser for January programmes.")
add("nye-2027", "New Year's Eve", d(2027,12,31), "seasonal", "medium",
    "Reflective, forward-looking moment — sets up New Year resolution messaging.",
    "Year-in-review graphic/video, countdown social content.")

# Bank holidays (as standalone light-touch content moments)
add("early-may-2027", "Early May Bank Holiday", d(2027,5,3), "other", "low",
    "Long-weekend content moment — good for outdoor/community activity promotion.",
    "Simple social post encouraging outdoor activity.")
add("spring-bh-2027", "Spring Bank Holiday", d(2027,5,31), "other", "low",
    "Long-weekend content moment — good for outdoor/community activity promotion.",
    "Simple social post encouraging outdoor activity.")
add("summer-bh-2027", "Summer Bank Holiday", d(2027,8,30), "other", "low",
    "Long-weekend content moment ahead of the new school term.",
    "Simple social post; tease September programme launch.")

# =====================================================================
# FITNESS & WELLBEING (category: fitness)
# =====================================================================
add("nfd-2026", "National Fitness Day", d(2026,9,16), "fitness", "high",
    "ukactive's flagship UK-wide celebration of physical activity — a headline moment for TCA's mission.",
    "Hero banner, open-session promotion, IG/FB/TikTok content, website takeover, local press outreach.")
add("world-heart-day-2026", "World Heart Day", d(2026,9,29), "fitness", "medium",
    "Global awareness day for heart health — natural fit for cardio/fitness programme messaging.",
    "Educational social graphics, blog/website content.")
add("stress-awareness-2027", "Stress Awareness Month begins", d(2027,4,1), "mental-health", "medium",
    "Month-long UK awareness campaign — strong fit for combined fitness/mental-health messaging on stress management.",
    "Content series across the month, downloadable resource, social campaign.")
add("sport-dev-peace-2027", "International Day of Sport for Development and Peace", d(2027,4,6), "fitness", "low",
    "UN day recognising sport's power to drive social change — aligns with TCA's community mission.",
    "Mission-led social post, website blog feature.")
add("world-health-day-2027", "World Health Day", d(2027,4,7), "fitness", "high",
    "WHO's global health awareness day — strong opportunity for a wellbeing-themed campaign and free taster sessions.",
    "Campaign banner, social content series, email newsletter, website feature, in-centre activity.")
add("gehfd-2027", "Global Employee Health & Fitness Day", d(2027,5,19), "fitness", "low",
    "Encourages workplace wellbeing — good for TCA's corporate/community partnership outreach.",
    "Partnership outreach post, simple social graphic.")
add("world-obesity-day-2027", "World Obesity Day", d(2027,3,4), "fitness", "medium",
    "Global awareness day promoting healthy, judgement-free approaches to weight and wellbeing.",
    "Sensitive, body-positive social content; blog feature.")
add("national-walking-month-2027", "National Walking Month begins", d(2027,5,1), "fitness", "low",
    "Month-long UK campaign (Living Streets) promoting walking for health — easy low-barrier activity tie-in.",
    "Simple social content series, walking-group promotion.")
add("global-running-day-2027", "Global Running Day", d(2027,6,3), "fitness", "medium",
    "Worldwide celebration of running, whatever your pace — great for a community fun-run tie-in.",
    "Event graphic, IG/FB/TikTok content, website promotion.")
add("global-wellness-day-2027", "Global Wellness Day", d(2027,6,12), "fitness", "low",
    "International day dedicated to living well — good for a mindful-movement themed session.",
    "Social content, simple graphic.")
add("nfd-2027", "National Fitness Day", d(2027,9,15), "fitness", "high",
    "ukactive's flagship UK-wide celebration of physical activity — a headline moment for TCA's mission (exact 2027 date provisional pending ukactive confirmation).",
    "Hero banner, open-session promotion, IG/FB/TikTok content, website takeover, local press outreach.")
add("world-heart-day-2027", "World Heart Day", d(2027,9,29), "fitness", "medium",
    "Global awareness day for heart health — natural fit for cardio/fitness programme messaging.",
    "Educational social graphics, blog/website content.")

# =====================================================================
# MENTAL HEALTH (category: mental-health)
# =====================================================================
add("wspd-2026", "World Suicide Prevention Day", d(2026,9,10), "mental-health", "high",
    "Global day raising awareness of suicide prevention — sensitive, supportive messaging with signposting to help.",
    "Carefully-worded social post, resource/helpline signposting, website banner.")
add("world-mh-day-2026", "World Mental Health Day", d(2026,10,10), "mental-health", "high",
    "WHO global awareness day — a headline moment for TCA's confidence & wellbeing mission.",
    "Campaign banner, video content, social series across all channels, email newsletter, in-centre activity.")
add("self-care-week-2026", "Self-Care Week", d(2026,11,16), "mental-health", "medium",
    "UK-wide awareness week (Self Care Forum) promoting everyday self-care habits (dates provisional).",
    "Content series across the week, downloadable self-care tips sheet.")
add("cmhw-2027", "Children's Mental Health Week", d(2027,2,1), "youth", "high",
    "Place2Be's flagship week supporting children and young people's mental health — key fit for TCA youth programmes.",
    "Themed activity plan, parent/carer resource, social content series, school partnership outreach.")
add("ttd-2027", "Time to Talk Day", d(2027,2,4), "mental-health", "medium",
    "UK's biggest mental health conversation day (Mind/Rethink) — encourages open conversation about mental health.",
    "Conversation-starter social content, staff/member story feature.")
add("world-bipolar-day-2027", "World Bipolar Day", d(2027,3,30), "mental-health", "low",
    "Global awareness day reducing stigma around bipolar disorder.",
    "Educational social post, resource signposting.")
add("mhaw-2027", "Mental Health Awareness Week", d(2027,5,10), "mental-health", "high",
    "Mental Health Foundation's flagship week — one of the most important dates in the TCA calendar.",
    "Full campaign: banner, week-long content series, workshops/taster sessions, email newsletter, press outreach.")
add("self-care-day-2027", "International Self-Care Day", d(2027,7,24), "mental-health", "low",
    "Global day (7/24 = 24 hours a day, 7 days a week) promoting everyday self-care.",
    "Simple self-care tips social post.")
add("wspd-2027", "World Suicide Prevention Day", d(2027,9,10), "mental-health", "high",
    "Global day raising awareness of suicide prevention — sensitive, supportive messaging with signposting to help.",
    "Carefully-worded social post, resource/helpline signposting, website banner.")
add("world-mh-day-2027", "World Mental Health Day", d(2027,10,10), "mental-health", "high",
    "WHO global awareness day — a headline moment for TCA's confidence & wellbeing mission.",
    "Campaign banner, video content, social series across all channels, email newsletter, in-centre activity.")
# =====================================================================
# FAMILY (category: family)
# =====================================================================
add("grandparents-day-2026", "National Grandparents Day (UK)", d(2026,10,4), "family", "low",
    "Celebrates the role of grandparents — nice multigenerational family content moment.",
    "Simple social greeting graphic.")
add("intl-family-day-2027", "International Day of Families", d(2027,5,15), "family", "low",
    "UN day recognising the importance of families — fits family-programme promotion.",
    "Simple social post, family programme shout-out.")
add("grandparents-day-2027", "National Grandparents Day (UK)", d(2027,10,3), "family", "low",
    "Celebrates the role of grandparents — nice multigenerational family content moment.",
    "Simple social greeting graphic.")

# =====================================================================
# YOUTH (category: youth)
# =====================================================================
add("back-to-school-2026", "Back to School", d(2026,9,2), "youth", "high",
    "New academic year — prime moment to promote youth confidence programmes and after-school activities.",
    "New-term campaign banner, parent-facing email, social content series, school partnership outreach.")
add("idg-2026", "International Day of the Girl Child", d(2026,10,11), "youth", "medium",
    "UN day championing girls' rights and empowerment — aligns with confidence-building programmes for girls.",
    "Empowerment-themed social content, testimonial feature.")
add("universal-childrens-day-2026", "Universal Children's Day", d(2026,11,20), "youth", "medium",
    "UN day promoting child welfare and rights — good moment to spotlight youth programme impact.",
    "Impact story social post, website feature.")
add("national-careers-week-2027", "National Careers Week", d(2027,3,1), "youth", "low",
    "UK-wide careers guidance week — opportunity to showcase confidence-building for future employability.",
    "Careers-confidence blog post, social content.")
add("iyd-2027", "International Youth Day", d(2027,8,12), "youth", "high",
    "UN day celebrating young people — strong alignment with TCA's youth confidence-building mission.",
    "Youth story/testimonial content, social campaign, website feature.")
add("back-to-school-2027", "Back to School", d(2027,9,1), "youth", "high",
    "New academic year — prime moment to promote youth confidence programmes and after-school activities.",
    "New-term campaign banner, parent-facing email, social content series, school partnership outreach.")
add("idg-2027", "International Day of the Girl Child", d(2027,10,11), "youth", "medium",
    "UN day championing girls' rights and empowerment — aligns with confidence-building programmes for girls.",
    "Empowerment-themed social content, testimonial feature.")
add("universal-childrens-day-2027", "Universal Children's Day", d(2027,11,20), "youth", "medium",
    "UN day promoting child welfare and rights — good moment to spotlight youth programme impact.",
    "Impact story social post, website feature.")

# =====================================================================
# AWARENESS DAYS (category: awareness)
# =====================================================================
add("world-braille-day-2027", "World Braille Day", d(2027,1,4), "awareness", "low",
    "Raises awareness of the importance of braille as a communication tool for blind and partially sighted people.",
    "Accessibility-focused social post.")
add("world-cancer-day-2027", "World Cancer Day", d(2027,2,4), "awareness", "medium",
    "Global day uniting the world in the fight against cancer.",
    "Supportive social content, resource signposting.")
add("rak-day-2027", "Random Acts of Kindness Day", d(2027,2,17), "community", "medium",
    "Global day encouraging small acts of kindness — lovely, positive community content moment.",
    "Kindness-challenge social post, community shout-outs.")
add("iwd-2027", "International Women's Day", d(2027,3,8), "awareness", "high",
    "Global day celebrating women's achievements and calling for equality — major campaign moment for TCA.",
    "Campaign banner, testimonial/story content series, social campaign, email newsletter, event tie-in.")
add("iday-happiness-2027", "International Day of Happiness", d(2027,3,20), "awareness", "low",
    "UN day recognising happiness as a fundamental human goal.",
    "Uplifting social content, simple graphic.")
add("down-syndrome-day-2027", "World Down Syndrome Day", d(2027,3,21), "awareness", "medium",
    "Global awareness day championing the rights and inclusion of people with Down syndrome.",
    "Inclusive social content, accessibility messaging.")
add("world-autism-week-2027", "World Autism Acceptance Week", d(2027,3,29), "awareness", "medium",
    "National Autistic Society's flagship week promoting acceptance and understanding of autism.",
    "Inclusive/sensory-friendly session promotion, social content series.")
add("purple-tuesday-2026", "Purple Tuesday (Accessible Community Day)", d(2026,11,3), "awareness", "medium",
    "UK-wide initiative improving accessibility and inclusion for disabled people.",
    "Accessibility audit checklist, inclusive social content.")
add("idpd-2026", "International Day of Persons with Disabilities", d(2026,12,3), "awareness", "high",
    "UN day promoting the rights and wellbeing of people with disabilities — key alignment with TCA's accessibility pillar.",
    "Campaign banner, accessible-programme feature, social content series, website update.")
add("human-rights-day-2026", "Human Rights Day", d(2026,12,10), "awareness", "low",
    "UN day marking the anniversary of the Universal Declaration of Human Rights.",
    "Values-led social post.")
add("intl-mens-day-2026", "International Men's Day", d(2026,11,19), "awareness", "medium",
    "Global day focusing on men's health and wellbeing, and positive male role models.",
    "Supportive social content, male mental-health signposting.")
add("world-kindness-day-2026", "World Kindness Day", d(2026,11,13), "community", "medium",
    "Global day promoting kindness — easy, feel-good community content moment.",
    "Kindness-challenge social post, community shout-outs.")
add("disability-history-month-2026", "UK Disability History Month begins", d(2026,11,16), "awareness", "medium",
    "UK-wide month (16 Nov–16 Dec) exploring the history of disabled people's struggle for equality.",
    "Educational content series, accessibility programme spotlight.")
add("world-diabetes-day-2026", "World Diabetes Day", d(2026,11,14), "awareness", "low",
    "Global awareness day for diabetes prevention and care.",
    "Educational social post, healthy-lifestyle tie-in.")
add("elim-violence-women-2026", "International Day for the Elimination of Violence against Women", d(2026,11,25), "awareness", "medium",
    "UN day marking the start of 16 Days of Activism against gender-based violence.",
    "Supportive, values-led social content; resource signposting.")
add("older-persons-day-2026", "International Day of Older Persons", d(2026,10,1), "awareness", "low",
    "UN day recognising the contributions of older people — good tie-in for TCA's community/senior programmes.",
    "Community programme spotlight, simple social graphic.")
add("world-osteoporosis-day-2026", "World Osteoporosis Day", d(2026,10,20), "fitness", "low",
    "Global awareness day for bone health — fits strength & mobility programme messaging.",
    "Educational social content, programme tie-in.")
add("bhm-2026", "Black History Month UK begins", d(2026,10,1), "awareness", "medium",
    "UK's month-long celebration of Black history, achievement and culture.",
    "Monthly content series celebrating diverse role models and community stories.")
add("idg-education-2027", "International Day of Education", d(2027,1,24), "youth", "low",
    "UN day celebrating the role of education in personal and social development.",
    "Educational-confidence themed social post.")
add("purple-tuesday-2027", "Purple Tuesday (Accessible Community Day)", d(2027,11,2), "awareness", "medium",
    "UK-wide initiative improving accessibility and inclusion for disabled people.",
    "Accessibility audit checklist, inclusive social content.")
add("idpd-2027", "International Day of Persons with Disabilities", d(2027,12,3), "awareness", "high",
    "UN day promoting the rights and wellbeing of people with disabilities — key alignment with TCA's accessibility pillar.",
    "Campaign banner, accessible-programme feature, social content series, website update.")
add("human-rights-day-2027", "Human Rights Day", d(2027,12,10), "awareness", "low",
    "UN day marking the anniversary of the Universal Declaration of Human Rights.",
    "Values-led social post.")
add("intl-mens-day-2027", "International Men's Day", d(2027,11,19), "awareness", "medium",
    "Global day focusing on men's health and wellbeing, and positive male role models.",
    "Supportive social content, male mental-health signposting.")
add("world-kindness-day-2027", "World Kindness Day", d(2027,11,13), "community", "medium",
    "Global day promoting kindness — easy, feel-good community content moment.",
    "Kindness-challenge social post, community shout-outs.")
add("disability-history-month-2027", "UK Disability History Month begins", d(2027,11,16), "awareness", "medium",
    "UK-wide month (16 Nov–16 Dec) exploring the history of disabled people's struggle for equality.",
    "Educational content series, accessibility programme spotlight.")
add("world-diabetes-day-2027", "World Diabetes Day", d(2027,11,14), "awareness", "low",
    "Global awareness day for diabetes prevention and care.",
    "Educational social post, healthy-lifestyle tie-in.")
add("elim-violence-women-2027", "International Day for the Elimination of Violence against Women", d(2027,11,25), "awareness", "medium",
    "UN day marking the start of 16 Days of Activism against gender-based violence.",
    "Supportive, values-led social content; resource signposting.")
add("older-persons-day-2027", "International Day of Older Persons", d(2027,10,1), "awareness", "low",
    "UN day recognising the contributions of older people — good tie-in for TCA's community/senior programmes.",
    "Community programme spotlight, simple social graphic.")
add("world-osteoporosis-day-2027", "World Osteoporosis Day", d(2027,10,20), "fitness", "low",
    "Global awareness day for bone health — fits strength & mobility programme messaging.",
    "Educational social content, programme tie-in.")
add("bhm-2027", "Black History Month UK begins", d(2027,10,1), "awareness", "medium",
    "UK's month-long celebration of Black history, achievement and culture.",
    "Monthly content series celebrating diverse role models and community stories.")

# =====================================================================
# TCA CAMPAIGNS (category: tca)
# =====================================================================
add("tca-newyearnewconfidence-2027", "New Year, New Confidence Campaign", d(2027,1,2), "tca", "high",
    "TCA's flagship January acquisition campaign, capturing New Year motivation with a confidence-first (not weight-first) message.",
    "Full campaign kit: hero banner, landing page copy, paid social, email series, referral offer graphics.")
add("tca-term-starts-sept-2026", "Confidence Term Starts", d(2026,9,7), "tca", "high",
    "Launch of TCA's autumn term programme, riding the back-to-school energy for youth and family sign-ups.",
    "Term brochure, timetable graphics, social launch series, email to waitlist.")
add("tca-spring-challenge-2027", "Get Britain Moving Spring Challenge", d(2027,4,20), "tca", "high",
    "TCA's headline spring challenge campaign, built around the 'Get Britain Moving' tagline — a step/activity challenge for members and community.",
    "Challenge branding kit, sign-up landing page, tracker graphic, weekly social content, email series.")
add("tca-summer-camp-2027", "Summer Confidence Camp Launch", d(2027,7,5), "tca", "high",
    "Launch of TCA's summer holiday youth programme — a major seasonal revenue and impact driver.",
    "Brochure/landing page, parent email campaign, social content series, local outreach flyers.")
add("tca-12days-2026", "12 Days of Confidence", d(2026,12,13), "tca", "high",
    "TCA's festive countdown campaign — 12 days of confidence tips, member stories and offers running to Christmas.",
    "12-part content calendar, daily social graphics, email countdown series.")
add("tca-community-awards-2027", "TCA Community Awards", d(2027,11,7), "tca", "high",
    "Annual celebration recognising standout members, volunteers and coaches across the TCA community.",
    "Awards branding, nomination campaign, ceremony content, winner social features, press release.")
add("tca-term-starts-sept-2027", "Confidence Term Starts", d(2027,9,6), "tca", "high",
    "Launch of TCA's autumn term programme, riding the back-to-school energy for youth and family sign-ups.",
    "Term brochure, timetable graphics, social launch series, email to waitlist.")
add("tca-movember-2026", "Get Britain Moving: Movember Edition", d(2026,11,1), "tca", "medium",
    "TCA's tie-in to Movember, spotlighting men's fitness and mental health with a moustache-themed challenge.",
    "Challenge graphic, social content series, email, in-centre promotion.")
add("tca-anniversary-2027", "TCA Get Britain Moving Day", d(2027,9,16), "tca", "high",
    "TCA's own flagship celebration day, timed with National Fitness Day, spotlighting community impact and free taster sessions nationwide.",
    "Flagship campaign kit: banner, press release, social series, email, in-centre event materials.")

# =====================================================================
# COMMUNITY / EVENTS (category: community)
# =====================================================================
add("volunteers-week-2027", "National Volunteers' Week", d(2027,6,1), "community", "medium",
    "UK-wide week celebrating and recognising volunteers — great opportunity to thank TCA's community volunteers/coaches.",
    "Thank-you social content, volunteer spotlight features, email to volunteer network.")
add("macmillan-2026", "Macmillan Coffee Morning", d(2026,9,25), "community", "medium",
    "UK's biggest fundraising event for Macmillan Cancer Support — easy, high-engagement community fundraiser.",
    "Event graphic, social promotion, sign-up sheet, thank-you post.")
add("macmillan-2027", "Macmillan Coffee Morning", d(2027,9,24), "community", "medium",
    "UK's biggest fundraising event for Macmillan Cancer Support — easy, high-engagement community fundraiser.",
    "Event graphic, social promotion, sign-up sheet, thank-you post.")
add("wear-it-pink-2026", "Wear It Pink Day", d(2026,10,16), "community", "medium",
    "Breast Cancer Now's flagship fundraising day — simple, colourful community participation moment.",
    "Event graphic, social promotion, in-centre photo moment.")
add("wear-it-pink-2027", "Wear It Pink Day", d(2027,10,15), "community", "medium",
    "Breast Cancer Now's flagship fundraising day — simple, colourful community participation moment.",
    "Event graphic, social promotion, in-centre photo moment.")

TEMPLATE_BY_PRIORITY = {
    "high": FULL_TASKS,
    "medium": STANDARD_TASKS,
    "low": LIGHT_TASKS,
}
for e in events:
    if not e["tasks"]:
        e["tasks"] = TEMPLATE_BY_PRIORITY[e["priority"]]

events.sort(key=lambda e: e["date"])

out_of_range = [e for e in events if not ("2026-09-01" <= e["date"] <= "2027-12-31")]
if out_of_range:
    print("OUT OF RANGE EVENTS:")
    for e in out_of_range:
        print(" ", e["id"], e["date"], e["name"])
    raise SystemExit("Fix out-of-range events before continuing")

with open("../data/events.json", "w") as f:
    json.dump(events, f, indent=2)

print(f"Total events: {len(events)}")
from collections import Counter
cats = Counter(e["category"] for e in events)
print(cats)
prios = Counter(e["priority"] for e in events)
print(prios)
print("Date range:", events[0]["date"], "to", events[-1]["date"])
# sanity check ids unique
ids = [e["id"] for e in events]
assert len(ids) == len(set(ids)), "duplicate ids!"
print("IDs unique: OK")
