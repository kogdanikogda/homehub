# -*- coding: utf-8 -*-
"""Builds public/presentation/index.html — the HomeHub case-study deck (EN + RU in one page).

Texts live in content.json next to this file, screenshots in public/presentation/img/{en,ru}/
(made by capture.py from the running prototype, in both languages).

    python3 scripts/presentation/build.py
"""
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
C = json.load(open(os.path.join(HERE, 'content.json'), encoding='utf-8'))

LOGO = ('<svg width="{s}" height="{s}" viewBox="0 0 46 46" fill="none" aria-hidden="true" style="opacity:{o}">'
        '<path d="M23 27.4625C25.4646 27.4625 27.4625 25.4645 27.4625 23C27.4625 20.5354 25.4646 18.5375 23 18.5375C20.5354 18.5375 18.5375 20.5354 18.5375 23C18.5375 25.4645 20.5354 27.4625 23 27.4625Z" fill="{c}"/>'
        '<path d="M23 11.3125C25.3116 11.3125 27.5712 11.998 29.4932 13.2822C31.4152 14.5664 32.9132 16.3918 33.7978 18.5274C34.6824 20.663 34.9139 23.013 34.4629 25.2801C34.012 27.5473 32.8988 29.6298 31.2643 31.2643C29.6298 32.8988 27.5473 34.012 25.2801 34.4629C23.013 34.9139 20.663 34.6824 18.5274 33.7978C16.3918 32.9132 14.5664 31.4152 13.2822 29.4932C11.998 27.5712 11.3125 25.3116 11.3125 23" stroke="{c}" stroke-width="2.55" stroke-linecap="round"/>'
        '<path d="M14.7125 16.7313C15.8274 16.7313 16.7312 15.8274 16.7312 14.7125C16.7312 13.5976 15.8274 12.6938 14.7125 12.6938C13.5976 12.6938 12.6937 13.5976 12.6937 14.7125C12.6937 15.8274 13.5976 16.7313 14.7125 16.7313Z" fill="{c}"/></svg>')
logo = lambda s, c='var(--ct)', o=1: LOGO.format(s=s, c=c, o=o)
WM = lambda x, y: f'<div class="wm" style="left:{x}px;top:{y}px">{logo(2000, "var(--c2)", .07)}</div>'


