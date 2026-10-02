#!/usr/bin/env python3
"""Generates the rider's SVG art: src/features/ride/engine/riderArt.ts. Run: python3 scripts/rider/build.py

The rider is drawn from Raghav's character sheet as layered parts. Every part is authored in its bone's local frame
(origin = the joint it rotates around); skaterRig.ts poses the bones by setting each part's transform.
Units: 100 = 1 rig unit, y down, +x = the direction he faces. Colours are classes (.ac, .bl, .pk...) mapped to
CSS variables in RideLayer.module.css, so the palette stays in config/theme.ts.
The hair outline and its light/dark shapes are traced from the sheet's side view (hair_trace.json).
"""
import json, math, pathlib, re

HERE = pathlib.Path(__file__).parent


def f(v):
    s = f"{v:.2f}".rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


def P(d, cls="", bone=None, extra=""):
    b = f' data-bone="{bone}"' if bone else ""
    c = f' class="{cls}"' if cls else ""
    return f'<path{b}{c} d="{d}"{extra}/>'


def C(cx, cy, r, cls):
    return f'<circle class="{cls}" cx="{f(cx)}" cy="{f(cy)}" r="{f(r)}"/>'


# ---------------------------------------------------------------- arm
HAND = "M-7.4 44C-8.8 48-9.2 53-7.8 57.4C-6.4 61.4-1.6 63.2 2.6 62.2C5.6 61.4 7.6 58.6 7.6 55.6C10 55.2 12.2 53 12.2 50.2C12.2 47.6 9.8 46.4 7.2 47.4L7.2 44Z"
CUFF = "M-9.6 34L9.6 34C10.3 39 10.2 43.6 9.2 48.2Q0 50-9.2 48.2C-10.2 43.6-10.3 39-9.6 34Z"
CUFF_RIBS = "M-6.2 39.8V47.8M-3.1 40V48.6M0 40V48.9M3.1 40V48.6M6.2 39.8V47.8"
UPPER = (
    "M-15 0A15 15 0 0 1 15 0C16.4 18 16 38 14 55A14 14 0 0 1-14 55C-16 38-16.4 18-15 0Z"
)
FORE = "M-14 0A14 14 0 0 1 14 0C14.8 10 14.4 20 14.8 29C15 35 12.6 38.6 9 39.2C4.4 40-4.4 40-9 39.2C-12.6 38.6-15 35-14.8 29C-14.4 20-14.8 10-14 0Z"


def arm(side):
    up, fo = f"up-{side}", f"fore-{side}"
    near = side == "f"
    return (
        f'<g class="{"near" if near else "far"}">'
        f'<g data-bone="{fo}">'
        + P(HAND, "sk o")
        + P("M-5.6 54.2Q-1.4 56.6 3.4 54.6", "ln dt")
        + P(CUFF, "ac o")
        + P(CUFF_RIBS, "ln dt")
        + "</g>"
        + '<g class="u-st">'
        + P(UPPER, bone=up)
        + P(FORE, bone=fo)
        + "</g>"
        + '<g class="u-fi ac">'
        + P(UPPER, bone=up)
        + P(FORE, bone=fo)
        + "</g>"
        + P("M8.4 10Q11.6 20 10.6 30M-6.6 49Q0 53 7 48.6", "ln dt", up)
        + P("M-9.4 30Q-3.4 34.4 3.6 31.2M5 34.4Q8.8 35.4 11.6 33.2", "ln dt", fo)
        + "</g>"
    )


# ---------------------------------------------------------------- leg + skate
THIGH = "M-23 0C-23-9-12-14 0-14C12-14 23-9 23 0C25.4 20 26 44 22.2 72A21.4 21.4 0 0 1-21.4 72C-25 50-25.8 22-23 0Z"
SHIN = (
    "M-21.4 0A21.4 21.4 0 0 1 21.4 0C22.6 18 23.6 36 24 52C24.4 56 25.4 58.4 25 61.6C24.6 64 22.4 64.6 20.6 65"
    "L20.6 72.4Q0 74.6-20.6 72.4L-20.6 65C-22.4 64.6-24.6 64-25 61.6C-25.4 58.4-24.4 56-24 52C-23.6 36-22.6 18-21.4 0Z"
)
# elastic jogger cuff, gathered tight over the boot collar
CUFF_L = "M-20.8 63.4L20.8 63.4C21.6 66.6 21.6 70 20.8 73.2Q0 75.4-20.8 73.2C-21.6 70-21.6 66.6-20.8 63.4Z"
CUFF_L_RIBS = (
    "M-15 65.4V73.6M-9 65.6V74.2M-3 65.6V74.5M3 65.6V74.5M9 65.6V74.2M15 65.4V73.6"
)


