# pret の MIDI と音色定義から、捕獲まわりの効果音を GBA と同じ 13379Hz・8bit で書き出す
import math, os, re, struct, wave
import mido

SND = r'C:\Users\mutk0\Desktop\ポケモン\逆アセ\pokeemerald\sound'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'build', 'sfx')
os.makedirs(OUT, exist_ok=True)
RATE = 13379
FRAME = 1 / 59.7275

SOUNDS = {
    'throw': 'se_ball_throw', 'trade': 'se_ball_trade', 'bounce1': 'se_ball_bounce_1', 'bounce2': 'se_ball_bounce_2',
    'bounce3': 'se_ball_bounce_3', 'bounce4': 'se_ball_bounce_4', 'shake': 'se_ball', 'click': 'se_rg_ball_click', 'open': 'se_ball_open',
    'caught': 'mus_rg_caught_intro', 'caught_rs': 'mus_evolved',
}


def rd(p):
    return open(p, encoding='utf-8').read()


# ---------------------------------------------------------------- 音色
SAMPLE_FILE = {}
for label, path in re.findall(r'(DirectSoundWaveData_\w+)::\s*\.incbin "([^"]+)"', rd(os.path.join(SND, 'direct_sound_data.inc'))):
    SAMPLE_FILE[label] = os.path.join(SND, '..', path.replace('.bin', '.wav'))
WAVE_FILE = {}
for label, path in re.findall(r'(ProgrammableWaveData_\w+)::\s*\.incbin "([^"]+)"', rd(os.path.join(SND, 'programmable_wave_data.inc'))):
    WAVE_FILE[label] = os.path.join(SND, '..', path)

KEYSPLIT = {}
cur = None
for line in rd(os.path.join(SND, 'keysplit_tables.inc')).split('\n'):
    m = re.match(r'\s*keysplit (\w+), (\d+)', line)
    if m:
        cur = KEYSPLIT[m.group(1)] = {'start': int(m.group(2)), 'splits': []}
        continue
    m = re.match(r'\s*split (\d+), (\d+)', line)
    if m and cur:
        cur['splits'].append((int(m.group(1)), int(m.group(2))))

GROUP_FILES = {}
for root, _, files in os.walk(os.path.join(SND, 'voicegroups')):
    for f in files:
        txt = rd(os.path.join(root, f))
        m = re.match(r'\s*voice_group (\w+)(?:, (\d+))?', txt)
        if m:
            GROUP_FILES[m.group(1)] = (os.path.join(root, f), int(m.group(2) or 0))


def load_group(name):
    path, offset = GROUP_FILES[name]
    voices = []
    for line in rd(path).split('\n')[1:]:
        line = line.split('@')[0].strip()
        if line.startswith('voice_'):
            kind, _, rest = line.partition(' ')
            voices.append((kind, [a.strip() for a in rest.split(',')]))
    return voices, offset


def sample(label):
    d = open(SAMPLE_FILE[label], 'rb').read()
    i, loop, end, pitch, data = 12, None, None, None, None
    width = 1
    while i + 8 <= len(d):
        cid = d[i:i + 4]
        sz = struct.unpack_from('<I', d, i + 4)[0]
        body = d[i + 8:i + 8 + sz]
        if cid == b'fmt ':
            width = struct.unpack_from('<H', body, 14)[0] // 8
        elif cid == b'smpl' and struct.unpack_from('<I', body, 28)[0] > 0:
            loop = struct.unpack_from('<I', body, 44)[0]
        elif cid == b'agbp':
            pitch = struct.unpack_from('<I', body, 0)[0] / 1024
        elif cid == b'agbl':
            end = struct.unpack_from('<I', body, 0)[0]
        elif cid == b'data':
            data = [(v - 128) / 128 for v in body] if width == 1 else [struct.unpack_from('<h', body, k)[0] / 32768 for k in range(0, len(body) - 1, 2)]
        i += 8 + sz + (sz & 1)
    return dict(data=data, loop=loop, end=end or len(data), rate=pitch)


