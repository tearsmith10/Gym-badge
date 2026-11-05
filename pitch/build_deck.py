"""Build the Gym Badge investor deck.

One slide spec, two renderers:
  - pitch/gymbadge-investor-deck.pptx  (editable, for the founder)
  - pitch/gymbadge-investor-deck.pdf   (email-ready)

Design system matches the product: charcoal, coral, the approved
artwork, plain language. Any text inside [[...]] is a PLACEHOLDER the
founder replaces later - it renders in coral with brackets so it can
never be mistaken for a finished fact. No invented statistics anywhere.
"""
from pathlib import Path
from io import BytesIO
import re

from PIL import Image, ImageFont
import qrcode

ROOT = Path(r"C:\Users\darli\Documents\Gymbadge")
PLATES = ROOT / "pitch" / "plates"          # shipped with the deck builder
if not PLATES.exists():                      # fallback to the ad build output
    PLATES = Path(r"C:\Users\darli\AppData\Local\Temp\opencode\demo_plates")
OUT = ROOT / "pitch"
POSTER = ROOT / "demo" / "mvp-ad-poster.jpg"
LOGO = ROOT / "app" / "assets" / "img" / "logo.png"

W, H = 960.0, 540.0            # points (13.333 x 7.5 in, 16:9)

# ---- design system (from app/assets/css/app.css)
BG      = "121211"
SURFACE = "1A1A18"
LINE    = "2B2B28"
TEXT    = "F2F0EB"
MUTED   = "A5A29B"
CORAL   = "FF6A45"
GOLD    = "C9A227"
FOOT    = "6F6D67"
FONT    = "Segoe UI"

FONT_FILES = {
    False: r"C:\Windows\Fonts\segoeui.ttf",
    True:  r"C:\Windows\Fonts\segoeuib.ttf",
}
for fb, alt in ((False, r"C:\Windows\Fonts\arial.ttf"),
                (True, r"C:\Windows\Fonts\arialbd.ttf")):
    if not Path(FONT_FILES[fb]).exists():
        FONT_FILES[fb] = alt

_fc = {}
def _font(size, bold):
    key = (round(size, 1), bold)
    if key not in _fc:
        _fc[key] = ImageFont.truetype(FONT_FILES[bold], round(size * 4))  # 4x for precision
    return _fc[key]

def tw(text, size, bold):
    """Text width in points."""
    return _font(size, bold).getlength(text) / 4.0

# ---- markup: [[placeholder]] = coral brackets, **bold** = bold run
TOKEN = re.compile(r"(\[\[[^\]]+\]\]|\*\*[^*]+\*\*)")

def parse(text):
    out = []
    for part in TOKEN.split(text):
        if not part:
            continue
        if part.startswith("[["):
            out.append(("[" + part[2:-2] + "]", False, True))
        elif part.startswith("**"):
            out.append((part[2:-2], True, False))
        else:
            out.append((part, False, False))
    return out

def wrap(items, size, max_w):
    """Wrap parsed runs into lines of (word, bold, ph) tuples."""
    words = []
    for text, bold, ph in items:
        parts = text.split(" ")
        for i, w in enumerate(parts):
            if w == "" and i < len(parts) - 1:
                continue
            words.append((w, bold, ph))
    lines, cur, cur_w = [], [], 0.0
    space = tw(" ", size, False)
    for w, bold, ph in words:
        ww = tw(w, size, bold)
        add = ww if not cur else space + ww
        if cur and cur_w + add > max_w:
            lines.append(cur)
            cur, cur_w = [(w, bold, ph)], ww
        else:
            cur.append((w, bold, ph))
            cur_w += add
    if cur:
        lines.append(cur)
    return lines

# ---------------------------------------------------------------- content
def img(name):
    """Return a size-optimised JPEG of a plate (keeps the deck emailable)."""
    src = PLATES / f"{name}.png"
    cache = Path(r"C:\Users\darli\AppData\Local\Temp\opencode\deck_jpg")
    cache.mkdir(parents=True, exist_ok=True)
    dst = cache / f"{name}.jpg"
    if (not dst.exists() or dst.stat().st_mtime < src.stat().st_mtime):
        im = Image.open(src).convert("RGB")
        im.save(dst, "JPEG", quality=82, optimize=True, progressive=True)
    return str(dst)

