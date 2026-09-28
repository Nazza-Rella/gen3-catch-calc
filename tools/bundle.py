# web/ のテンプレートに build/ の素材を埋め込み、単一ファイルの HTML を作る
import base64, glob, json, os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
BUILD = os.path.join(ROOT, 'build')
WEB = os.path.join(ROOT, 'web')


def uri(path):
    return 'data:image/png;base64,' + base64.b64encode(open(path, 'rb').read()).decode()


assets = {'sprites': uri(os.path.join(BUILD, 'sprites.png')), 'icons': uri(os.path.join(BUILD, 'icons.png'))}
for p in glob.glob(os.path.join(BUILD, 'bg', '*.png')):
    assets['bg_' + os.path.splitext(os.path.basename(p))[0]] = uri(p)
for p in glob.glob(os.path.join(BUILD, 'balls', '*.png')):
    assets['ball_' + os.path.splitext(os.path.basename(p))[0]] = uri(p)
for p in glob.glob(os.path.join(BUILD, 'sfx', '*.wav')):
    assets['sfx_' + os.path.splitext(os.path.basename(p))[0]] = 'data:audio/wav;base64,' + base64.b64encode(open(p, 'rb').read()).decode()
for p in glob.glob(os.path.join(BUILD, 'ui', '*.png')):
    assets[os.path.splitext(os.path.basename(p))[0]] = uri(p)

# リンクを貼ったときとタブのアイコン（モンスターボールのアイテム画像をドットのまま拡大）
ball = Image.open(os.path.join(BUILD, 'balls', 'poke.png'))
icon = Image.new('RGBA', (256, 256), (70, 163, 82, 255))
big = ball.resize((24 * 9, 24 * 9), Image.NEAREST)
icon.paste(big, ((256 - big.width) // 2, (256 - big.height) // 2), big)
icon.save(os.path.join(ROOT, 'icon.png'))
icon.resize((32, 32), Image.NEAREST).save(os.path.join(ROOT, 'favicon.png'))

data = open(os.path.join(BUILD, 'data.json'), encoding='utf-8').read()
html = open(os.path.join(WEB, 'app.html'), encoding='utf-8').read()
css = open(os.path.join(WEB, 'style.css'), encoding='utf-8').read()
js = open(os.path.join(WEB, 'app.js'), encoding='utf-8').read()
inject = 'window.DATA=' + data + ';\nwindow.ASSETS=' + json.dumps(assets) + ';\n'
html = html.replace('/*__STYLE__*/', css).replace('/*__DATA__*/', inject).replace('/*__APP__*/', js)

# 公開ページ用（外枠は公開時に付く）
open(os.path.join(BUILD, 'artifact.html'), 'w', encoding='utf-8').write(html)

# GitHub Pages などでそのまま開ける完全版
NL = chr(10)
head = NL.join(['<!doctype html>', '<html lang="ja">', '<head>', '<meta charset="utf-8">',
                '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">', '</head>', '<body>', ''])
out = os.path.join(ROOT, 'index.html')
open(out, 'w', encoding='utf-8').write(head + html + NL + '</body>' + NL + '</html>' + NL)
print(out, os.path.getsize(out))