def prog_wave(label):
    b = open(WAVE_FILE[label], 'rb').read()[:16]
    out = []
    for byte in b:
        out += [(byte >> 4) / 7.5 - 1, (byte & 15) / 7.5 - 1]
    return out


def resolve(group, program, note):
    """program と音程から実際に鳴らす音色を決める。返り値は (種類, 引数, 鳴らす音程, 固定ピッチか)"""
    voices, _ = load_group(group)
    kind, args = voices[program]
    if kind == 'voice_keysplit':
        sub, table = args[0].replace('voicegroup_', ''), args[1].replace('keysplit_', '')
        ks = KEYSPLIT[table]
        idx = ks['splits'][-1][0]
        for vi, hi in ks['splits']:
            if note <= hi:
                idx = vi
                break
        sv, _ = load_group(sub)
        return sv[idx][0], sv[idx][1], note, False
    if kind == 'voice_keysplit_all':
        sub = args[0].replace('voicegroup_', '')
        sv, off = load_group(sub)
        k2, a2 = sv[note - off]
        return k2, a2, int(a2[0]), True
    return kind, args, note, False


# ---------------------------------------------------------------- 1音ずつ鳴らす
DUTY = [0.125, 0.25, 0.5, 0.75]
NOISE = [0xD7, 0xD6, 0xD5, 0xD4, 0xC7, 0xC6, 0xC5, 0xC4, 0xB7, 0xB6, 0xB5, 0xB4, 0xA7, 0xA6, 0xA5, 0xA4, 0x97, 0x96, 0x95, 0x94,
         0x87, 0x86, 0x85, 0x84, 0x77, 0x76, 0x75, 0x74, 0x67, 0x66, 0x65, 0x64, 0x57, 0x56, 0x55, 0x54, 0x47, 0x46, 0x45, 0x44,
         0x37, 0x36, 0x35, 0x34, 0x27, 0x26, 0x25, 0x24, 0x17, 0x16, 0x15, 0x14, 0x07, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01, 0x00]


def note_freq(n):
    return 440 * 2 ** ((n - 69) / 12)