def pocket(sx):
    """Flapped cargo pocket on the outer thigh, for the front-facing legs; sx = -1 near (screen left), 1 far."""
    m = lambda d: warp_path(d, lambda x, y: (x * sx * 1.08, 34 + (y - 30) * 1.12))
    return (
        P(
            m(
                "M22 30L6.6 29.6C6.2 40 6.2 50 6.8 60.4Q7 63 9.6 63L19.6 63.4Q22.4 63.4 22.6 60.6C23 50 22.8 40 22 30Z"
            ),
            "bl ot",
        )
        + P(
            m("M19.8 44L19.6 60Q19.6 61 18.6 61L10.4 60.8Q9.2 60.8 9.2 59.6L9 44"),
            "st dt",
        )
        + P(
            m("M23 23.4L5.6 22.8L5.6 31.6Q5.6 34 8 34L20.6 34.4Q23 34.4 23 32Z"),
            "bl ot",
        )
        + C(14.2 * sx * 1.08, 34 - 0.6 * 1.12, 1.4, "ac ot")
    )


BOOT = (
    "M-19 0A19 19 0 0 1 19 0C20 5 24 8.6 30 10.2C40 12.6 49.6 15.8 50 24.4C50.2 28.4 49 30.6 46 30.6"
    "L-16.4 30.6C-19.6 30.4-21 27.8-21 23.6C-21 15-20 6-19 0Z"
)
SOLE = "M-22 27.8L48.2 27.8C51 27.8 52.4 29.6 52.4 31.8C52.4 34.2 50.6 35.6 47.8 35.6L-20.4 35.6C-23.2 35.6-24.6 34-24.6 31.8C-24.6 29.6-23.8 27.8-22 27.8Z"
TOESTOP = "M44.2 33.6L54.4 33.6Q57 33.6 56.8 36.4L56 41.6Q55.6 44 53 44L47 44Q44.6 44 44.4 41.6Z"
WHEELS = [(-9, 41), (32, 41)]
WR = 9


def star(cx, cy, r):
    pts = []
    for i in range(10):
        a = -math.pi / 2 + i * math.pi / 5
        rr = r if i % 2 == 0 else r * 0.45
        pts.append(f"{f(cx + rr * math.cos(a))} {f(cy + rr * math.sin(a))}")
    return "M" + "L".join(pts) + "Z"


def skate_mark(x, y, k=1.0, squash=1.0):
    """A big star on the boot's ankle side, sized to sit inside the boot. dt: it drops out at rail size."""
    return (
        f'<g class="dt" transform="translate({f(x)} {f(y)}) scale({f(k * squash)} {f(k)}) rotate(-8)">'
        + P(star(0, 0, 9.4), "w ot", extra=' stroke-linejoin="round"')
        + "</g>"
    )


def skate_front():
    """The near skate seen from the front (stance, facing us): toe toward the viewer, turned a touch to his front
    (screen right). Front wheels splay out either side of the toe cap, the back pair tucks in behind and sits a bit
    higher (further away), and the toe stop is the nearest thing, so it goes on last."""
    s = '<g class="sk-front">'
    s += '<ellipse class="whs o" cx="-12.6" cy="37.4" rx="3.8" ry="7.8"/>'
    s += '<ellipse class="whs o" cx="19.4" cy="37" rx="3.6" ry="7.6"/>'
    s += P("M-12 33.6L18.6 33.2L17.6 37.6L-11 38Z", "pl o")
    s += P("M-17 39.4L25 39.4L25 43.4L-17 43.4Z", "pl o")
    for x in (-18.6, 26.6):
        s += f'<ellipse class="wh o" cx="{f(x)}" cy="41.4" rx="4.8" ry="8.6"/>'
        s += f'<ellipse class="wrim dt" cx="{f(x)}" cy="41.4" rx="2.9" ry="5.6"/>'
        s += f'<ellipse class="hub ot" cx="{f(x)}" cy="41.4" rx="1.6" ry="3"/>'
    s += P(
        "M-19 0C-19.6 8-21.6 16-22.4 24C-22.8 28-20.6 31-16 31L24 31C28.6 31 30.4 28 29.8 24C29 16 21 8 19 0Z",
        "pk o",
    )
    s += P(
        "M-19 0C-19.6 8-21.6 16-22.4 24C-22.8 28-20.6 31-16 31L-12 31C-15 24-14.6 10-13 0Z",
        "pks",
    )
    s += P("M-12 30.6C-12 21-4 16.4 6 16.4C16 16.4 23.6 21 23.8 30.6", "ln")
    s += skate_mark(-17, 16, 0.62, 0.55)
    s += P("M-9 0C-8.4 6-7 11-5 15.8M10 0C10.4 6 11.6 11 12.6 15.6", "ln dt")
    s += P("M-7.6 3.4L9.4 3.4M-6.6 8.2L10.6 8.2M-5.4 13L11.8 13", "lm dt")
    s += P(
        "M-22 28.6L28.6 28.6C31 28.6 32.4 30 32.4 32C32.4 34.4 30.6 36 28 36.2L5 37.6L-19.4 36.2C-22.4 36-24.4 34.4-24.4 32C-24.4 30-23.6 28.6-22 28.6Z",
        "k",
    )
    s += P(
        "M-1 36L11 36Q13 36 12.6 38.6L12 44Q11.6 46.4 9 46.4L1 46.4Q-1.6 46.4-2 44L-2.6 38.6Q-3 36-1 36Z",
        "wh o",
    )
    return s + "</g>"


