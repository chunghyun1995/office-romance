# 실사풍 이미지와 교체 가이드

## 현재 포함된 이미지

내장 `image_gen` 도구로 생성한 캐릭터 표정 18종과 배경 18종을 `images/`에 포함했습니다.
모든 캐릭터는 가상의 성인입니다. 기본 캐릭터를 참조해 표정만 수정하여 얼굴과 의상을 유지했습니다.
캐릭터는 투명도를 보존한 WebP, 배경은 가로 WebP로 저장했습니다.
최종 생성 프롬프트와 파일명 전체는 `ASSET_PROMPTS.json`에 있습니다.
기존 엔진은 WebP를 우선 탐색하므로 시나리오 코드 수정 없이 각 장면에 적용됩니다.

아래는 다른 도구로 이미지를 추가하거나 교체할 때 참고할 수 있는 기존 가이드입니다.

게임은 이미지 파일이 없으면 자동으로 임시 실루엣/그라데이션을 보여줍니다.
아래 파일명으로 이미지를 넣고 커밋하면, 코드 수정 없이 바로 교체됩니다.
확장자는 `.webp` → `.jpg` → `.png` 순서로 찾습니다.

## 권장 설정

| 항목 | 캐릭터 스탠딩 | 배경 |
|---|---|---|
| 해상도 | 832 × 1216 (세로) | 1344 × 768 (가로) |
| Steps / CFG | 30 / 4.5 | 30 / 4.5 |
| Sampler | dpmpp_2m_sde, karras | dpmpp_2m_sde, karras |
| 후처리 | 배경 제거(rembg 노드) → 투명 PNG 권장 | 그대로 |

캐릭터는 **배경을 투명하게 뺀 PNG**가 가장 자연스럽습니다. 표정마다 seed를 고정하고 표정 문구만 바꾸면 얼굴이 일관되게 나옵니다.

**공통 네거티브**
```
cartoon, anime, illustration, 3d render, deformed, extra fingers, bad hands, blurry, watermark, text, logo, childlike, young-looking, teen, school uniform, nsfw, cleavage
```

## 캐릭터 (모두 성인)

파일 위치: `images/char/<id>_<표정>.png`
표정: `normal`, `smile`, `shy`, `sad`, `surprise`, `angry` — 최소한 `normal`만 있어도 나머지 표정은 `normal`로 대체됩니다.

### 한서윤 `seoyun` (29세, 라이브 기획 파트장)
```
photo of a 29-year-old Korean woman, mature professional, long straight black hair past shoulders, thin silver-rimmed glasses, white silk blouse and charcoal blazer, standing, upper body to thigh, plain light gray studio background, soft office lighting, 85mm, realistic skin texture, {EXPR}
```

### 윤하린 `harin` (26세, UI 디자이너)
```
photo of a 26-year-old Korean woman, adult office worker, chin-length brown bob haircut, small hoop earrings, oversized cream knit cardigan over a striped shirt, lanyard ID badge, standing, upper body to thigh, plain light gray studio background, natural daylight, 85mm, realistic skin texture, {EXPR}
```

### 정유나 `yuna` (27세, 마케팅팀)
```
photo of a 27-year-old Korean woman, adult office worker, very long dark hair tied in a low ponytail, sage green blouse, beige long skirt, holding a tablet, standing, upper body to thigh, plain light gray studio background, soft warm lighting, 85mm, realistic skin texture, {EXPR}
```

### 표정 문구 `{EXPR}`
| 파일 접미사 | 넣을 문구 |
|---|---|
| `normal` | calm neutral expression, looking at viewer |
| `smile` | warm gentle smile, looking at viewer |
| `shy` | shy smile, slight blush, eyes looking slightly away |
| `sad` | sad tired expression, eyes lowered |
| `surprise` | surprised expression, eyes wide, lips slightly parted |
| `angry` | serious stern expression, slight frown |

## 배경

파일 위치: `images/bg/<id>.jpg` — 프롬프트 앞에 `photo of`, 뒤에 `no people, wide angle, realistic, 35mm` 를 붙이세요.

| id | 장면 | 프롬프트 핵심 |
|---|---|---|
| lobby | 회사 로비 | modern glass office building lobby in Pangyo Korea, morning |
| office | 사무실 | open-plan game company office, rows of dual monitors, daytime |
| office_night | 야근 사무실 | open-plan office at night, most lights off, monitor glow |
| meeting | 회의실 | small glass meeting room, whiteboard, long table |
| cafeteria | 사내 식당 | bright company cafeteria, food counters, lunchtime |
| rooftop | 옥상 정원(밤) | office rooftop garden at night, benches, city skyline lights |
| rooftop_sunset | 옥상 정원(노을) | office rooftop garden at sunset, orange purple sky |
| cafe | 1층 카페 | cozy ground-floor coffee shop, window seats, afternoon |
| cafe_night | 와인 바 | quiet dim wine bar, warm lamps, evening |
| pantry | 탕비실 | office pantry, coffee machine, tea shelf, night |
| street_night | 퇴근길 | Korean city street at night, crosswalk, office buildings |
| street_day | 회사 앞 거리 | Korean business district street, daytime, gukbap restaurant signs |
| izakaya | 이자카야 | Japanese izakaya interior, group table, lanterns |
| karaoke | 노래방 | Korean karaoke room, neon lights, screen, sofa |
| home | 내 방 | small tidy one-room apartment, morning sunlight |
| gallery | 전시관 | white-walled art gallery in Seongsu, framed illustrations |
| bookcafe | 북카페 | small book cafe in an alley, wooden shelves, warm light |
| hangang | 한강 공원 | Han River park at sunset, picnic mats, bridge |
