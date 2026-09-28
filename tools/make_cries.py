# エメラルドの鳴き声（sound/direct_sound_samples/cries/*.wav）を図鑑番号の名前で cries/NNN.wav に置く
import os
import re
import shutil

EM = r'C:\Users\mutk0\Desktop\ポケモン\逆アセ\pokeemerald'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'cries')
os.makedirs(OUT, exist_ok=True)

src = open(os.path.join(EM, 'include/constants/pokedex.h'), encoding='utf-8').read()
names = re.findall(r'^\s*NATIONAL_DEX_(\w+),', src, re.M)
total = 0
for dex, name in enumerate(names):
    if not 1 <= dex <= 386:
        continue
    path = os.path.join(EM, 'sound/direct_sound_samples/cries', name.lower() + '.wav')
    dst = os.path.join(OUT, '%03d.wav' % dex)
    shutil.copyfile(path, dst)
    total += os.path.getsize(dst)
print('cries', total // 1024, 'KB')