def skate(bone, front=False):
    s = f'<g data-bone="{bone}">'
    if front:
        s += skate_front() + '<g class="sk-side">'
    s += C(-4.4, 40.4, 8.4, "whs o") + C(36.6, 40.4, 8.4, "whs o")
    s += P("M-10 37.4L33 37.4L33 42.2L-10 42.2Z", "wh o")
    s += P("M-7 33.4L23 33.4L20.6 39.6L-4.6 39.6Z", "pl o")
    for x, y in WHEELS:
        s += C(x, y, WR, "wh o")
    for x, y in WHEELS:
        s += C(x, y, 5.8, "wrim dt") + C(x, y, 3, "hub ot")
    s += P(TOESTOP, "wh o")
    s += P(BOOT, "pk o")
    s += P(
        "M-20.8 15.6C-13 16.4-8 21.2-6 30.6L-16.4 30.6C-19.6 30.4-21 27.8-21 23.6Z",
        "pks",
    )
    s += P("M-20.4 15.2C-12.8 16.2-7.6 21-6 30.4", "ln dt")
    s += P("M20.7 4L17.9 8.4M24.9 6.7L22.1 11.1M29.1 9.3L26.3 13.7", "lm dt")
    s += P("M33.4 30.4C33.6 23 36.4 16.8 40.6 13.2", "ln dt")
    s += skate_mark(6, 17)
    s += P(SOLE, "k")
    if front:
        s += "</g>"
    s += "</g>"
    return s


def leg(side):
    th, sh, ft = f"thigh-{side}", f"shin-{side}", f"foot-{side}"
    near = side == "f"
    s = f'<g class="{"near" if near else "far"}">'
    s += skate(ft, front=near)
    s += '<g class="u-st">' + P(THIGH, bone=th) + P(SHIN, bone=sh) + "</g>"
    s += '<g class="u-fi bl">' + P(THIGH, bone=th) + P(SHIN, bone=sh) + "</g>"
    s += f'<g data-bone="{sh}">'
    s += f'<clipPath id="shclip-{side}"><path d="{SHIN}"/></clipPath>'
    s += f'<g class="lg-front" clip-path="url(#shclip-{side})">'
    if near:
        s += P("M2 4C2.6 20 3 36 2.4 44", "ln dt")
    s += "</g>"
    # the gathered fold over the cuff, a couple of bunching creases above it, then the cuff itself
    s += P("M-23 57.4C-15 60.6-6 61-0.4 59.6C6 61 15 60.6 23 57.2", "ln")
    s += P(
        "M-19 49.6C-13 52.6-7 53-2.6 51.8M5.4 51.4C10.6 53 16 52.6 20.4 50.4", "ln dt"
    )
    s += P(CUFF_L, "bl ot") + P(CUFF_L_RIBS, "ln dt")
    s += "</g>"
    s += f'<g data-bone="{th}">'
    s += f'<clipPath id="thclip-{side}"><path d="{THIGH}"/></clipPath>'
    s += f'<g class="lg-front" clip-path="url(#thclip-{side})">'
    if near:
        s += pocket(-1)
        s += P("M3 8C4 30 4.4 50 3 70", "ln dt")
    else:
        s += pocket(1)
    s += "</g>"
    if near:
        s += '<g class="lg-side">'
        s += P(
            "M-4 37L21.4 36C21.8 45.6 21.6 55.4 21 64.4Q20.8 68 17.6 68.1L-1 68.6Q-4.2 68.6-4.2 65.4Z",
            "bl ot",
        )
        s += P(
            "M-1.8 44L-1.6 64Q-1.6 66-0.2 66L17.2 65.6Q18.8 65.6 18.8 63.8L19.2 43.4",
            "st dt",
        )
        s += P(
            "M-5.4 29.4L22.4 28L22.8 38.4Q22.8 41.2 20 41.3L-2.8 41.9Q-5.4 41.9-5.4 39.3Z",
            "bl ot",
        )
        s += C(8.6, 35.4, 1.5, "ac ot")
        s += "</g>"
    s += "</g></g>"
    return s