SLIDES = [
    {"kind": "cover", "image": img("title"),
     "note": "November 2026  ·  INVESTOR PRESENTATION  ·  CONFIDENTIAL"},

    {"kind": "text", "eyebrow": "THE PROBLEM",
     "headline": ["Fitness apps promised a coach.",
                  "They shipped a **spreadsheet.**"],
     "bullets": [
         "**Numbers without guidance.** A tracker tells you what you ate. It never tells you what to do next.",
         "**Ghost answers.** AI chat with nobody accountable behind it, and no way to reach a human.",
         "**Ad-funded attention.** Free apps monetise members' data and their workout photos.",
         "**First-week churn.** New members quit when nothing explains the plate, the programme, or the progress.",
     ]},

    {"kind": "text", "eyebrow": "THE SOLUTION",
     "headline": ["One app: eat. train. **badge.**"],
     "cards": [
         ("EAT", "My Plate Truth. Photograph any plate: what it is, what it does for you, and ask it anything right there."),
         ("TRAIN", "148 guided disciplines, a routine built in four taps, and a log that remembers every rep."),
         ("BADGE", "Progress charted week after week. Real trainers a tap away. Works offline, anywhere."),
     ]},

    {"kind": "image", "image": img("scan")},
    {"kind": "image", "image": img("grid")},
    {"kind": "image", "image": img("ex")},
    {"kind": "image", "image": img("projection")},
    {"kind": "image", "image": img("coach")},
    {"kind": "image", "image": img("eq")},
    {"kind": "image", "image": img("download")},

    {"kind": "demo", "eyebrow": "THE DEMO",
     "headline": ["The full tour in **1:47.**"],
     "bullets": [
         "**Narrated product tour.** Every MVP feature, deep-voice narration, hip-hop score.",
         "**Live now.** gymbadge.vercel.app/demo - scan to watch.",
         "**Plays anywhere.** Any browser, any phone, no install.",
     ]},

    {"kind": "text", "eyebrow": "THE MARKET",
     "headline": ["Nobody bundles the floor",
                  "and **the plate.**"],
     "bullets": [
         "**The category.** Global fitness apps: **$12.1B in 2025**, growing **13.4% a year to $33.6B by 2033** (Grand View Research, Fitness Apps Market, 2026-2033).",
         "**Our wedge.** Food truth plus guided training plus NFC equipment tags - one membership, three jobs.",
         "**Distribution built in.** A link installs the app. No store review, no 30% cut, updates land instantly.",
         "**Channels are users.** Every gym and every trainer in the product is a distribution point, not a cost line.",
     ]},

    {"kind": "table", "eyebrow": "COMPETITIVE LANDSCAPE",
     "headline": ["Trackers count. **We change the plate.**"],
     "col_w": [336, 172, 172, 172],
     "rows": [
         ["CAPABILITY", "GYM BADGE", "FITNESS TRACKERS", "AI CHATBOTS"],
         ["Plate truth from a photo, with follow-up questions", "YES", "Database logging", "Text answers only"],
         ["148 guided disciplines + routine builder", "YES", "Running plans only", "-"],
         ["Live gym equipment status (NFC / QR)", "YES", "-", "-"],
         ["Offline-first, installs from a link, no store cut", "YES", "Varies", "-"],
         ["No ads, no data sales, human support", "YES", "Ads / paywalls", "Varies"],
     ],
     "footline": "**Why now:** 858M fitness-app downloads in 2023 (Business of Apps) - none of them own the floor."},

    {"kind": "text", "eyebrow": "BUSINESS MODEL",
     "headline": ["Grow on trust, **not traps.**"],
     "cards": [
         ("MEMBERS", "Free core, premium depth. Premium **~$3.23/mo** (₦5,000) across 16 currencies; Elite ~$6.13/mo."),
         ("GYMS", "Equipment tags and floor analytics. Seats from **$1.94/seat/mo** - Team, Business, Enterprise."),
         ("TRAINERS", "Bookings and marketplace share. **15%** at launch, flexed per partner."),
     ],
     "footline": "List ARPU **≈$38.71/yr** · seats in blocks of 5/10/20 · **no ads, no data sales. Ever.**"},

    {"kind": "text", "eyebrow": "WHERE IT STANDS",
     "headline": ["Shipped. **Not slideware.**"],
     "bullets": [
         "**In production.** gymbadge.vercel.app - live, branded, current; offline-first PWA installs from a link.",
         "**Gated by tests.** 181 UI wiring checks and 165 behaviour checks gate every push; human support within one business day.",
         "**Traction so far.** 3,000+ on the waitlist · 100+ gym trainers in conversation · 2,000 views of the narrated ad in its first 36 hours.",
         "**First-12-month targets (targets, not results):** flagship gym house open · 10 gyms on NFC tags · weekly conversion tracking · trainer marketplace beta.",
         "**Channels are users.** Link-install means 0% store cut and instant updates; every gym in the product is a distribution point.",
     ]},

    {"kind": "text", "eyebrow": "ROADMAP",
     "headline": ["Three moves **from here.**"],
     "cards": [
         ("NOW", "Flagship gym house buildout. Gym partnerships for equipment tags."),
         ("NEXT", "Clubs, streaks and public badges. Trainer marketplace beta."),
         ("THEN", "Floor dashboard for gyms, B2B pilots. Months 6-12 post-close."),
     ]},

    {"kind": "team", "eyebrow": "THE TEAM",
     "headline": ["One founder. **Team-grade shipping.**"],
     "name": "Tearsmith",
     "role": "Founder & CEO",
     "bio": "Self-taught engineer and lifelong fitness builder - background across engineering, hands-on training and prior startup work. Designs, builds and operates Gym Badge end to end: product, the AI food engine, 148 exercise guides, payments across 16 currencies, and a pipeline that gates every push on 342 automated checks. One person already ships what normally takes a team.",
     "hires": "First hires on this round: two engineers, one growth & partnerships lead, one gym-ops lead for the flagship house."},

    {"kind": "ask", "eyebrow": "THE ASK",
     "headline": ["$1.5M pre-seed SAFE."],
     "funds": [("Flagship gym house - buildout & latest equipment", 30),
               ("Product & infrastructure", 25),
               ("Team", 25),
               ("Growth & partnerships", 15),
               ("Operations & support", 5)],
     "side": "$8M valuation cap · 20% discount · rolling close over 4-6 weeks.",
     "milestones": "**12-month milestones.** Flagship gym house open as the pilot floor · 10 gyms on NFC tags · premium conversion tracked weekly · trainer marketplace beta."},

    {"kind": "contact", "eyebrow": "CONTACT",
     "headline": ["Let's earn the badge **together.**"],
     "rows": ["gymbadgesupport@gmail.com",
              "gymbadge.vercel.app",
              "Tearsmith - Founder & CEO",
              "Gym Badge"]},

    {"kind": "gallery", "eyebrow": "APPENDIX - PRODUCT",
     "headline": ["More of the product."],
     "images": [img("how"), img("gyms"), img("prog"), img("support")]},

    {"kind": "text", "eyebrow": "APPENDIX - ENGINEERING",
     "headline": ["Built like it **matters.**"],
     "bullets": [
         "**Offline-first PWA.** Service worker with versioned caches; every release bump is tested, every asset revalidated.",
         "**Python API.** Rate-limited assistant with safety and escalation handling, verified email flows.",
         "**Media pipeline.** H.264 demos generated and verified in-repo - the same rigour as the app.",
         "**Brand discipline.** Approved artwork and real photography only; nothing reaches the screen untraceable.",
         "**Green before push.** Both suites gate every commit; production is re-verified after every deploy.",
     ]},
]

