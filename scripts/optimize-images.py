"""Create WebP derivatives; retain the source images and record byte savings."""
import hashlib
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent
images = root / 'assets/images'
settings = {
    'hero-maneko-original.jpg': 90,
    'hero-maneko-1000.jpg': 90,
    'hero-maneko-600.jpg': 90,
    'products-background.jpg': 82,
    'about-maneko.jpg': 85,
    'news-3.png': 85,
    'news-4.png': 85,
}
records = []
for name, quality in settings.items():
    source = images / name
    target = source.with_suffix('.webp')
    with Image.open(source) as image:
        image.save(target, 'WEBP', quality=quality, method=6)
        size = list(image.size)
    records.append({
        'source': source.name, 'file': target.name, 'dimensions': size,
        'quality': quality, 'sourceBytes': source.stat().st_size,
        'bytes': target.stat().st_size,
        'sha256': hashlib.sha256(target.read_bytes()).hexdigest(),
    })
(images / 'OPTIMIZED.json').write_text(json.dumps(records, indent=2) + '\n', encoding='utf-8')
before = sum(item['sourceBytes'] for item in records)
after = sum(item['bytes'] for item in records)
print(json.dumps({'files': len(records), 'sourceBytes': before, 'webpBytes': after, 'savedPercent': round((1-after/before)*100, 1)}))
