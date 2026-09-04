#!/usr/bin/env python3
"""Render icons.html SVG icons to transparent PNGs using headless Chromium."""
from playwright.sync_api import sync_playwright
import os

BASE = os.path.dirname(__file__)
HTML = os.path.join(BASE, "icons.html")

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path="/opt/pw-browsers/chromium")
    page = browser.new_page(viewport={"width": 900, "height": 400}, device_scale_factor=2)
    page.goto(f"file://{HTML}")
    for name in ["phone", "mail", "globe"]:
        el = page.locator(f"#{name}")
        el.screenshot(path=os.path.join(BASE, f"icon-{name}-raw.png"), omit_background=True)
    browser.close()
print("rendered raw icons")
