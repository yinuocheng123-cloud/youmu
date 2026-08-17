import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
AUDIT_PATH = ROOT / "custom" / "v134-article-image-semantic-audit.json"
OUT_PATH = ROOT / "custom" / "v134-image-duplicate-audit.json"


def perceptual_dhash(image_path: Path, hash_size: int = 8) -> str:
    with Image.open(image_path) as source:
        image = source.convert("L").resize((hash_size + 1, hash_size), Image.Resampling.LANCZOS)
    pixels = list(image.getdata())
    value = 0
    for row in range(hash_size):
        offset = row * (hash_size + 1)
        for column in range(hash_size):
            value = (value << 1) | int(pixels[offset + column] > pixels[offset + column + 1])
    return f"{value:0{hash_size * hash_size // 4}x}"


def hamming(left: str, right: str) -> int:
    return (int(left, 16) ^ int(right, 16)).bit_count()


audit = json.loads(AUDIT_PATH.read_text(encoding="utf-8"))
assets = sorted({record["currentMainImage"] for record in audit["records"] if record["currentMainImage"].startswith("assets/")})
raster_assets = [asset for asset in assets if Path(asset).suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}]
hashes = {asset: perceptual_dhash(ROOT / asset) for asset in raster_assets}

parent = {asset: asset for asset in raster_assets}


def find(item: str) -> str:
    while parent[item] != item:
        parent[item] = parent[parent[item]]
        item = parent[item]
    return item


def union(left: str, right: str) -> None:
    left_root, right_root = find(left), find(right)
    if left_root != right_root:
        parent[right_root] = left_root


pairs = []
for index, left in enumerate(raster_assets):
    for right in raster_assets[index + 1 :]:
        distance = hamming(hashes[left], hashes[right])
        if distance <= 6:
            pairs.append({"left": left, "right": right, "hammingDistance": distance})
            union(left, right)

groups = {}
for asset in raster_assets:
    groups.setdefault(find(asset), []).append(asset)
perceptual_groups = [items for items in groups.values() if len(items) > 1]

asset_group = {}
for index, items in enumerate(perceptual_groups, start=1):
    for asset in items:
        asset_group[asset] = f"PHASH_GROUP_{index:02d}"

for record in audit["records"]:
    record["perceptualDuplicateGroup"] = asset_group.get(record["currentMainImage"], "NONE")
AUDIT_PATH.write_text(json.dumps(audit, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

report = {
    "status": "PASS_PERCEPTUAL_DUPLICATE_SCAN",
    "assetCount": len(assets),
    "rasterAssetCount": len(raster_assets),
    "perceptualDuplicateGroupCount": len(perceptual_groups),
    "distanceThreshold": 6,
    "algorithm": "dHash-64",
    "hashes": hashes,
    "similarPairs": pairs,
    "groups": perceptual_groups,
}
OUT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps(report, ensure_ascii=False, indent=2))