def render_note(kind, args, key, fixed, t_on, t_off, ctrl, total, echo=(0, 0)):
    """ctrl(t) -> (音量0..1, ベンド半音) を返す関数。戻りは (開始サンプル, 波形リスト)"""
    start = int(t_on * RATE)
    out = []
    ds = kind.startswith('voice_directsound')
    if ds:
        s = sample(args[2])
        a, d, sus, r = (int(x) for x in args[3:7])
        pos = 0.0
    else:
        env_args = [int(x) for x in args[-4:]]
        a, d, sus, r = env_args
        phase = 0.0
        if 'square_1' in kind:
            duty = DUTY[int(args[3]) & 3]
            sweep = int(args[2])
        elif 'square_2' in kind:
            duty = DUTY[int(args[2]) & 3]
            sweep = 0
        elif 'programmable_wave' in kind:
            wav = prog_wave(args[2])
        elif 'noise' in kind:
            lfsr, short, nacc = 0x7FFF, int(args[2]) & 1, 0.0
    # 包絡線：attack → decay → sustain、離したら release（m4a と同じくフレーム単位で更新）
    top = 255.0
    stage = 'attack'
    env = top if (ds and a == 255) else 0.0
    if ds and env == top:
        stage = 'decay'
    if not ds:
        # CGB は音量から決まる最大値(0〜15)まで上がり、1/64秒 × 設定値ごとに1段ずつ動く（m4a の CgbSound）
        goal = min(15, int(ctrl(t_on)[0] * 16))
        sus_goal = (goal * sus + 15) >> 4
        counter = a
        if a:
            env = 0
        else:
            env, stage, counter = goal, 'decay', d
            if d == 0:
                stage = 'sustain' if sus else 'off'
                env, counter = sus_goal, 7
        cgb_t = t_on
    released = False
    frame_t = t_on
    sweep_f = None
    echo_v, echo_l = echo
    echo_n = 0
    t = t_on

    def to_echo():
        # 擬似エコー：音が消える代わりに小さな音量で echo_l コマ鳴り続ける（m4a の IEC）
        nonlocal env, stage, echo_n
        lvl = echo_v if ds else (goal * echo_v + 255) >> 8
        if lvl and echo_l:
            env, stage, echo_n = lvl, 'echo', echo_l
        else:
            stage = 'off'
    while t < total:
        if not released and t >= t_off:
            released = True
            if stage not in ('echo', 'off'):
                stage = 'release'
                if not ds:
                    counter = r
                    if r == 0:
                        to_echo()
        if not ds and stage not in ('echo', 'off'):
            while t >= cgb_t:
                cgb_t += 1 / 64
                if counter <= 0:
                    if stage == 'attack':
                        env += 1
                        if env >= goal:
                            env, stage, counter = goal, 'decay', d
                            if d == 0:
                                if sus:
                                    stage, env, counter = 'sustain', sus_goal, 7
                                else:
                                    to_echo()
                        else:
                            counter = a
                    elif stage == 'decay':
                        env -= 1
                        if env <= sus_goal:
                            if sus:
                                stage, env, counter = 'sustain', sus_goal, 7
                            else:
                                to_echo()
                        else:
                            counter = d
                    elif stage == 'sustain':
                        env, counter = sus_goal, 7
                    elif stage == 'release':
                        env -= 1
                        counter = r
                        if env <= 0:
                            to_echo()
                    if stage in ('echo', 'off'):
                        break
                counter -= 1
        if t >= frame_t:
            frame_t += FRAME
            if stage == 'echo':
                echo_n -= 1
                if echo_n <= 0:
                    stage = 'off'
            elif ds:
                if stage == 'attack':
                    env = min(255, env + a)
                    if env >= 255:
                        stage = 'decay'
                elif stage == 'decay':
                    env = int(env) * d >> 8
                    if env <= sus:
                        env = sus
                        if sus:
                            stage = 'sustain'
                        else:
                            to_echo()
                elif stage == 'release':
                    env = int(env) * r >> 8
                    if env <= echo_v:
                        to_echo()
        if stage == 'off':
            break
        vol, bend = ctrl(t)
        n = (60 if (ds and kind.endswith('no_resample')) else key) + (0 if fixed and ds else bend)
        if ds:
            if kind.endswith('no_resample'):
                step_s = s['rate'] / RATE
            else:
                step_s = s['rate'] * 2 ** ((n - 60) / 12) / RATE
            ip = int(pos)
            if ip >= s['end']:
                if s['loop'] is None:
                    break
                pos = s['loop'] + (pos - s['end'])
                ip = int(pos)
            v = s['data'][min(ip, len(s['data']) - 1)] * (env / 255) * vol
            pos += step_s
        else:
            f = note_freq(n)
            if 'square_1' in kind and sweep & 0x70:
                if sweep_f is None:
                    sweep_f, sweep_t = f, t
                per = ((sweep >> 4) & 7) / 128
                while t - sweep_t >= per:
                    sweep_t += per
                    x = 2048 - 131072 / sweep_f
                    dx = int(x) >> (sweep & 7)
                    x = x - dx if sweep & 8 else x + dx
                    if x >= 2047 or x <= 0:
                        break
                    sweep_f = 131072 / (2048 - x)
                f = sweep_f
            if 'square' in kind:
                phase = (phase + f / RATE) % 1
                v = 1 if phase < duty else -1
            elif 'programmable_wave' in kind:
                phase = (phase + f / RATE) % 1
                v = wav[int(phase * 32)]
            else:
                # ノイズの細かさは m4a の gNoiseTable（NR43：分周と段数）で決まる
                kk = int(round(n))
                nr = NOISE[0 if kk <= 20 else min(59, kk - 21)]
                nacc += 524288 / (0.5 if nr & 7 == 0 else nr & 7) / 2 ** ((nr >> 4) + 1) / RATE
                while nacc >= 1:
                    nacc -= 1
                    bit = (lfsr ^ (lfsr >> 1)) & 1
                    lfsr = (lfsr >> 1) | (bit << 14)
                    if short:
                        lfsr = (lfsr & ~0x40) | (bit << 6)
                v = 1 if lfsr & 1 else -1
            v *= 0.55 * (env / 15)
        out.append(v)
        t += 1 / RATE
    return start, out