TOTAL = len(SLIDES)

# ---------------------------------------------------------------- shared bits
MARGIN = 54.0
RIGHT = W - MARGIN
CONTENT_W = RIGHT - MARGIN

def head_y():
    return 78.0

def content_y(slide):
    lines = slide.get("headline", [""])
    return head_y() + len(lines) * 46 + 34

def make_qr(url):
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M,
                       box_size=10, border=1)
    qr.add_data(url)
    qr.make(fit=True)
    img_obj = qr.make_image(fill_color="#121211", back_color="white")
    pil = getattr(img_obj, "_img", None)
    if pil is None:
        pil = getattr(img_obj, "image", img_obj)
    if not isinstance(pil, Image.Image):
        pil = img_obj.get_image() if hasattr(img_obj, "get_image") else pil
    pil = pil.convert("RGB")
    buf = BytesIO()
    pil.save(buf, "PNG")
    buf.seek(0)
    return buf, pil

QR_DEMO, QR_DEMO_PIL = make_qr("https://gymbadge.vercel.app/demo")
QR_APP, QR_APP_PIL = make_qr("https://gymbadge.vercel.app")

# ================================================================ PPTX
def build_pptx(path):
    from pptx import Presentation
    from pptx.util import Pt, Emu
    from pptx.dml.color import RGBColor
    from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
    from pptx.enum.shapes import MSO_SHAPE

    prs = Presentation()
    prs.slide_width = Pt(W)
    prs.slide_height = Pt(H)
    blank = prs.slide_layouts[6]
    prs.core_properties.title = "Gym Badge - Investor Presentation"
    prs.core_properties.author = "Tearsmith, Gym Badge"

    def rgb(h):
        return RGBColor.from_string(h)

    def rect(slide, x, y, w, h, fill, line=None, rounded=False, alpha=None):
        shape = slide.shapes.add_shape(
            MSO_SHAPE.ROUNDED_RECTANGLE if rounded else MSO_SHAPE.RECTANGLE,
            Pt(x), Pt(y), Pt(w), Pt(h))
        shape.fill.solid()
        shape.fill.fore_color.rgb = rgb(fill)
        if alpha is not None:
            try:
                from pptx.oxml.ns import qn
                solid = shape._element.spPr.find(qn("a:solidFill"))
                clr = solid.find(qn("a:srgbClr"))
                el = clr.makeelement(qn("a:alpha"),
                                     {"val": str(int(alpha * 100000))})
                clr.append(el)
            except Exception:
                pass
        if line:
            shape.line.color.rgb = rgb(line)
            shape.line.width = Pt(1)
        else:
            shape.line.fill.background()
        shape.shadow.inherit = False
        if rounded:
            try:
                shape.adjustments[0] = 0.06
            except Exception:
                pass
        return shape

    def text(slide, x, baseline, runs_, size, color=None, bold=False,
             align="left", spc=None, width=None):
        """runs_: string or list of (txt, bold, ph). baseline = top-left y of text."""
        if isinstance(runs_, str):
            runs_ = parse(runs_)
        w = width if width else (RIGHT - x)
        tb = slide.shapes.add_textbox(Pt(x), Pt(baseline - size * 0.82),
                                      Pt(w), Pt(size * 1.9))
        tf = tb.text_frame
        tf.word_wrap = False
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
        tf.vertical_anchor = MSO_ANCHOR.TOP
        p = tf.paragraphs[0]
        p.alignment = {"left": PP_ALIGN.LEFT, "right": PP_ALIGN.RIGHT,
                       "center": PP_ALIGN.CENTER}[align]
        for t, b, ph in runs_:
            r = p.add_run()
            r.text = t
            f = r.font
            f.name = FONT
            f.size = Pt(size)
            f.bold = b or bold
            f.color.rgb = rgb(CORAL if ph else (color or TEXT))
            if spc:
                try:
                    r._r.get_or_add_rPr().set("spc", str(int(spc * 100)))
                except Exception:
                    pass
        return tb

    def picture(slide, source, x, y, w=None, h=None):
        if w and h:
            return slide.shapes.add_picture(source, Pt(x), Pt(y), Pt(w), Pt(h))
        if w:
            return slide.shapes.add_picture(source, Pt(x), Pt(y), width=Pt(w))
        return slide.shapes.add_picture(source, Pt(x), Pt(y), height=Pt(h))

    def fit_box(path, x, y, bw, bh):
        iw, ih = Image.open(path).size
        s = min(bw / iw, bh / ih)
        w, h = iw * s, ih * s
        return x + (bw - w) / 2, y + (bh - h) / 2, w, h

    def footer(slide, idx):
        text(slide, MARGIN, H - 22,
             "GYM BADGE  ·  INVESTOR PRESENTATION  ·  CONFIDENTIAL",
             8.5, color=FOOT, spc=1.2)
        text(slide, RIGHT - 120, H - 22, f"{idx:02d} / {TOTAL:02d}",
             8.5, color=FOOT, align="right", spc=1.2, width=120)

    def chrome(slide, s):
        rect(slide, 0, 0, W, H, BG)
        rect(slide, MARGIN, 46, 40, 3, GOLD)
        text(slide, MARGIN + 56, 54, s["eyebrow"], 13, color=CORAL,
             bold=True, spc=2.6)
        y = head_y()
        for line in s["headline"]:
            text(slide, MARGIN, y + 34, line, 38, bold=True)
            y += 46

    def bullets(slide, x, y, items, max_w, size=16, line_h=25, gap=15):
        for item in items:
            lines = wrap(parse(item), size, max_w - 18)
            for li, line in enumerate(lines):
                lx = x + (0 if li == 0 else 18)
                if li == 0:
                    text(slide, x, y + size * 0.82, "•", size, color=CORAL, bold=True)
                runs_ = [(w + (" " if i < len(line) - 1 else ""), b, p)
                         for i, (w, b, p) in enumerate(line)]
                text(slide, lx + (18 if li == 0 else 0), y + size * 0.82,
                     runs_, size, width=max_w)
                y += line_h
            y += gap
        return y

    def cards(slide, s, y):
        n = len(s["cards"])
        gap = 24.0
        cw = (CONTENT_W - gap * (n - 1)) / n
        ch = 170.0
        for i, (title, body) in enumerate(s["cards"]):
            cx = MARGIN + i * (cw + gap)
            rect(slide, cx, y, cw, ch, SURFACE, LINE, rounded=True)
            text(slide, cx + 16, y + 30, title, 13, color=CORAL, bold=True, spc=2.2)
            blines = wrap(parse(body), 14, cw - 32)
            by = y + 56
            for line in blines:
                runs_ = [(w + (" " if j < len(line) - 1 else ""), b, p)
                         for j, (w, b, p) in enumerate(line)]
                text(slide, cx + 16, by + 11.5, runs_, 14, color=TEXT, width=cw - 32)
                by += 20
        return y + ch

    for idx, s in enumerate(SLIDES, 1):
        slide = prs.slides.add_slide(blank)
        kind = s["kind"]

        if kind in ("cover", "image"):
            picture(slide, s["image"], 0, 0, w=W)

        if kind == "cover":
            text(slide, W - 560, 46, s["note"], 11.5, color=MUTED,
                 align="right", spc=1.8, width=504)
            continue

        if kind == "image":
            rect(slide, 0, H - 34, W, 34, BG, alpha=0.72)
            footer(slide, idx)
            continue

        rect(slide, 0, 0, W, H, BG)
        chrome(slide, s)
        y = content_y(s)

        if kind == "text":
            if "bullets" in s:
                bullets(slide, MARGIN, y, s["bullets"], CONTENT_W - 40)
            if "cards" in s:
                y = cards(slide, s, y)
            if s.get("footline"):
                text(slide, MARGIN, y + 46, s["footline"], 17, bold=True)

        elif kind == "table":
            cols = s["col_w"]
            rh = 46.0
            ty = y - 6
            for ri, row in enumerate(s["rows"]):
                cx = MARGIN
                for ci, cell in enumerate(row):
                    cw_ = cols[ci]
                    if ri == 0:
                        rect(slide, cx, ty, cw_, rh, SURFACE, LINE)
                        text(slide, cx + 12, ty + rh * 0.62, cell, 12,
                             color=CORAL, bold=True, spc=1.4, width=cw_ - 24)
                    else:
                        rect(slide, cx, ty, cw_, rh,
                             SURFACE if ri % 2 else BG, LINE)
                        hi = ci == 1
                        lines = wrap(parse(cell), 13, cw_ - 20)
                        by = ty + (rh - len(lines[:2]) * 17) / 2
                        for line in lines[:2]:
                            runs_ = [(t + (" " if k < len(line) - 1 else ""),
                                      b, p) for k, (t, b, p) in enumerate(line)]
                            text(slide, cx, by + 11, runs_, 13,
                                 color=(CORAL if hi else
                                        (TEXT if ci == 0 else MUTED)),
                                 bold=hi, align="center", width=cw_)
                            by += 17
                    cx += cw_
                ty += rh
            text(slide, MARGIN, ty + 30, s["footline"], 15, bold=True)

        elif kind == "team":
            lx, ly, lw, lh = fit_box(str(LOGO), MARGIN, y - 4, 236, 236)
            picture(slide, str(LOGO), lx, ly, w=lw, h=lh)
            rx, rw = 344.0, RIGHT - 344.0
            text(slide, rx, y + 26, s["name"], 27, bold=True)
            text(slide, rx, y + 58, s["role"], 15, color=CORAL,
                 bold=True, spc=1.6)
            by = y + 96
            for line in wrap(parse(s["bio"]), 14.5, rw):
                runs_ = [(t + (" " if k < len(line) - 1 else ""), b, p)
                         for k, (t, b, p) in enumerate(line)]
                text(slide, rx, by + 12, runs_, 14.5, color=TEXT, width=rw)
                by += 22
            by += 18
            rect(slide, rx, by, 40, 3, GOLD)
            by += 22
            for line in wrap(parse(s["hires"]), 14, rw):
                runs_ = [(t + (" " if k < len(line) - 1 else ""), b, p)
                         for k, (t, b, p) in enumerate(line)]
                text(slide, rx, by + 12, runs_, 14, color=MUTED, width=rw)
                by += 20

        elif kind == "demo":
            bullets(slide, MARGIN, y, s["bullets"], 400)
            px, py = 516.0, 96.0
            pw = 390.0
            ph = pw * 9 / 16
            picture(slide, str(POSTER), px, py, w=pw, h=ph)
            text(slide, px, py + ph + 28, "The 1:47 investor cut", 12.5, color=MUTED)
            picture(slide, BytesIO(QR_DEMO.getvalue()), px, py + ph + 44, w=104, h=104)
            text(slide, px + 124, py + ph + 96, "Scan to watch", 15, bold=True)
            text(slide, px + 124, py + ph + 120,
                 "gymbadge.vercel.app/demo", 12.5, color=CORAL)

        elif kind == "ask":
            fy = y
            for label, pct in s["funds"]:
                text(slide, MARGIN, fy + 13, label, 15.5, bold=True)
                text(slide, RIGHT - 90, fy + 13, f"{pct}%", 15.5, color=CORAL,
                     bold=True, align="right", width=90)
                rect(slide, MARGIN, fy + 25, CONTENT_W, 9, SURFACE, rounded=True)
                rect(slide, MARGIN, fy + 25, CONTENT_W * pct / 100.0, 9,
                     CORAL, rounded=True)
                fy += 50
            text(slide, MARGIN, fy + 24, s["side"], 14, color=MUTED)
            my = fy + 50
            for line in wrap(parse(s["milestones"]), 13.5, CONTENT_W):
                runs_ = [(t + (" " if k < len(line) - 1 else ""), b, p)
                         for k, (t, b, p) in enumerate(line)]
                text(slide, MARGIN, my + 11, runs_, 13.5, color=TEXT,
                     width=CONTENT_W)
                my += 19

        elif kind == "contact":
            lx, ly, lw, lh = fit_box(str(LOGO), MARGIN, y + 6, 250, 250)
            picture(slide, str(LOGO), lx, ly, w=lw, h=lh)
            rx = 380.0
            ry = y + 30
            sizes = [20, 19, 16.5, 16.5]
            for i, row in enumerate(s["rows"]):
                text(slide, rx, ry + sizes[i] * 0.82, row, sizes[i],
                     color=CORAL if i == 1 else TEXT, bold=(i == 0))
                ry += sizes[i] + 26
            picture(slide, BytesIO(QR_APP.getvalue()), RIGHT - 110, y + 30, w=110, h=110)
            text(slide, RIGHT - 160, y + 168, "Scan to open the app", 12.5,
                 color=MUTED, align="center", width=210)

        elif kind == "gallery":
            iw, ih = 300.0, 169.0
            gx = (W - (iw * 2 + 20)) / 2
            gy = y - 10
            for i, p in enumerate(s["images"]):
                x = gx + (i % 2) * (iw + 20)
                yy = gy + (i // 2) * (ih + 16)
                picture(slide, p, x, yy, w=iw, h=ih)

        footer(slide, idx)

    prs.save(str(path))
    return path

# ================================================================ PDF
def build_pdf(path):
    from reportlab.pdfgen import canvas
    from reportlab.lib.utils import ImageReader

    c = canvas.Canvas(str(path), pagesize=(W, H))
    c.setTitle("Gym Badge - Investor Presentation")
    c.setAuthor("Tearsmith, Gym Badge")

    def Y(top):
        return H - top

    def rect(x, top, w, h, fill, line=None, rounded=False, alpha=None):
        r = c.beginPath()
        if rounded:
            rad = min(6, h / 2)
            r.roundRect(x, Y(top) - h, w, h, rad)
        else:
            r.rect(x, Y(top) - h, w, h)
        c.setFillColorRGB(*_rgb(fill))
        if alpha is not None:
            try:
                c.setFillAlpha(alpha)
            except Exception:
                pass
        if line:
            c.setStrokeColorRGB(*_rgb(line))
            c.setLineWidth(1)
            c.drawPath(r, stroke=1, fill=1)
        else:
            c.drawPath(r, stroke=0, fill=1)
        if alpha is not None:
            try:
                c.setFillAlpha(1)
            except Exception:
                pass

    def _rgb(h):
        return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))

    def text(x, baseline, runs_, size, color=None, bold=False,
             align="left", spc=None, width=None):
        if isinstance(runs_, str):
            runs_ = parse(runs_)
        total = sum(tw(t, size, b or bold) for t, b, _ in runs_)
        if spc:
            total += spc * sum(len(t) for t, _, _ in runs_)
        if align == "right":
            x = x + (width or 0) - total
        elif align == "center":
            x = x + ((width or 0) - total) / 2
        for t, b, ph in runs_:
            c.setFont(_pdf_font(b or bold), size)
            c.setFillColorRGB(*_rgb(CORAL if ph else (color or TEXT)))
            if spc:
                for ch in t:
                    c.drawString(x, Y(baseline), ch)
                    x += tw(ch, size, b or bold) + spc
            else:
                c.drawString(x, Y(baseline), t)
                x += tw(t, size, b or bold)

    _pdf_cache = {}
    def _pdf_font(bold):
        key = bool(bold)
        if key not in _pdf_cache:
            from reportlab.pdfbase import pdfmetrics
            from reportlab.pdfbase.ttfonts import TTFont
            name = "SegoeBold" if key else "Segoe"
            try:
                pdfmetrics.registerFont(TTFont(name, FONT_FILES[key]))
                _pdf_cache[key] = name
            except Exception:
                _pdf_cache[key] = "Helvetica-Bold" if key else "Helvetica"
        return _pdf_cache[key]

    def picture(source, x, top, w=None, h=None):
        if isinstance(source, (BytesIO, Image.Image)):
            ir = ImageReader(source)
            iw, ih = ir.getSize()
        else:
            ir = ImageReader(str(source))
            iw, ih = ir.getSize()
        if w and not h:
            h = w * ih / iw
        if h and not w:
            w = h * iw / ih
        c.drawImage(ir, x, Y(top) - h, width=w, height=h, mask="auto")

    def footer(idx):
        text(MARGIN, H - 18,
             "GYM BADGE  ·  INVESTOR PRESENTATION  ·  CONFIDENTIAL",
             8.5, color=FOOT, spc=1.2)
        text(RIGHT - 120, H - 18, f"{idx:02d} / {TOTAL:02d}",
             8.5, color=FOOT, align="right", spc=1.2, width=120)

    def chrome(s):
        rect(0, 0, W, H, BG)
        rect(MARGIN, 46, 40, 3, GOLD)
        text(MARGIN + 56, 54, s["eyebrow"], 13, color=CORAL, bold=True, spc=2.6)
        y = head_y()
        for line in s["headline"]:
            text(MARGIN, y + 34, line, 38, bold=True)
            y += 46

    def bullets(x, y, items, max_w, size=16, line_h=25, gap=15):
        for item in items:
            lines = wrap(parse(item), size, max_w - 18)
            for li, line in enumerate(lines):
                if li == 0:
                    text(x, y + size * 0.82, "•", size, color=CORAL, bold=True)
                lx = x + (18 if li == 0 else 18)
                runs_ = [(w + (" " if i < len(line) - 1 else ""), b, p)
                         for i, (w, b, p) in enumerate(line)]
                text(lx, y + size * 0.82, runs_, size)
                y += line_h
            y += gap
        return y

    def cards(s, y):
        n = len(s["cards"])
        gap = 24.0
        cw = (CONTENT_W - gap * (n - 1)) / n
        ch = 170.0
        for i, (title, body) in enumerate(s["cards"]):
            cx = MARGIN + i * (cw + gap)
            rect(cx, y, cw, ch, SURFACE, LINE, rounded=True)
            text(cx + 16, y + 30, title, 13, color=CORAL, bold=True, spc=2.2)
            blines = wrap(parse(body), 14, cw - 32)
            by = y + 56
            for line in blines:
                runs_ = [(w + (" " if j < len(line) - 1 else ""), b, p)
                         for j, (w, b, p) in enumerate(line)]
                text(cx + 16, by + 11.5, runs_, 14)
                by += 20
        return y + ch

    for idx, s in enumerate(SLIDES, 1):
        kind = s["kind"]

        if kind in ("cover", "image"):
            picture(s["image"], 0, 0, w=W)

        if kind == "cover":
            text(W - 560, 46, s["note"], 11.5, color=MUTED, align="right",
                 spc=1.8, width=504)
            c.showPage()
            continue

        if kind == "image":
            rect(0, H - 34, W, 34, BG, alpha=0.72)
            footer(idx)
            c.showPage()
            continue

        chrome(s)
        y = content_y(s)

        if kind == "text":
            if "bullets" in s:
                bullets(MARGIN, y, s["bullets"], CONTENT_W - 40)
            if "cards" in s:
                y = cards(s, y)
            if s.get("footline"):
                text(MARGIN, y + 46, s["footline"], 17, bold=True)

        elif kind == "table":
            cols = s["col_w"]
            rh = 46.0
            ty = y - 6
            for ri, row in enumerate(s["rows"]):
                cx = MARGIN
                for ci, cell in enumerate(row):
                    cw_ = cols[ci]
                    if ri == 0:
                        rect(cx, ty, cw_, rh, SURFACE, LINE)
                        text(cx + 12, ty + rh * 0.62, cell, 12, color=CORAL,
                             bold=True, spc=1.4, width=cw_ - 24)
                    else:
                        rect(cx, ty, cw_, rh,
                             SURFACE if ri % 2 else BG, LINE)
                        hi = ci == 1
                        lines = wrap(parse(cell), 13, cw_ - 20)
                        by = ty + (rh - len(lines[:2]) * 17) / 2
                        for line in lines[:2]:
                            runs_ = [(t + (" " if k < len(line) - 1 else ""),
                                      b, p) for k, (t, b, p) in enumerate(line)]
                            text(cx, by + 11, runs_, 13,
                                 color=(CORAL if hi else
                                        (TEXT if ci == 0 else MUTED)),
                                 bold=hi, align="center", width=cw_)
                            by += 17
                    cx += cw_
                ty += rh
            text(MARGIN, ty + 30, s["footline"], 15, bold=True)

        elif kind == "team":
            iw, ih = Image.open(str(LOGO)).size
            box = 236.0
            sc = min(box / iw, box / ih)
            lwd, lht = iw * sc, ih * sc
            picture(str(LOGO), MARGIN + (box - lwd) / 2,
                    y - 4 + (box - lht) / 2, w=lwd, h=lht)
            rx, rw = 344.0, RIGHT - 344.0
            text(rx, y + 26, s["name"], 27, bold=True)
            text(rx, y + 58, s["role"], 15, color=CORAL, bold=True, spc=1.6)
            by = y + 96
            for line in wrap(parse(s["bio"]), 14.5, rw):
                runs_ = [(t + (" " if k < len(line) - 1 else ""), b, p)
                         for k, (t, b, p) in enumerate(line)]
                text(rx, by + 12, runs_, 14.5, color=TEXT, width=rw)
                by += 22
            by += 18
            rect(rx, by, 40, 3, GOLD)
            by += 22
            for line in wrap(parse(s["hires"]), 14, rw):
                runs_ = [(t + (" " if k < len(line) - 1 else ""), b, p)
                         for k, (t, b, p) in enumerate(line)]
                text(rx, by + 12, runs_, 14, color=MUTED, width=rw)
                by += 20

        elif kind == "demo":
            bullets(MARGIN, y, s["bullets"], 400)
            px, py, pw = 516.0, 96.0, 390.0
            ph = pw * 9 / 16
            picture(str(POSTER), px, py, w=pw)
            text(px, py + ph + 28, "The 1:47 investor cut", 12.5, color=MUTED)
            picture(QR_DEMO_PIL, px, py + ph + 44, w=104, h=104)
            text(px + 124, py + ph + 96, "Scan to watch", 15, bold=True)
            text(px + 124, py + ph + 120, "gymbadge.vercel.app/demo", 12.5, color=CORAL)

        elif kind == "ask":
            fy = y
            for label, pct in s["funds"]:
                text(MARGIN, fy + 13, label, 15.5, bold=True)
                text(RIGHT - 90, fy + 13, f"{pct}%", 15.5, color=CORAL,
                     bold=True, align="right", width=90)
                rect(MARGIN, fy + 25, CONTENT_W, 9, SURFACE, rounded=True)
                rect(MARGIN, fy + 25, CONTENT_W * pct / 100.0, 9, CORAL, rounded=True)
                fy += 50
            text(MARGIN, fy + 24, s["side"], 14, color=MUTED)
            my = fy + 50
            for line in wrap(parse(s["milestones"]), 13.5, CONTENT_W):
                runs_ = [(t + (" " if k < len(line) - 1 else ""), b, p)
                         for k, (t, b, p) in enumerate(line)]
                text(MARGIN, my + 11, runs_, 13.5, color=TEXT, width=CONTENT_W)
                my += 19

        elif kind == "contact":
            iw, ih = Image.open(str(LOGO)).size
            box = 250.0
            sc = min(box / iw, box / ih)
            w, h = iw * sc, ih * sc
            picture(str(LOGO), MARGIN + (box - w) / 2, y + 6 + (box - h) / 2, w=w, h=h)
            rx, ry = 380.0, y + 30
            sizes = [20, 19, 16.5, 16.5]
            for i, row in enumerate(s["rows"]):
                text(rx, ry + sizes[i] * 0.82, row, sizes[i],
                     color=CORAL if i == 1 else TEXT, bold=(i == 0))
                ry += sizes[i] + 26
            picture(QR_APP_PIL, RIGHT - 110, y + 30, w=110, h=110)
            text(RIGHT - 160, y + 168, "Scan to open the app", 12.5,
                 color=MUTED, align="center", width=210)

        elif kind == "gallery":
            iw, ih = 300.0, 169.0
            gx = (W - (iw * 2 + 20)) / 2
            gy = y - 10
            for i, p in enumerate(s["images"]):
                x = gx + (i % 2) * (iw + 20)
                yy = gy + (i // 2) * (ih + 16)
                picture(p, x, yy, w=iw, h=ih)

        footer(idx)
        c.showPage()

    c.save()
    return path

# ================================================================ main
if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    p1 = build_pptx(OUT / "gymbadge-investor-deck.pptx")
    p2 = build_pdf(OUT / "gymbadge-investor-deck.pdf")
    print("pptx:", p1, f"{p1.stat().st_size // 1024} KB")
    print("pdf: ", p2, f"{p2.stat().st_size // 1024} KB")
    print("slides:", TOTAL)