# ---------------------------------------------------------------- torso
GLYPH = (
    "M-12.6 0A6.6 11 0 1 0 0.6 0A6.6 11 0 1 0-12.6 0ZM-8.5 0A2.4 6.2 0 1 1-3.7 0A2.4 6.2 0 1 1-8.5 0Z"
    "M3.2-6.2L9.4-11L14.6-11L14.6 11L8.2 11L8.2-3.6L4.6-1.6Z"
)
BODY = (
    "M-38.5-87C-34-95-22-100.5-9.5-102C-6-96.4 0-91.4 6-90C10.6-91 14.6-95 17.2-100.4C24.4-99 30.4-94.8 34-88"
    "C38.2-77 40.2-62 41.6-46C43.2-32 44.4-14 43 0C42.4 3.6 41 5.8 39.2 6.8L39.2 15.4Q39 17.8 36.4 17.8L-36.8 17.8"
    "Q-39.6 17.8-39.6 15.4L-39.6 6.8C-41.6 5.6-43.2 3.2-43.4 0C-44.2-22-43.8-48-42-66C-41.2-76-40.4-83-38.5-87Z"
)


COLLAR_R = "M6-90C11-90.4 15.8-94.6 19.6-101.6L15.6-103C12.8-98.4 9.8-95.6 6.8-94.6Z"
# left band stops where the hood starts (cut at the hood's front edge) instead of running onto it
COLLAR_L = (
    "M-11.9-101.4C-7.6-95.9-1.3-91.7 6.6-89.4L7.2-94.4C1-96.0-3.5-99.0-6.9-103.6Z"
)


def collar(cords, aglets):
    return (
        P(cords, "cord")
        + P(cords, "cord-in")
        + P(aglets, "aglet")
        + P(aglets, "aglet-in")
        + P(COLLAR_R, "ac o")
        + P(COLLAR_L, "ac o")
    )


def broaden(x, y):
    """Shoulders out ~8%, easing to ~-2% at the hem, so the hoodie reads as a mild V instead of a box."""
    k = 1.08 - 0.10 * min(1, max(0, (y + 92) / 110))
    q = min(1, max(0, (abs(x) - 12) / 18))
    return x * (1 + (k - 1) * q * q * (3 - 2 * q)), y


