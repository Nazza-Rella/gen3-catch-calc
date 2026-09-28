# pret の逆コンパイルソースから捕獲率計算ツール用のデータと画像を生成する
import csv, json, os, re, struct, sys
from PIL import Image

DECOMP = r'C:\Users\mutk0\Desktop\ポケモン\逆アセ'
EM = os.path.join(DECOMP, 'pokeemerald')
RS = os.path.join(DECOMP, 'pokeruby')
FR = os.path.join(DECOMP, 'pokefireredr')
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'build')
SRC = os.path.join(HERE, 'src')
os.makedirs(OUT, exist_ok=True)


def rd(path):
    return open(path, encoding='utf-8').read()


def jasc(path):
    lines = rd(path).split('\n')
    n = int(lines[2])
    return [tuple(int(v) for v in lines[3 + i].split()) for i in range(n)]


def hexcol(c):
    return '%02x%02x%02x' % c


# ---------------------------------------------------------------- species
TYPE_JP = {
    'NORMAL': 'ノーマル', 'FIGHTING': 'かくとう', 'FLYING': 'ひこう', 'POISON': 'どく', 'GROUND': 'じめん',
    'ROCK': 'いわ', 'BUG': 'むし', 'GHOST': 'ゴースト', 'STEEL': 'はがね', 'MYSTERY': '？？？', 'FIRE': 'ほのお',
    'WATER': 'みず', 'GRASS': 'くさ', 'ELECTRIC': 'でんき', 'PSYCHIC': 'エスパー', 'ICE': 'こおり',
    'DRAGON': 'ドラゴン', 'DARK': 'あく',
}

national = {}
for i, name in enumerate(re.findall(r'^\s*NATIONAL_DEX_(\w+),', rd(os.path.join(EM, 'include/constants/pokedex.h')), re.M)):
    national.setdefault(name, i)
national.pop('NONE', None)

info = {}
for m in re.finditer(r'\[SPECIES_(\w+)\]\s*=\s*\n\s*\{(.*?)\n    \}', rd(os.path.join(EM, 'src/data/pokemon/species_info.h')), re.S):
    body = m.group(2)
    t = re.search(r'\.types\s*=\s*\{\s*TYPE_(\w+),\s*TYPE_(\w+)\s*\}', body)
    info[m.group(1)] = dict(
        hp=int(re.search(r'\.baseHP\s*=\s*(\d+)', body).group(1)),
        rate=int(re.search(r'\.catchRate\s*=\s*(\d+)', body).group(1)),
        types=[t.group(1), t.group(2)],
    )

# サファリの逃げやすさはFRLGだけが使う値（エメラルドのデータは全部0）
fr_flee = {m.group(1): int(re.search(r'\.safariZoneFleeRate\s*=\s*(\d+)', m.group(2)).group(1))
           for m in re.finditer(r'\[SPECIES_(\w+)\]\s*=\s*\n\s*\{(.*?)\n    \}', rd(os.path.join(FR, 'src/data/pokemon/species_info.h')), re.S)
           if re.search(r'\.safariZoneFleeRate', m.group(2))}

ycoord = {m.group(1): int(m.group(2)) for m in re.finditer(
    r'\[SPECIES_(\w+)\]\s*=\s*\{[^}]*\.y_offset\s*=\s*(\d+)', rd(os.path.join(EM, 'src/data/pokemon_graphics/front_pic_coordinates.h')))}
elev = {m.group(1): int(m.group(2)) for m in re.finditer(
    r'\[SPECIES_(\w+)\]\s*=\s*(\d+)', rd(os.path.join(EM, 'src/data/pokemon_graphics/enemy_mon_elevation.h')))}
pic_sym = dict(re.findall(r'SPECIES_SPRITE\((\w+),\s*(\w+)\)', rd(os.path.join(EM, 'src/data/pokemon_graphics/front_pic_table.h'))))
pal_sym = dict(re.findall(r'SPECIES_PAL\((\w+),\s*(\w+)\)', rd(os.path.join(EM, 'src/data/pokemon_graphics/palette_table.h'))))
shiny_sym = dict(re.findall(r'SPECIES_SHINY_PAL\((\w+),\s*(\w+)\)', rd(os.path.join(EM, 'src/data/pokemon_graphics/shiny_palette_table.h'))))
incbin = {}
for f in ['src/anim_mon_front_pics.c', 'src/data/graphics/pokemon.h']:
    for sym, path in re.findall(r'(\w+)\[\]\s*=\s*INCBIN_U\d+\(\s*"([^"]+)"\s*\)', rd(os.path.join(EM, f))):
        incbin[sym] = path

names_jp = {}
for r in csv.DictReader(open(os.path.join(SRC, 'pokemon_species_names.csv'), encoding='utf-8')):
    if r['local_language_id'] == '1':
        names_jp[int(r['pokemon_species_id'])] = r['name']

by_dex = {}
for sp, dex in national.items():
    if dex > 386:
        continue
    by_dex[dex] = sp
assert len(by_dex) == 386, len(by_dex)


