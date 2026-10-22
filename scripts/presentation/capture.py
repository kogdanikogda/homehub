# -*- coding: utf-8 -*-
"""Screenshots for the presentation, taken from the running prototype in English and Russian.

    npm run build && npx vite preview --port 4173      # in another terminal
    pip install playwright pillow && playwright install chromium
    python3 scripts/presentation/capture.py            # all screens
    python3 scripts/presentation/capture.py t01_default a12_camera   # only some

Each state is reached in English, saved, then the language is switched to Russian with the
EN/RU switch and saved again, so both languages show exactly the same state. A few states
that do not survive a re-render (open menus, running progress windows) are taken
separately with ?lang=ru. Results go to public/presentation/img/{en,ru}/*.webp with rounded
corners matching the device screen. Then run build.py.
"""
import io, os, re, sys
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright

URL = os.environ.get('HOMEHUB_URL', 'http://127.0.0.1:4173/')
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'public', 'presentation', 'img')
ONLY = set(sys.argv[1:])

# Texts the prototype does not translate yet; patched only in the Russian screenshots
RU_FIX = {'LIVE': 'ЭФИР', 'Front door · porch': 'Входная дверь · крыльцо'}
FIX_JS = """(fix)=>{const w=document.createTreeWalker(document.querySelector('[class*=bezel]'),NodeFilter.SHOW_TEXT);let n;
while(n=w.nextNode()){const s=n.nodeValue.trim();if(fix[s]!==undefined)n.nodeValue=n.nodeValue.replace(s,fix[s]);}}"""
TO_RU = "()=>[...document.querySelectorAll('button')].find(b=>b.innerText.trim()==='RU').click()"


def save(png, lang, name):
    im = Image.open(io.BytesIO(png)).convert('RGBA')
    w, h = im.size
    r = 60 if w > 1500 else 95                       # tablet / phone screen corner at 2x
    s = 4
    mask = Image.new('L', (w * s, h * s), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, w * s - 1, h * s - 1], radius=r * s, fill=255)
    im.putalpha(mask.resize((w, h), Image.LANCZOS))
    tw = 2000 if w > 1500 else 620
    im = im.resize((tw, round(h * tw / w)), Image.LANCZOS)
    os.makedirs(os.path.join(OUT, lang), exist_ok=True)
    im.save(os.path.join(OUT, lang, name + '.webp'), 'WEBP', quality=84, method=6)


with sync_playwright() as p:
    b = p.chromium.launch()

    def page(dev, lang):
        pg = b.new_page(viewport={'width': 1500, 'height': 1250}, device_scale_factor=2)
        pg.goto(f'{URL}?device={dev}&lang={lang}')
        pg.wait_for_timeout(900)
        return pg

    def bezel(pg):
        return pg.locator('[class*=bezel]').first.screenshot()

    def shot(name, dev, steps, settle=900, ru_steps=None):
        if ONLY and name not in ONLY:
            return
        pg = page(dev, 'en')
        for st in steps:
            st(pg); pg.wait_for_timeout(600)
        pg.wait_for_timeout(settle)
        save(bezel(pg), 'en', name)
        if ru_steps is None:
            pg.evaluate(TO_RU); pg.wait_for_timeout(700)
        else:
            pg.close(); pg = page(dev, 'ru')
            for st in ru_steps:
                st(pg); pg.wait_for_timeout(600)
            pg.wait_for_timeout(settle)
        pg.evaluate(FIX_JS, RU_FIX)
        save(bezel(pg), 'ru', name)
        pg.close()
        print('ok', name)

    B = lambda t: (lambda pg: pg.get_by_role('button', name=t).first.click())
    W = lambda ms: (lambda pg: pg.wait_for_timeout(ms))
    L = lambda rx: (lambda pg: pg.get_by_label(re.compile(rx)).first.click())
    T = lambda t: (lambda pg: pg.get_by_text(t, exact=True).first.click())
    nav = lambda t: (lambda pg: pg.locator('nav[aria-label=Main]').get_by_text(t, exact=True).first.click())
    in_device = lambda t: (lambda pg: pg.locator('[class*=bezel]').get_by_text(t, exact=True).first.click())

    def panel(label):
        def f(pg):
            pg.get_by_role('button', name='Settings & demo content').click(); pg.wait_for_timeout(500)
            el = pg.get_by_label(label, exact=True)
            if el.count() == 0:
                el = pg.get_by_role('button', name=label)
            el.first.click(); pg.wait_for_timeout(400)
            pg.keyboard.press('Escape'); pg.wait_for_timeout(500)
        return f

    CINEMA = [B('Cinema'), W(5500)]
    shot('t01_default', 'tablet', [])
    shot('t17_override', 'tablet', CINEMA + [B('Main light: more')])
    shot('t03_modified', 'tablet', CINEMA + [B('Main light: more'), B('Continue')])
    shot('t16_conflict', 'tablet', CINEMA + [lambda pg: pg.locator('[class*=bezel] button', has_text='Night').first.click()])
    shot('t20_progress', 'tablet', [B('Cinema')], settle=100, ru_steps=[B('Кино')])
    shot('t10_menu', 'tablet', [B('House mode')], ru_steps=[B('Режим дома')])
    shot('t12_confirm_away', 'tablet', [B('House mode'), in_device('Away')])
    shot('t06_vacation', 'tablet', [panel('Vacation (from Alexey’s phone)'), W(9000)], settle=1500)
    shot('t07_window', 'tablet', [panel('Living Room window open')])
    shot('t23_intrusion', 'tablet', [panel('Intrusion alarm')], settle=1500)
    shot('t09_dim', 'tablet', [panel('Dim screen')])
    shot('t41_energy', 'tablet', [T('Today’s energy')])
    shot('t25_rooms', 'tablet', [nav('Rooms')])
    shot('t33_scenes', 'tablet', [nav('Scenes')])
    shot('t05_away', 'tablet', [B('House mode'), in_device('Away'), B('Turn on Away'), W(9000)], settle=1500)
    shot('t38_onboarding', 'tablet', [panel('Setup flow'), B('Start setup')])
    shot('m01_marina', 'marina', [])
    shot('m03_room', 'marina', [nav('Rooms'), lambda pg: pg.get_by_text('Kids Room 1').first.click()])
    shot('a01_alexey', 'alexey', [])
    shot('a11_security', 'alexey', [nav('Security')])
    shot('a12_camera', 'alexey', [nav('Security'), L('Entrance camera')])
    shot('a25_settings', 'alexey', [nav('Settings')])
    b.close()