def torso():
    ribs = "".join(f"M{f(x)} 9V15.8" for x in [-33.6 + 6.1 * i for i in range(12)])
    n01 = (
        '<g class="n01" transform="translate(18 -60.5) skewX(-9) scale(.76 .86)">'
        + P(
            GLYPH, "n-rim", extra=' transform="translate(-1.9 1.9)" fill-rule="evenodd"'
        )
        + P(GLYPH, "n-rim", extra=' fill-rule="evenodd"')
        + P(GLYPH, "n-ol", extra=' transform="translate(-1.9 1.9)" fill-rule="evenodd"')
        + P(GLYPH, "n-ol", extra=' fill-rule="evenodd"')
        + P(GLYPH, "n-face", extra=' fill-rule="evenodd"')
        + "</g>"
    )
    # the strings come out of eyelets on the hood rim, either side of the V
    cords, aglets = HOOD_CORDS
    art = (
        '<g id="tart">'
        + P(
            "M-6-104C-12-118-31-125-46-117.6C-58-111-60-91.6-53-78.4C-48.6-70.6-41.4-68.2-35.6-71L-24-96Z",
            "ac o",
        )
        + P(
            "M-7.6-104.6C-14-111.4-26-112.6-35-106C-30.6-104.4-26-101.2-23.4-97.4C-18.6-100.6-12.6-102.4-7.6-104.6Z",
            "acs",
        )
        + P("M-10-107C-22-114-36-110-42-96M-50.6-86C-48-80-44-75.6-39-73.6", "ln dt")
        + P("M-12-86L-12-128C-12-133.6 11-133.6 11-128L11-86Z", "sk o")
        + P("M-10.9-118L9.9-118L9.9-99C3-102.6-4-102.6-10.9-98Z", "sks")
        + P(warp_path(BODY, broaden), "ac o")
        + P("M-37.4 6.8L36.8 6.8", "ln")
        + P(ribs, "ln dt")
        + P("M6.4-42.6C1-35-0.8-16 2.6 6.8L6.6 6.8C4-14 4.6-32 9-40.6Z", "acs")
        + P("M42.6-45C29.6-45.8 15-45.6 6.4-42.6C1-35-0.8-16 2.6 6.8", "lm")
        + P("M41.8-41.8C29.6-42.6 15.6-42.4 9-39.6C4.6-33 3.6-16 6.2 5.8", "st dt")
        + P("M30.4-84C28.8-79 29-74 30.4-70M38.8-28C37.4-23 37.6-18 39-14", "ln dt")
        + n01
        + collar(cords, aglets)
        + "</g>"
    )
    return f'<g data-bone="spine">{art}</g>'


HOOD_CORDS = (
    "M4.6-90.6C3.8-85 4.4-80 3.8-74.6M11.4-91C12.4-86 11.8-81 12.4-77",
    "M3.8-75L3.6-70.4M12.4-77.4L12.6-72.8",
)


def hem_overlay():
    return (
        '<g data-bone="spine"><clipPath id="hemclip"><path d="M-80-12L80-12L80 40L-80 40Z"/></clipPath>'
        '<g clip-path="url(#hemclip)" data-copy="tart"></g></g>'
    )


# ---------------------------------------------------------------- head
# The traced side view has a big puff behind the ear; it's trimmed here rather than re-traced. Points behind x0 are
# pulled in: x compresses toward x0 at rate kx (easing in over `ease` units, so the outline never kinks or folds), and
# y moves toward the skull centre cy by the same weight, which lowers the back of the crown a little too.
HAIR_BACK = dict(x0=-16, ease=14, kx=0.5, cy=-6, ky=0.86)


def pull_back(x, y):
    H = HAIR_BACK
    d = H["x0"] - x
    if d <= 0:
        return x, y
    q = min(1, d / H["ease"])
    w = q * q * (3 - 2 * q)  # smoothstep weight, 0 at x0 -> 1 past the ease
    ramp = H["ease"] * (q**3 - q**4 / 2) + max(
        0, d - H["ease"]
    )  # integral of w over [0, d]
    return H["x0"] - (d - (1 - H["kx"]) * ramp), H["cy"] + (y - H["cy"]) * (
        1 - w * (1 - H["ky"])
    )


def warp_path(d, fn):
    """Applies fn(x, y) to every point of an absolute M/C/L/Z path (the tracer only writes those)."""
    out, nums, prev_pair = [], [], False
    for t in re.findall(r"[A-Za-z]|-?\d*\.?\d+", d):
        if t.isalpha():
            out.append(t)
            prev_pair = False
            continue
        nums.append(float(t))
        if len(nums) == 2:
            x, y = fn(*nums)
            nums = []
            out.append((" " if prev_pair else "") + f"{f(x)} {f(y)}")
            prev_pair = True
    assert not nums, "odd number count in path"
    return "".join(out)


def hair_traced():
    t = json.loads((HERE / "hair_trace.json").read_text())
    w = lambda d: warp_path(d, pull_back)
    return (
        '<g class="hair">'
        f'<path class="hr o" d="{w(t["sil"])}"/>'
        f'<path class="hlf dt" d="{"".join(w(d) for d in t["lt"])}"/>'
        f'<path class="crease dt" d="{"".join(w(d) for d in t["dk"])}"/>'
        "</g>"
    )


FACE = (
    "M-18.4-13C-19.6-2-19.8 9-18.4 17.6C-16.8 25.6-11.6 31.8-4 35C1.6 37.2 7.8 37.6 13.4 36"
    "C21 33.4 27 27.6 30.8 20C33.8 14.2 35.2 7.8 34.8 1.4C34.4-5.2 32.4-10 29.6-13.6L-12.6-17Z"
)
EYE_N = dict(cx=1.8, cy=8.6, rx=6, ry=6.5)
EYE_F = dict(cx=22.6, cy=9.2, rx=5, ry=6.3)