def species_png(sp):
    path = incbin[pic_sym[sp]].replace('.4bpp.lz', '.png')
    full = os.path.join(EM, path)
    if not os.path.exists(full) and sp == 'CASTFORM':
        full = os.path.join(EM, 'graphics/pokemon/castform/normal/anim_front.png')
    return full


def pal_file(sym):
    full = os.path.join(EM, incbin[sym].replace('.gbapal.lz', '.pal'))
    if not os.path.exists(full):
        full = full.replace('castform', 'castform/normal')
    return full


# 色番号をそのまま灰色値(×16)として持つ索引アトラス。実行時にパレットで着色する
COLS = 32
atlas = Image.new('L', (COLS * 64, ((386 * 2 + COLS - 1) // COLS) * 64), 0)
species = [None]
palettes = [None]
for dex in range(1, 387):
    sp = by_dex[dex]
    im = Image.open(species_png(sp))
    assert im.mode == 'P', sp
    w, h = im.size
    frames = h // 64
    for f in range(2):
        cell = im.crop((0, 64 * min(f, frames - 1), 64, 64 * min(f, frames - 1) + 64))
        data = bytes((v & 15) * 16 for v in cell.tobytes())
        idx = (dex - 1) * 2 + f
        atlas.paste(Image.frombytes('L', (64, 64), data), ((idx % COLS) * 64, (idx // COLS) * 64))
    nrm = jasc(pal_file(pal_sym[sp]))
    shn = jasc(pal_file(shiny_sym[sp]))
    palettes.append([''.join(hexcol(c) for c in nrm[:16]), ''.join(hexcol(c) for c in shn[:16])])
    si = info[sp]
    t1, t2 = si['types']
    species.append(dict(
        name=names_jp[dex], rate=si['rate'], hp=si['hp'], sf=fr_flee.get(sp, 0),
        types=[TYPE_JP[t1]] if t1 == t2 else [TYPE_JP[t1], TYPE_JP[t2]],
        y=ycoord.get(sp, 0), e=elev.get(sp, 0),
    ))
atlas.save(os.path.join(OUT, 'sprites.png'), optimize=True)
dex_of = {sp: dex for dex, sp in by_dex.items()}
print('species ok', len(species) - 1)

# ---------------------------------------------------------------- 戦闘背景
def render_bg(tiles_png, map_bin, pal_path, first_pal):
    t = Image.open(tiles_png)
    tp = t.load()
    tw = t.size[0] // 8
    P = jasc(pal_path)
    m = open(map_bin, 'rb').read()
    out = Image.new('RGB', (240, 112))
    op = out.load()
    for ty in range(14):
        for tx in range(30):
            v = struct.unpack_from('<H', m, (ty * 32 + tx) * 2)[0]
            ti, hf, vf, pl = v & 0x3FF, v >> 10 & 1, v >> 11 & 1, v >> 12
            for y in range(8):
                for x in range(8):
                    sx = 7 - x if hf else x
                    sy = 7 - y if vf else y
                    c = tp[(ti % tw) * 8 + sx, (ti // tw) * 8 + sy] & 15
                    op[tx * 8 + x, ty * 8 + y] = P[(pl - first_pal) * 16 + c]
    return out


bgdir = os.path.join(OUT, 'bg')
os.makedirs(bgdir, exist_ok=True)
EM_ENVS = {
    'tall_grass': ('tall_grass', 'palette'), 'long_grass': ('long_grass', 'palette'), 'sand': ('sand', 'palette'),
    'underwater': ('underwater', 'palette'), 'water': ('water', 'palette'), 'pond_water': ('pond_water', 'palette'),
    'rock': ('rock', 'palette'), 'cave': ('cave', 'palette'), 'building': ('building', 'palette'),
    'plain': ('building', '../plain/palette'), 'sky': ('sky', 'palette'),
    'groudon': ('cave', 'groudon'), 'kyogre': ('water', 'kyogre'),
}
for env, (gfx, pal) in EM_ENVS.items():
    d = os.path.join(EM, 'graphics/battle_environment', gfx)
    render_bg(os.path.join(d, 'tiles.png'), os.path.join(d, 'map.bin'), os.path.join(d, pal + '.pal'), 2).save(os.path.join(bgdir, 'em_' + env + '.png'))
FR_ENVS = ['grass', 'longgrass', 'sand', 'underwater', 'water', 'pond', 'mountain', 'cave', 'building']
for env in FR_ENVS:
    d = os.path.join(FR, 'graphics/battle_terrain', env)
    render_bg(os.path.join(d, 'terrain.png'), os.path.join(d, 'terrain.bin'), os.path.join(d, 'terrain.pal'), 2).save(os.path.join(bgdir, 'fr_' + env + '.png'))
# 全ポケモン用：FRLGに残っている完全未使用のスタジアム背景
d = os.path.join(FR, 'graphics/battle_terrain/unused/stadium')
render_bg(os.path.join(d, 'tiles.png'), os.path.join(d, 'map.bin'), os.path.join(d, 'palette1.pal'), 2).save(os.path.join(bgdir, 'all_stadium.png'))
print('bg ok')

# ---------------------------------------------------------------- ボール画像
balldir = os.path.join(OUT, 'balls')
os.makedirs(balldir, exist_ok=True)
BALLS = ['master', 'ultra', 'great', 'poke', 'safari', 'net', 'dive', 'nest', 'repeat', 'timer', 'luxury', 'premier']
icon_pal = {m.group(1): m.group(2) for m in re.finditer(r'\[ITEM_(\w+)_BALL\]\s*=\s*\{\w+,\s*gItemIconPalette_(\w+)\}', rd(os.path.join(EM, 'src/data/item_icon_table.h')))}


def to_rgba(im, pal=None):
    im = im.convert('P') if im.mode != 'P' else im
    P = pal or [tuple(im.getpalette()[i * 3:i * 3 + 3]) for i in range(16)]
    out = Image.new('RGBA', im.size)
    op = out.load()
    ip = im.load()
    for y in range(im.size[1]):
        for x in range(im.size[0]):
            c = ip[x, y] & 15
            op[x, y] = (0, 0, 0, 0) if c == 0 else P[c] + (255,)
    return out


def camel_to_snake(s):
    return re.sub(r'(?<!^)(?=[A-Z])', '_', s).lower()


for b in BALLS:
    icon = Image.open(os.path.join(EM, 'graphics/items/icons', b + '_ball.png'))
    pname = camel_to_snake(icon_pal[b.upper()])
    to_rgba(icon, jasc(os.path.join(EM, 'graphics/items/icon_palettes', pname + '.pal'))).save(os.path.join(balldir, b + '.png'))
    spr = Image.open(os.path.join(EM, 'graphics/balls', b + '.png'))
    to_rgba(spr).save(os.path.join(balldir, b + '_spr.png'))
# ボールが開いた時の粒（8x8 が 8コマ。パレットは circle_impact）
ptc = Image.open(os.path.join(EM, 'graphics/battle_anims/sprites/particles.png'))
ppal = Image.open(os.path.join(EM, 'graphics/battle_anims/sprites/circle_impact.png')).getpalette()[:48]
to_rgba(ptc, [tuple(ppal[i:i + 3]) for i in range(0, 48, 3)]).save(os.path.join(balldir, 'particles.png'))
print('balls ok')

# ---------------------------------------------------------------- 主人公の後ろ姿・メッセージ窓・ボックスアイコン
uidir = os.path.join(OUT, 'ui')
os.makedirs(uidir, exist_ok=True)
for name, proj, png, pal in [('brendan', EM, 'brendan', 'palettes/brendan'), ('brendan_rs', EM, 'brendan_rs', 'palettes/brendan_rs'), ('may_rs', EM, 'may_rs', 'palettes/may_rs'), ('wally', EM, 'wally', 'palettes/wally'),
                             ('red', FR, 'red_back_pic', 'palettes/red_back_pic'), ('leaf', FR, 'leaf_back_pic', 'palettes/leaf_back_pic')]:
    im = Image.open(os.path.join(proj, 'graphics/trainers/back_pics', png + '.png'))
    P = jasc(os.path.join(proj, 'graphics/trainers', pal + '.pal'))
    to_rgba(im, P).save(os.path.join(uidir, 'back_' + name + '.png'))


def render_textbox(tiles_png, map_bin, pal_path):
    t = Image.open(tiles_png)
    tp = t.load()
    tw = t.size[0] // 8
    ntile = tw * (t.size[1] // 8)
    P = jasc(pal_path)
    m = open(map_bin, 'rb').read()
    out = Image.new('RGB', (240, 48))
    op = out.load()
    for ty in range(14, 20):
        for tx in range(30):
            v = struct.unpack_from('<H', m, (ty * 32 + tx) * 2)[0]
            ti, hf, vf = v & 0x3FF, v >> 10 & 1, v >> 11 & 1
            for y in range(8):
                for x in range(8):
                    sx = 7 - x if hf else x
                    sy = 7 - y if vf else y
                    c = tp[(ti % tw) * 8 + sx, (ti // tw) * 8 + sy] & 15 if ti < ntile else 0
                    op[tx * 8 + x, (ty - 14) * 8 + y] = P[c]
    return out


to_rgba(Image.open(os.path.join(EM, 'graphics/battle_interface/ball_caught_indicator.png'))).save(os.path.join(uidir, 'caught.png'))
render_textbox(os.path.join(EM, 'graphics/battle_interface/textbox.png'), os.path.join(EM, 'graphics/battle_interface/textbox_map.bin'),
               os.path.join(EM, 'graphics/battle_interface/textbox_0.pal')).save(os.path.join(uidir, 'textbox_em.png'))
render_textbox(os.path.join(FR, 'graphics/battle_interface/textbox.png'), os.path.join(FR, 'graphics/battle_interface/textbox.bin'),
               os.path.join(FR, 'graphics/battle_interface/textbox1.pal')).save(os.path.join(uidir, 'textbox_fr.png'))

icon_of = dict(re.findall(r'\[SPECIES_(\w+)\]\s*=\s*(gMonIcon_\w+)', rd(os.path.join(EM, 'src/pokemon_icon.c'))))
icon_pal_idx = {m.group(1): int(m.group(2)) for m in re.finditer(
    r'\[SPECIES_(\w+)\]\s*=\s*(\d+)', re.search(r'gMonIconPaletteIndices\[\]\s*=\s*\{(.*?)\};', rd(os.path.join(EM, 'src/pokemon_icon.c')), re.S).group(1))}
icons = Image.new('L', (COLS * 32, ((386 + COLS - 1) // COLS) * 32), 0)
for dex in range(1, 387):
    sp = by_dex[dex]
    im = Image.open(os.path.join(EM, incbin[icon_of[sp]].replace('.4bpp', '.png')))
    cell = im.crop((0, 0, 32, 32))
    data = bytes((v & 15) * 16 for v in cell.tobytes())
    i = dex - 1
    icons.paste(Image.frombytes('L', (32, 32), data), ((i % COLS) * 32, (i // COLS) * 32))
    species[dex]['ip'] = icon_pal_idx.get(sp, 0)
icons.save(os.path.join(OUT, 'icons.png'), optimize=True)
icon_palettes = [''.join(hexcol(c) for c in jasc(os.path.join(EM, 'graphics/pokemon/icon_palettes/icon_palette_%d.pal' % i))[:16]) for i in range(3)]
# 体力ゲージの数字（pretの numbers1.png。0〜9 のあとに同じ太さの「/」を足す）
nums = Image.open(os.path.join(EM, 'graphics/battle_interface/numbers1.png')).convert('L')
SLASH = ['........', '.....BB.', '....BB..', '...BB...', '..BB....', '.BB.....', 'BB......', '........']
for tag, body, shadow in [('gba', (64, 72, 64), (208, 200, 168)), ('gc', (244, 240, 255), (90, 74, 138))]:
    sheet = Image.new('RGBA', (8 * 11, 8), (0, 0, 0, 0))
    sp = sheet.load()
    np_ = nums.load()
    for d in range(10):
        for y in range(8):
            for x in range(8):
                v = np_[8 + d * 8 + x, y]
                if v != 255:
                    sp[d * 8 + x, y] = (body if v < 180 else shadow) + (255,)
    # 影は数字と同じく右下に1ドットずらして付ける
    for y, row in enumerate(SLASH):
        for x, ch in enumerate(row):
            if ch == 'B' and x + 1 < 8 and y + 1 < 8 and SLASH[y + 1][x + 1] != 'B':
                sp[80 + x + 1, y + 1] = shadow + (255,)
    for y, row in enumerate(SLASH):
        for x, ch in enumerate(row):
            if ch == 'B':
                sp[80 + x, y] = body + (255,)
    sheet.save(os.path.join(uidir, 'hpnum_' + tag + '.png'))
# 体力ゲージ用の日本語小フォント（1文字 8x12。色番号1=文字、2=影）と、使う文字の文字コード
for fname in ('small', 'normal', 'bold'):
    fnt = Image.open(os.path.join(EM, 'graphics/fonts/japanese_' + fname + '.png'))
    Image.frombytes('L', fnt.size, bytes((v & 15) * 16 for v in fnt.tobytes())).save(os.path.join(uidir, 'font_' + fname + '.png'))
# FRLG の戦闘メッセージは FRLG 独自の日本語フォント（1文字 16x16 の升目・高さ12・文字ごとの幅）
fnt = Image.open(os.path.join(FR, 'graphics/fonts/japanese_normal.png'))
Image.frombytes('L', fnt.size, bytes((v & 15) * 16 for v in fnt.tobytes())).save(os.path.join(uidir, 'font_frnormal.png'))
FR_WIDTHS = [int(v) for v in re.search(r'sFontNormalJapaneseGlyphWidths\[\] =\s*\{([^}]*)\}', rd(os.path.join(FR, 'src', 'text.c'))).group(1).split(',') if v.strip()]
charmap = {}
for line in rd(os.path.join(EM, 'charmap.txt')).split('\n'):
    m = re.match(r"\s*'(.)'\s*=\s*([0-9A-Fa-f]{2})\s*$", line)
    if m:
        charmap.setdefault(m.group(1), int(m.group(2), 16))
need = set('Lv0123456789/ねむりこおりまひどくもうどくやけど')
for s_ in species[1:]:
    need |= set(s_['name'])
# 全角数字（ポリゴン２など）はゲームの数字と同じ字
for ch in list(need):
    if '０' <= ch <= '９' and ch not in charmap:
        charmap[ch] = charmap[chr(ord(ch) - 0xFEE0)]
FONT_CODES = {ch: code for ch, code in charmap.items() if code < 0x100 and not ('A' <= ch <= 'Z' or 'a' <= ch <= 'z')}
FONT_CODES.update({ch: charmap[ch] for ch in sorted(need) if ch in charmap})
for ch in 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz':
    if ch in charmap:
        FONT_CODES[ch] = charmap[ch]
# 体力ゲージの「Lv」は1文字分の専用記号（CHAR_EXTRA_SYMBOL + CHAR_LV_2 = 0x105）
FONT_CODES[''] = 0x105
missing = sorted(need - set(FONT_CODES))
print('font chars', len(FONT_CODES), 'missing', missing)
# 日本版の状態アイコン（どく/まひ/ねむり/こおり/やけど、各24x8）。体力ゲージ部品の並びから場所を割り出して ROM から取る
JP_ROM = r'C:\Users\mutk0\Desktop\VBA22\ROM・セーブ\POKEMON_EMER_BPEJ00.gba'


def to4bpp(im):
    px = im.load()
    out = bytearray()
    for ty in range(im.size[1] // 8):
        for tx in range(im.size[0] // 8):
            for y in range(8):
                for x in range(0, 8, 2):
                    out.append((px[tx * 8 + x, ty * 8 + y] & 15) | ((px[tx * 8 + x + 1, ty * 8 + y] & 15) << 4))
    return bytes(out)


if os.path.exists(JP_ROM):
    rom = open(JP_ROM, 'rb').read()
    hp4 = to4bpp(Image.open(os.path.join(EM, 'graphics/battle_interface/hpbar.png')))
    ex4 = to4bpp(Image.open(os.path.join(EM, 'graphics/battle_interface/expbar.png')))
    base = rom.find(hp4) + len(hp4) + len(ex4)
    tiles = rom[base:base + 15 * 32]
    STATUS_COL = [(197, 98, 197), (190, 190, 24), (164, 164, 139), (139, 180, 230), (230, 115, 82)]
    idx = {}
    for t in range(15):
        for y in range(8):
            for x in range(8):
                b = tiles[t * 32 + y * 4 + x // 2]
                idx[((t % 3) * 8 + x, (t // 3) * 8 + y)] = (b >> 4) if x & 1 else b & 15
    stimg = Image.new('RGBA', (24, 40), (0, 0, 0, 0))
    sp = stimg.load()
    for (x, y), v in idx.items():
        col = {12: STATUS_COL[y // 8], 2: (255, 255, 222), 3: (222, 214, 181)}.get(v)
        if col:
            sp[x, y] = col + (255,)
    # 角の地の色は外側から塗りつぶして透明にする
    for row in range(5):
        stack = [(x, row * 8 + y) for x in (0, 23) for y in range(8)] + [(x, row * 8 + y) for x in range(24) for y in (0, 7)]
        seen = set()
        while stack:
            x, y = stack.pop()
            if (x, y) in seen or not (0 <= x < 24 and row * 8 <= y < row * 8 + 8) or idx[(x, y)] not in (2, 3):
                continue
            seen.add((x, y))
            sp[x, y] = (0, 0, 0, 0)
            stack += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    stimg.save(os.path.join(uidir, 'status_jp.png'))

    # 日本版の相手側体力ゲージ（「Lv」が描き込み済み）。LZ77 圧縮、64x32 のスプライト2枚ぶんのマス並び
    def lz77(o):
        size = rom[o + 1] | rom[o + 2] << 8 | rom[o + 3] << 16
        out = bytearray()
        i = o + 4
        while len(out) < size:
            flags = rom[i]
            i += 1
            for b in range(8):
                if len(out) >= size:
                    break
                if flags & (0x80 >> b):
                    v = rom[i] << 8 | rom[i + 1]
                    i += 2
                    for _ in range((v >> 12) + 3):
                        out.append(out[-((v & 0xFFF) + 1)])
                else:
                    out.append(rom[i])
                    i += 1
        return bytes(out)
    jb = lz77(0xC1F4D0)
    uspal = Image.open(os.path.join(EM, 'graphics/battle_interface/healthbox_singles_opponent.png')).getpalette()
    P = [tuple(uspal[k * 3:k * 3 + 3]) for k in range(16)]
    jbox = Image.new('RGBA', (128, 32), (0, 0, 0, 0))
    jp = jbox.load()
    for t in range(len(jb) // 32):
        s_, tt = t // 32, t % 32
        tx, ty = s_ * 8 + tt % 8, tt // 8
        for y in range(8):
            for x in range(8):
                v = jb[t * 32 + y * 4 + x // 2]
                v = (v >> 4) if x & 1 else v & 15
                if v:
                    jp[tx * 8 + x, ty * 8 + y] = P[v] + (255,)
    jbox.save(os.path.join(uidir, 'hb_box_jp.png'))
for name, src in [('enemy_shadow', 'enemy_mon_shadow'), ('hb_box', 'healthbox_singles_opponent'), ('hb_bar', 'hpbar'), ('hb_bar_anim', 'hpbar_anim'), ('hb_frameend', 'misc_frameend')]:
    to_rgba(Image.open(os.path.join(EM, 'graphics/battle_interface', src + '.png'))).save(os.path.join(uidir, name + '.png'))
print('ui ok')

# ---------------------------------------------------------------- マップ属性と背景判定
def load_maps(proj):
    maps = {}
    root = os.path.join(proj, 'data/maps')
    for dn in os.listdir(root):
        p = os.path.join(root, dn, 'map.json')
        if os.path.exists(p):
            j = json.load(open(p, encoding='utf-8'))
            maps[j['id']] = j
    return maps


def tileset_attr_files(proj):
    files = {}
    for sym, path in re.findall(r'gMetatileAttributes_(\w+)\[\]\s*=\s*INCBIN_U\d+\("([^"]+)"\)', rd(os.path.join(proj, 'src/data/tilesets/metatiles.h'))):
        files['gMetatileAttributes_' + sym] = os.path.join(proj, path)
    heads = {}
    for m in re.finditer(r'const struct Tileset (\w+)\s*=\s*\{(.*?)\};', rd(os.path.join(proj, 'src/data/tilesets/headers.h')), re.S):
        a = re.search(r'\.metatileAttributes\s*=\s*(\w+)', m.group(2))
        heads[m.group(1)] = files[a.group(1)]
    return heads


def behaviors_for_layout(proj, layout, heads, wide, nprimary):
    fmt = '<I' if wide else '<H'
    size = 4 if wide else 2
    prim = open(heads[layout['primary_tileset']], 'rb').read()
    sec = open(heads[layout['secondary_tileset']], 'rb').read()
    blocks = open(os.path.join(proj, layout['blockdata_filepath']), 'rb').read()
    res = []
    for i in range(0, len(blocks), 2):
        mt = struct.unpack_from('<H', blocks, i)[0] & 0x3FF
        if mt < nprimary:
            src, off = prim, mt
        else:
            src, off = sec, mt - nprimary
        if off * size + size > len(src):
            continue
        res.append(struct.unpack_from(fmt, src, off * size)[0])
    return res


def env_table_em():
    maps = load_maps(EM)
    layouts = {l['id']: l for l in json.load(open(os.path.join(EM, 'data/layouts/layouts.json'), encoding='utf-8'))['layouts'] if 'id' in l}
    heads = tileset_attr_files(EM)
    mb = {n: i for i, n in enumerate(re.findall(r'^\s*(MB_\w+),', rd(os.path.join(EM, 'include/constants/metatile_behaviors.h')), re.M))}
    surf_enc = set()
    for name, flags in re.findall(r'\[(MB_\w+)\]\s*=\s*([^,\n]+)', rd(os.path.join(EM, 'src/metatile_behavior.c'))):
        if 'TILE_FLAG_SURFABLE' in flags and 'TILE_FLAG_HAS_ENCOUNTERS' in flags:
            surf_enc.add(mb[name])
    deep = {mb['MB_OCEAN_WATER'], mb['MB_INTERIOR_DEEP_WATER'], mb['MB_DEEP_WATER']}
    table = {}
    for mid, j in maps.items():
        lay = layouts.get(j['layout'])
        if not lay:
            continue
        bs = [a & 0xFF for a in behaviors_for_layout(EM, lay, heads, False, 512)]
        mtype = j['map_type']
        cnt = lambda s: sum(1 for b in bs if b in s)
        # 陸
        if mtype == 'MAP_TYPE_UNDERGROUND':
            land = 'building' if cnt({mb['MB_INDOOR_ENCOUNTER']}) > cnt({mb['MB_CAVE']}) else 'cave'
        elif mtype in ('MAP_TYPE_INDOOR', 'MAP_TYPE_SECRET_BASE'):
            land = 'building'
        elif mtype == 'MAP_TYPE_UNDERWATER':
            land = 'underwater'
        else:
            c = {'tall_grass': cnt({mb['MB_TALL_GRASS']}), 'long_grass': cnt({mb['MB_LONG_GRASS']}),
                 'sand': cnt({mb['MB_DEEP_SAND'], mb['MB_SAND']}) if mid == 'MAP_ROUTE111' else 0}
            land = max(c, key=c.get) if max(c.values()) else 'plain'
            if mid == 'MAP_ROUTE113':
                land = 'sand'
        # 水
        if mtype == 'MAP_TYPE_UNDERGROUND':
            water = 'pond_water'
        elif mtype in ('MAP_TYPE_INDOOR', 'MAP_TYPE_SECRET_BASE'):
            water = 'building'
        elif mtype == 'MAP_TYPE_UNDERWATER':
            water = 'underwater'
        elif mtype == 'MAP_TYPE_OCEAN_ROUTE':
            water = 'water'
        else:
            water = 'water' if cnt(deep) >= cnt(surf_enc - deep) else 'pond_water'
        rock = 'cave' if mtype == 'MAP_TYPE_UNDERGROUND' else ('sand' if land == 'sand' else 'plain')
        table[mid] = dict(land=land, water=water, rock=rock, type=mtype, sec=j['region_map_section'])
    return table


def env_table_fr():
    maps = load_maps(FR)
    layouts = {l['id']: l for l in json.load(open(os.path.join(FR, 'data/layouts/layouts.json'), encoding='utf-8'))['layouts'] if 'id' in l}
    heads = tileset_attr_files(FR)
    mb = {m.group(1): int(m.group(2), 16) for m in re.finditer(r'#define (MB_\w+) (0x[0-9A-Fa-f]+)', rd(os.path.join(FR, 'include/constants/metatile_behaviors.h')))}
    surf = set()
    body = re.search(r'sBehaviorSurfable\[[^\]]*\]\s*=\s*\{(.*?)\};', rd(os.path.join(FR, 'src/metatile_behavior.c')), re.S).group(1)
    for name in re.findall(r'\[(MB_\w+)\]\s*=\s*TRUE', body):
        surf.add(mb[name])
    deep = set(range(mb['MB_FAST_WATER'], mb['MB_DEEP_WATER'] + 1)) | {mb['MB_OCEAN_WATER']}
    table = {}
    for mid, j in maps.items():
        lay = layouts.get(j['layout'])
        if not lay:
            continue
        attrs = behaviors_for_layout(FR, lay, heads, True, 640)
        mtype = j['map_type']
        land_b = [a & 0x1FF for a in attrs if (a >> 24) & 7 == 1]
        cntl = lambda s: sum(1 for b in land_b if b in s)
        allb = [a & 0x1FF for a in attrs]
        cnt = lambda s: sum(1 for b in allb if b in s)
        if mtype == 'MAP_TYPE_UNDERGROUND':
            land = 'building' if cntl({mb['MB_INDOOR_ENCOUNTER']}) > len(land_b) / 2 else 'cave'
        elif mtype in ('MAP_TYPE_INDOOR', 'MAP_TYPE_SECRET_BASE'):
            land = 'building'
        else:
            g = cntl({mb['MB_TALL_GRASS'], mb['MB_CYCLING_ROAD_PULL_DOWN_GRASS']})
            s = cntl({mb['MB_SAND'], mb['MB_SHALLOW_WATER']})
            land = 'sand' if s > g else 'grass'
        if mtype == 'MAP_TYPE_UNDERGROUND':
            water = 'pond'
        elif mtype in ('MAP_TYPE_INDOOR', 'MAP_TYPE_SECRET_BASE'):
            water = 'building'
        elif mtype == 'MAP_TYPE_OCEAN_ROUTE':
            water = 'water'
        else:
            water = 'water' if cnt(deep) >= cnt(surf - deep) else 'pond'
        rock = 'cave' if mtype == 'MAP_TYPE_UNDERGROUND' else 'mountain'
        table[mid] = dict(land=land, water=water, rock=rock, type=mtype, sec=j['region_map_section'])
    return table


ENV_EM = env_table_em()
ENV_FR = env_table_fr()
print('env ok', len(ENV_EM), len(ENV_FR))

# ---------------------------------------------------------------- 地名
LOC_JP = json.load(open(os.path.join(SRC, 'locations_jp.json'), encoding='utf-8'))


def zen(n):
    return str(n).translate(str.maketrans('0123456789', '０１２３４５６７８９'))


def mapsec_jp(sec):
    s = sec[len('MAPSEC_'):]
    m = re.match(r'ROUTE_(\d+)$', s)
    if m:
        n = int(m.group(1))
        water = {19, 20, 21, 105, 106, 107, 108, 109, 122} | set(range(124, 135))
        return zen(n) + ('ばんすいどう' if n in water else 'ばんどうろ')
    m = re.match(r'UNDERWATER_(\d+)$', s)
    if m:
        return zen(int(m.group(1))) + 'ばんすいどう（すいちゅう）'
    return LOC_JP['mapsec'][s]


def floor_jp(mapid, sec):
    name = mapid[len('MAP_'):]
    for k in sorted(LOC_JP['suffix'], key=len, reverse=True):
        if name.endswith(k):
            return LOC_JP['suffix'][k]
    m = re.search(r'_(B?\d+F)(?:_(\d+)R)?$', name)
    if m:
        return m.group(1) + ('（' + m.group(2) + '）' if m.group(2) else '')
    m = re.search(r'ROOM(\d+)$', name)
    if m:
        return 'へや' + m.group(1)
    return ''


# ---------------------------------------------------------------- 野生出現
METHOD_JP = {'land': 'くさむら', 'cave': 'どうくつ', 'building': 'たてもの', 'surf': 'なみのり', 'dive': 'すいちゅう',
             'rock': 'いわくだき', 'old': 'ボロのつりざお', 'good': 'いいつりざお', 'super': 'すごいつりざお'}


def wild_for(proj, suffix, envtab, gen):
    d = json.load(open(os.path.join(proj, 'src/data/wild_encounters.json'), encoding='utf-8'))
    g = [g for g in d['wild_encounter_groups'] if g.get('for_maps')][0]
    fields = {f['type']: f for f in g['fields']}
    own_maps = load_maps(proj)
    locs = []
    for e in g['encounters']:
        if suffix and not e['base_label'].endswith(suffix):
            continue
        mid = e['map']
        env = envtab.get(mid)
        if env is None:
            # ルビー・サファイアにしかないマップは自前の map.json から種別だけ取る
            j = own_maps[mid]
            env = dict(land='cave', water='pond_water', rock='cave', type=j['map_type'], sec=j['region_map_section'])
        sec = env['sec']
        # へんげのどうくつの2番目以降は配信で切り替わる表なので通常プレイでは出ない
        if 'ALTERING_CAVE' in mid and not re.search(r'AlteringCave1?(_FireRed|_LeafGreen)?$', e['base_label']):
            continue
        safari = 'SAFARI_ZONE' in sec
        underwater = env['type'] == 'MAP_TYPE_UNDERWATER'
        for ftype, key in [('land_mons', None), ('water_mons', None), ('rock_smash_mons', 'rock'), ('fishing_mons', None)]:
            if ftype not in e:
                continue
            mons = e[ftype]['mons']
            rates = fields[ftype]['encounter_rates']
            groups = {None: list(range(len(mons)))}
            if ftype == 'fishing_mons':
                groups = fields[ftype]['groups']
            for gname, idxs in groups.items():
                if ftype == 'land_mons':
                    method = {'cave': 'cave', 'building': 'building'}.get(env['land'], 'land')
                    bg = env['land']
                elif ftype == 'water_mons':
                    method = 'dive' if underwater else 'surf'
                    bg = env['water']
                elif ftype == 'rock_smash_mons':
                    method = 'rock'
                    bg = env['rock']
                else:
                    method = {'old_rod': 'old', 'good_rod': 'good', 'super_rod': 'super'}[gname]
                    bg = env['water']
                tot = sum(rates[i] for i in idxs)
                agg = {}
                for i in idxs:
                    mo = mons[i]
                    dex = dex_of[mo['species'][len('SPECIES_'):]]
                    a = agg.setdefault(dex, [dex, mo['min_level'], mo['max_level'], 0])
                    a[1] = min(a[1], mo['min_level'])
                    a[2] = max(a[2], mo['max_level'])
                    a[3] += rates[i]
                lst = sorted(agg.values(), key=lambda a: -a[3])
                for a in lst:
                    a[3] = round(a[3] * 100 / tot, 1)
                area = mapsec_jp(sec)
                if mid == 'MAP_ROUTE130' and method == 'land':
                    area, bg = area + '（マボロシじま）', 'tall_grass'
                if mid == 'MAP_SSANNE_EXTERIOR':
                    bg = 'water'
                locs.append(dict(sec=sec, area=area, floor=floor_jp(mid, sec), method=method, bg=bg,
                                 safari=safari, underwater=underwater, mons=lst))
    # 同じ地名で出現内容が同じものはまとめる
    merged = []
    for l in locs:
        for m in merged:
            if m['sec'] == l['sec'] and m['method'] == l['method'] and m['mons'] == l['mons'] and m['bg'] == l['bg']:
                if l['floor'] and l['floor'] not in m['floors']:
                    m['floors'].append(l['floor'])
                break
        else:
            l['floors'] = [l['floor']] if l['floor'] else []
            merged.append(l)
    out = []
    for m in merged:
        fl = m['floors']
        name = m['area'] + (' ' + '・'.join(fl) if 0 < len(fl) <= 3 else '')
        out.append(dict(name=name, method=m['method'], bg=m['bg'], safari=m['safari'], underwater=m['underwater'], mons=m['mons']))
    return out


GAMES = {}
for key, proj, suf, envtab, gen in [
    ('R', RS, '_Ruby', ENV_EM, 'em'), ('S', RS, '_Sapphire', ENV_EM, 'em'), ('E', EM, None, ENV_EM, 'em'),
    ('FR', FR, '_FireRed', ENV_FR, 'fr'), ('LG', FR, '_LeafGreen', ENV_FR, 'fr')]:
    GAMES[key] = dict(bgset=gen, locs=wild_for(proj, suf, envtab, gen))
    print(key, len(GAMES[key]['locs']))

STATICS = json.load(open(os.path.join(SRC, 'statics.json'), encoding='utf-8'))
for key, lst in STATICS.items():
    for s in lst:
        s['dex'] = dex_of[s.pop('species')]
    GAMES[key]['statics'] = lst

ORRE = json.load(open(os.path.join(SRC, 'orre.json'), encoding='utf-8'))
for g in ('CO', 'XD'):
    for s in ORRE[g]['shadow']:
        s['dex'] = int(s['dex'])
    for s in ORRE[g].get('spots', []):
        for m in s['mons']:
            m[0] = int(m[0])
    GAMES[g] = ORRE[g]

# アニメの動きに使うサイン表（trig.c の gSineTable、Q8.8 で 320 個）
SINE = [round(float(v) * 256) for v in re.findall(r'Q_8_8\((-?[0-9.]+)\)', re.search(r'gSineTable\[\] =\s*\{(.*?)\};', rd(os.path.join(EM, 'src/trig.c')), re.S).group(1))]
data = dict(species=species, palettes=palettes, iconPalettes=icon_palettes, fontCodes=FONT_CODES, frFontWidths=FR_WIDTHS, sine=SINE, games=GAMES)
json.dump(data, open(os.path.join(OUT, 'data.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('data.json', os.path.getsize(os.path.join(OUT, 'data.json')))