def slides(L):
    t = C[L]
    T = lambda k: t[k]
    I = lambda n, w, extra='': f'<img src="img/{L}/{n}.webp" alt="" style="width:{w}px{extra}" loading="lazy">'
    foot = '<div class="foot"><span class="brand">' + logo(26) + '<span>HomeHub</span></span><span>@@N@@</span></div>'
    def call(k, fs=26):
        return f'<div class="card callout"><span class="num">!</span><p style="font-size:{fs}px">{T(k)}</p></div>'
    def head(k, big=False):
        return f'<div class="eyebrow">{T(k + "_eyebrow")}</div><h2{" class=big" if big else ""}>{T(k + "_h2")}</h2>'
    S = []
    # 1 · cover
    meta = ''.join(f'<div><div class="meta-l">{T(f"s1_m{i}l")}</div><div class="meta-v">{T(f"s1_m{i}v")}</div></div>' for i in (1, 2, 3))
    S.append(f'''<section class="slide cover">{WM(800, -300)}
<div class="col cover-l"><div style="margin-bottom:34px">{logo(84, 'var(--c2)')}</div><div class="eyebrow">{T('s1_eyebrow')}</div>
<h1>HomeHub</h1><p class="sub">{T('s1_sub')}</p><p style="margin-top:28px;max-width:680px">{T('s1_desc')}</p>
<div class="row meta">{meta}</div></div>
<div class="cover-img">{I('t01_default', 930)}</div></section>''')
    # 2 · brief
    cards = ''.join(f'<div class="card stat"><div class="n">{T(f"s2_n{i}")}</div><p>{T(f"s2_n{i}t")}</p></div>' for i in (1, 2, 3, 4))
    S.append(f'''<section class="slide">{head('s2', True)}
<div class="row" style="gap:80px;margin-top:56px"><div style="width:860px">
<p class="lead">{T('s2_lead')}</p>
<ul class="dots" style="margin-top:34px"><li>{T('s2_b1')}</li><li>{T('s2_b2')}</li><li>{T('s2_b3')}</li></ul></div>
<div class="col" style="gap:20px;flex:1"><div class="stats">{cards}</div>
<div class="card"><p>{T('s2_scope')}</p></div></div></div>{foot}</section>''')
    # 3 · family
    pe = ''.join(f'<div class="person"><span class="num">{ini}</span><span>{T(f"sL_p{i}")}</span></div>' for i, ini in zip((1, 2, 3, 4), ('A', 'M', '12', '8')))
    lc = ''.join(f'<div class="card" style="padding:28px 34px"><span class="tag c">{T(f"sL_c{i}tag")}</span><p style="margin-top:14px;font-size:24px;color:var(--tx)">{T(f"sL_c{i}txt")}</p></div>' for i in (1, 2, 3, 4))
    S.append(f'''<section class="slide">{WM(-800, 50)}{head('sL', True)}
<div class="row" style="gap:70px;margin-top:50px;position:relative"><div style="width:780px"><p class="lead" style="font-size:28px;line-height:1.5">{T('sL_lead')}</p>
<div class="row" style="gap:22px;margin-top:40px;flex-wrap:wrap">{pe}</div></div>
<div class="col" style="flex:1;gap:18px">{lc}</div></div>{foot}</section>''')
    # 4 · users
    pc = ''.join(f'<div class="card" style="flex:1"><span class="tag{" c" if i == 1 else ""}">{T(f"s3_c{i}tag")}</span><h3 style="margin-top:22px;font-size:34px">{T(f"s3_c{i}name")}</h3><p style="margin-top:18px;font-size:25px">{T(f"s3_c{i}txt")}</p></div>' for i in (1, 2, 3, 4))
    S.append(f'''<section class="slide">{head('s3', True)}<div class="row" style="gap:24px;margin-top:54px">{pc}</div>{call('s3_call', 26)}{foot}</section>''')
    # 5 · access
    def acc(i, cls):
        li = ''.join(f'<li>{T(f"s4_c{i}b{j}")}</li>' for j in (1, 2, 3, 4))
        return f'<div class="card" style="flex:1"><span class="tag {cls}">{T(f"s4_c{i}tag")}</span><h3 style="margin-top:20px;font-size:32px">{T(f"s4_c{i}name")}</h3><ul class="dots" style="margin-top:18px">{li}</ul></div>'
    S.append(f'''<section class="slide">{head('s4', True)}<p style="margin-top:20px;max-width:1400px">{T('s4_lead')}</p>
<div class="row" style="gap:24px;margin-top:40px">{acc(1, 'c')}{acc(2, '')}{acc(3, 'ok')}</div>{call('s4_call', 25)}{foot}</section>''')
    # 6 · model
    mode = lambda k: f'<div class="tile"><h3>{T(k)}</h3><p style="font-size:21px;margin-top:6px">{T(k + "t")}</p></div>'
    names = ('Обычная', 'Кино', 'Ночь', 'Гости') if L == 'ru' else ('General', 'Cinema', 'Night', 'Guests')
    scn = ''.join(f'<div class="tile"><h3>{n}</h3></div>' for n in names)
    rules = ''.join(f'<li>{T(f"s5_r{i}")}</li>' for i in range(1, 7))
    S.append(f'''<section class="slide">{head('s5', True)}
<div class="row" style="gap:40px;margin-top:48px"><div class="col" style="width:1000px;gap:20px">
<div class="card" style="border-color:#E6D2BF"><div class="row between"><span class="eyebrow">{T('s5_l1')}</span><span class="tag c">{T('s5_l1tag')}</span></div>
<div class="row" style="gap:14px;margin-top:20px">{mode('s5_m1')}{mode('s5_m2')}{mode('s5_m3')}</div></div>
<div class="card"><div class="row between"><span class="eyebrow">{T('s5_l2')}</span><span class="tag">{T('s5_l2tag')}</span></div>
<div class="row" style="gap:14px;margin-top:20px">{scn}</div><p class="mut" style="font-size:21px;margin-top:18px">{T('s5_l2note')}</p></div></div>
<div style="flex:1"><h3 style="color:var(--ct)">{T('s5_rh')}</h3><ul class="dots" style="margin-top:6px">{rules}</ul></div></div>{foot}</section>''')
    # 7 · dashboard
    pt = lambda i: f'<div class="row" style="gap:18px"><span class="num">{i}</span><div><h3>{T(f"s6_a{i}h")}</h3><p style="font-size:22px;margin-top:6px">{T(f"s6_a{i}t")}</p></div></div>'
    S.append(f'''<section class="slide">{head('s6')}<div class="row" style="gap:56px;margin-top:36px;align-items:flex-start">
{I('t01_default', 1000)}<div class="col" style="gap:30px;flex:1;padding-top:6px">{pt(1)}{pt(2)}{pt(3)}<p class="mut" style="font-size:20px;margin-top:6px">{T('s6_note')}</p></div></div>{foot}</section>''')
    # 8 · override
    S.append(f'''<section class="slide">{head('s7')}<div class="row" style="gap:36px;margin-top:34px;align-items:center">
<div style="width:740px">{I('t17_override', 740)}<div class="cap">{T('s7_cap1')}</div></div><div class="arrow">→</div>
<div style="width:740px">{I('t03_modified', 740)}<div class="cap">{T('s7_cap2')}</div></div></div>
<div class="row" style="gap:40px;margin-top:30px"><p style="flex:1;font-size:23px">{T('s7_t1')}</p><p style="flex:1;font-size:23px">{T('s7_t2')}</p></div>{foot}</section>''')
    # 9 · conflict
    S.append(f'''<section class="slide">{head('s8')}<div class="row" style="gap:36px;margin-top:34px;align-items:flex-start">
<div style="width:840px">{I('t16_conflict', 840)}<div class="cap">{T('s8_cap1')}</div></div>
<div style="width:840px">{I('t20_progress', 840)}<div class="cap">{T('s8_cap2')}</div></div></div>{foot}</section>''')
    # 10–12 · three-up
    def three(k, imgs, tags=None):
        cols = ''
        for i, im in enumerate(imgs, 1):
            tg = f'<div style="margin-top:14px"><span class="tag {tags[i - 1][1]}">{T(tags[i - 1][0])}</span></div>' if tags else ''
            cols += f'<div style="width:560px">{I(im, 560)}{tg}<div class="cap">{T(f"{k}_cap{i}")}</div></div>'
        return f'<section class="slide">{head(k)}<div class="row" style="gap:28px;margin-top:30px">{cols}</div>{call(k + "_call")}{foot}</section>'
    S.append(three('s9', ['t10_menu', 't12_confirm_away', 't06_vacation']))
    S.append(three('s10', ['t07_window', 't05_away', 't23_intrusion'], [('s10_tag1', 'warn'), ('s10_tag2', 'bad'), ('s10_tag3', 'bad')]))
    S.append(three('s11', ['t09_dim', 't41_energy', 't38_onboarding']))
    # 13 · rooms & scenes
    S.append(f'''<section class="slide">{head('s12')}<div class="row" style="gap:28px;margin-top:30px;align-items:flex-start">
<div style="width:650px">{I('t25_rooms', 650)}<div class="cap">{T('s12_cap1')}</div></div>
<div style="width:650px">{I('t33_scenes', 650)}<div class="cap">{T('s12_cap2')}</div></div>
<div style="width:340px">{I('m03_room', 280)}<div class="cap" style="font-size:18px">{T('s12_cap3')}</div></div></div>{foot}</section>''')
    # 14 · phones
    ph = ''.join(f'<div style="width:285px">{I(im, 285)}<div class="cap" style="font-size:19px">{T(f"s13_cap{i}")}</div></div>' for i, im in enumerate(['m01_marina', 'a01_alexey', 'a11_security', 'a12_camera', 'a25_settings'], 1))
    S.append(f'''<section class="slide" style="padding-top:70px">{head('s13')}<p style="margin-top:14px;max-width:1500px;font-size:24px">{T('s13_lead')}</p>
<div class="row" style="gap:48px;margin-top:26px">{ph}</div>{foot}</section>''')
    # 15 · design system
    sw = ''.join(f'<div class="swatch"><div style="color:var(--{c});font-weight:700;font-size:22px">{T("s14_" + c)}</div><div class="mut" style="font-size:18px;margin-top:6px">{h}</div></div>' for c, h in (('ok', '#97BC9D'), ('warn', '#CEB885'), ('bad', '#DC8995'), ('info', '#90B7D3')))
    kc = ''.join(f'<div class="card" style="padding:36px 40px"><div class="eyebrow" style="font-size:16px">{T(f"s14_k{i}")}</div><p style="color:var(--tx);margin-top:14px;font-size:26px">{T(f"s14_v{i}")}</p></div>' for i in (1, 2, 3))
    S.append(f'''<section class="slide">{head('s14')}<div class="row" style="gap:36px;margin-top:40px"><div style="width:860px">
<div class="clay"><div style="font-size:26px;font-weight:700">{T('s14_clay')}</div><div style="font-size:20px;margin-top:6px">#DCBA9A → #C5957D</div></div>
<div class="row" style="gap:14px;margin-top:14px">{sw}</div>
<ul class="dots" style="margin-top:22px"><li style="font-size:24px">{T('s14_b1')}</li><li style="font-size:24px">{T('s14_b2')}</li><li style="font-size:24px">{T('s14_b3')}</li></ul></div>
<div class="col" style="flex:1;gap:20px">{kc}</div></div>{foot}</section>''')
    # 16 · outcome
    cc = ''.join(f'<div class="card" style="padding:24px 32px"><h3>{T(f"s15_c{i}")}</h3><p style="margin-top:8px;font-size:23px">{T(f"s15_c{i}t")}</p></div>' for i in (1, 2, 3))
    S.append(f'''<section class="slide">{WM(750, -850)}
<div class="eyebrow">{T('s15_eyebrow')}</div><h2 class="big" style="max-width:1100px">{T('s15_h2')}</h2>
<div class="col" style="gap:16px;margin-top:40px;width:740px">{cc}</div>
<div style="position:absolute;right:96px;top:300px">{I('t03_modified', 900)}</div>
<div class="col try"><div class="eyebrow" style="color:var(--mut);font-size:16px">{T('s15_try')}</div>
<a class="go" href="../?lang={L}">{T('s15_link')}</a><div style="font-size:22px;color:var(--mut)">{T('s15_code')}</div></div>{foot}</section>''')
    html = '\n'.join(S)
    n = [1]  # the cover has no footer, so the first footer is slide 02
    def num(_):
        n[0] += 1
        return f'{n[0]:02d}'
    return re.sub('@@N@@', num, html), len(S)


def page():
    en, count = slides('en')
    ru, _ = slides('ru')
    tpl = open(os.path.join(HERE, 'page.html'), encoding='utf-8').read()
    return tpl.replace('<!--SLIDES_EN-->', en).replace('<!--SLIDES_RU-->', ru).replace('@@COUNT@@', str(count))


out = os.path.join(ROOT, 'public', 'presentation', 'index.html')
open(out, 'w', encoding='utf-8').write(page())
print('wrote', os.path.relpath(out, ROOT))