def render(name):
    cfg = re.search(r'^' + name + r'\.mid:\s*(.*)$', rd(os.path.join(SND, 'songs/midi/midi.cfg')), re.M).group(1)
    group = re.search(r'-G_?(\w+)', cfg).group(1)
    master = int((re.search(r'-V(\d+)', cfg) or [None, '127'])[1]) / 127
    mid = mido.MidiFile(os.path.join(SND, 'songs/midi', name + '.mid'))
    tempos = [(0, 500000)]
    for tr in mid.tracks:
        tick = 0
        for msg in tr:
            tick += msg.time
            if msg.type == 'set_tempo':
                tempos.append((tick, msg.tempo))
    tempos.sort(key=lambda x: x[0])  # 同じ位置なら後から来た指定が勝つ（既定の 120 を先頭に置いたまま）

    def secs(tick):
        t, last_tick, last_tempo = 0.0, 0, 500000
        for tk, tp in tempos:
            if tk > tick:
                break
            t += (tk - last_tick) * last_tempo / 1e6 / mid.ticks_per_beat
            last_tick, last_tempo = tk, tp
        return t + (tick - last_tick) * last_tempo / 1e6 / mid.ticks_per_beat
    notes = []
    for tr in mid.tracks:
        tick, prog, vol, rng, bend = 0, 0, 100, 2, 0
        timeline = [(0, 100 / 127, 0)]
        open_notes = {}
        xcmd, echo = None, (0, 0)  # 拡張命令（cc30 で種類、cc29 で値）：8=エコー音量、9=エコーの長さ
        for msg in tr:
            tick += msg.time
            t = secs(tick)
            if msg.type == 'program_change':
                prog = msg.program
            elif msg.type == 'control_change' and msg.control == 7:
                vol = msg.value
            elif msg.type == 'control_change' and msg.control == 20:
                rng = msg.value
            elif msg.type == 'control_change' and msg.control == 30:
                xcmd = msg.value
            elif msg.type == 'control_change' and msg.control == 29:
                if xcmd == 8:
                    echo = (msg.value, echo[1])
                elif xcmd == 9:
                    echo = (echo[0], msg.value)
            elif msg.type == 'pitchwheel':
                bend = msg.pitch / 8192 * rng
            elif msg.type == 'note_on' and msg.velocity:
                open_notes[msg.note] = (t, msg.velocity, prog, echo)
            elif msg.type in ('note_off', 'note_on'):
                if msg.note in open_notes:
                    t0, vel, p, ec = open_notes.pop(msg.note)
                    notes.append((t0, t, msg.note, vel, p, timeline, ec))
            if msg.type in ('control_change', 'pitchwheel'):
                timeline = timeline + [(t, vol / 127, bend)]
    end = max(n[1] for n in notes) + 1.2
    mix = [0.0] * int(end * RATE)
    for t0, t1, note, vel, prog, tl, ec in notes:
        kind, args, key, fixed = resolve(group, prog, note)

        def ctrl(t, tl=tl, vel=vel):
            v, b = tl[0][1], tl[0][2]
            for tt, vv, bb in tl:
                if tt <= t:
                    v, b = vv, bb
            return v * vel / 127 * master, b
        start, wavd = render_note(kind, args, key, fixed, t0, t1, ctrl, end, ec)
        for i, v in enumerate(wavd):
            if start + i < len(mix):
                mix[start + i] += v
    while mix and abs(mix[-1]) < 1e-4:
        mix.pop()
    peak = max(1e-6, max(abs(v) for v in mix))
    g = min(1.0, 0.9 / peak) if peak > 0.9 else 1.0
    return [v * g for v in mix]


for key, name in SOUNDS.items():
    data = render(name)
    with wave.open(os.path.join(OUT, key + '.wav'), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(1)
        w.setframerate(RATE)
        w.writeframes(bytes(max(0, min(255, int(128 + v * 127))) for v in data))
    print(key, name, round(len(data) / RATE, 2), 's')