def eye(tag, e, iris):
    cx, cy, rx, ry = e["cx"], e["cy"], e["rx"], e["ry"]
    el = f'cx="{f(cx)}" cy="{f(cy)}" rx="{f(rx)}" ry="{f(ry)}"'
    return (
        f'<clipPath id="ec{tag}"><ellipse {el}/></clipPath>'
        f'<ellipse class="w eye-{tag}" {el}/>'
        f'<g clip-path="url(#ec{tag})"><g class="iris" data-eye="{tag}">{iris}</g></g>'
        f'<ellipse class="ot" fill="none" {el}/>'
    )


def head():
    iris_n = C(3, 9.3, 4.1, "ir") + C(3, 9.3, 2.2, "k") + C(4.5, 7.6, 1.15, "w")
    iris_f = (
        '<ellipse class="ir" cx="23.6" cy="9.9" rx="3.4" ry="4.05"/>'
        '<ellipse class="k" cx="23.6" cy="9.9" rx="1.8" ry="2.15"/>'
        + C(24.8, 8.3, 0.95, "w")
    )
    feat = (
        '<g class="feat">'
        + eye("n", EYE_N, iris_n)
        + P("M-4.6 7.4C-3.4 1.4 7 0.8 8 7.6", "lb")
        + '<g class="far-eye">'
        + eye("f", EYE_F, iris_f)
        + P("M17.6 8.2C18.2 2.6 26.6 2.2 27.6 8.6", "lb")
        + P("M16.4-1Q22.2-4.2 28.2-0.2", "lb")
        + "</g>"
        + P("M-5.6 0.6Q1.4-3.6 8.8-1.2", "lb")
        + P("M14 12.6C17.6 14 20 16.6 18.2 18.8C16.8 20.2 14.4 20 13.2 18.8", "lm")
        + P("M6.8 24.6Q12.6 28.6 18.8 23.8", "lm")
        + P("M5.5 23.3Q6 24.5 7.2 25.1", "ln")
        + C(-6.4, 13.6, 0.55, "sks dt")
        + C(-4.2, 15.2, 0.5, "sks dt")
        + C(-7.4, 16, 0.45, "sks dt")
        + "</g>"
    )
    art = (
        '<g transform="translate(4 -28)">'
        + '<g class="ear-far">'
        + P("M30 4C35.15 0.8 40.7 1.8 40.85 9.6C41 17.4 36.8 23.2 30 21.6Z", "sk o")
        + P("M34.55 8.4C38.15 7.8 38.6 14.6 35.6 17", "ln")
        + "</g>"
        + P(FACE, "sk o")
        + P(
            "M-18.6-6C-19.2 7-17.8 18.6-12.8 26.6C-9.8 31.2-6.6 33.6-4.2 34.8C-9.8 28.4-13 18.8-13.4 7.6C-13.6 1.4-13.2-3-12.4-6Z",
            "sks",
        )
        + hair_traced()
        + P(
            "M-17.2 5C-21.4 0.8-28.8 1.8-29 9.6C-29.2 17.4-23.6 23.2-17.8 21.6Z", "sk o"
        )
        + P("M-20.6 8.4C-25.4 7.8-26 14.6-22 17", "ln")
        + feat
        + "</g>"
    )
    return f'<g data-bone="head">{art}</g>'


def seat():
    # fills between the thigh tops under the hoodie; unoutlined and kept inside the legs, so it never shows
    return P(
        "M-20-12L20-12L20 2C20 4 18.6 5 16.6 5L-16.6 5C-18.6 5-20 4-20 2Z",
        "bl seat",
        "hips",
    )


def rider():
    return (
        '<g class="rider">'
        + arm("b")
        + leg("b")
        + seat()
        + torso()
        + head()
        + leg("f")
        + hem_overlay()
        + arm("f")
        + "</g>"
    )


def main():
    art = rider()
    assert "`" not in art and "${" not in art
    out = HERE.parents[1] / "src/features/ride/engine/riderArt.ts"
    out.write_text(
        "// Generated by scripts/rider/build.py from the character sheet. Do not edit by hand.\n"
        "/** The rider's layered SVG parts, posed by skaterRig.ts through each [data-bone] element's transform. */\n"
        f"export const RIDER_SVG = `{art}`;\n"
    )
    print("wrote", out, len(art), "bytes")


if __name__ == "__main__":
    main()
