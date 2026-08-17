from pathlib import Path

from PIL import Image

SOURCE_ROOT = Path(r"C:\Users\Administrator\.codex\generated_images\019ff96e-f503-7290-b18e-454794e73ee9")
PROJECT_ROOT = Path(r"D:\ceshi\youxi")

FILES = {
    "exec-73207a75-9b8c-44f3-8966-399137e6846e.png": "article-teak-vendor-evaluation.jpg",
    "exec-661b02d1-9fdc-4555-8e24-121ee024a236.png": "article-teak-buying-inspection.jpg",
    "exec-366f9566-9c1d-45d5-bea6-b47adfe84b37.png": "article-teak-authenticity-comparison.jpg",
    "exec-d46690c4-1575-499f-9a56-cfdf02352533.png": "article-teak-origin-botanical.jpg",
    "exec-fcd81114-073a-4846-8d37-13466f44bcd3.png": "article-teak-stability-inspection.jpg",
    "exec-56b16012-278f-429d-bb38-5ae5e878c735.png": "article-teak-value-comparison.jpg",
    "exec-31c71fc1-cc17-4021-89e2-d0c9c41291f6.png": "article-teak-flooring-installation.jpg",
    "exec-809ed011-36b1-4b19-918d-b6e951d54c35.png": "article-teak-flooring-wear-care.jpg",
    "exec-74fed377-a043-4a32-951d-41a6062d1553.png": "article-teak-flooring-space-selection.jpg",
    "exec-f1652a54-a6fc-4773-b8f5-eeb5a1162d8d.png": "article-teak-floor-cabinet-transition.jpg",
    "exec-32bcbc5a-3029-47db-ba0b-2a3ebab57a8a.png": "article-teak-flooring-sun-moisture.jpg",
    "exec-28b2d0e5-0636-4c55-b033-b5f49d848a8d.png": "article-teak-outdoor-seating-selection.jpg",
    "exec-ec11579b-c1b0-4d00-8e9d-4e34ef19ad76.png": "article-teak-patio-dining.jpg",
    "exec-bad803c4-844f-4182-8d24-63bc03f9a772.png": "article-teak-deck-water-exposure.jpg",
    "exec-6879170c-4f8f-434e-a1ec-d0bb365c3964.png": "article-teak-tea-room-materials.jpg",
    "exec-690a56dc-0cb2-471f-afd6-20fb71d15700.png": "article-teak-conversation-space.jpg",
    "exec-d7bd146c-a8a4-40db-956f-827a816d6242.png": "article-teak-family-bedroom.jpg",
    "exec-1f39efa9-2230-48c7-9a32-6697200fc3be.png": "article-teak-living-study.jpg",
    "exec-617229d0-0248-49e2-82be-7be4094a1b23.png": "article-teak-furniture-material-mix.jpg",
    "exec-1febbe93-e1dd-4966-a417-8a370b574769.png": "article-teak-whole-house-woodwork.jpg",
    "exec-ed82d16a-14f0-421f-8519-cc9a4f2b36c4.png": "article-teak-woodwork-material-check.jpg",
    "exec-6919e54c-785a-4149-a6fd-26f364d38c14.png": "article-teak-side-table-scale.jpg",
    "exec-c2a4707a-e7d5-42b1-a543-cf06478640a2.png": "article-teak-small-object-details.jpg",
    "exec-a74fdaa9-90d2-41a5-9d84-d4bbe4063067.png": "article-teak-reclaimed-openings.jpg",
    "exec-a8d34bb3-cba9-4a04-8e97-07ac3c49ac6c.png": "article-teak-drying-process.jpg",
}

destination_root = PROJECT_ROOT / "assets" / "images"
report = []
for source_name, destination_name in FILES.items():
    source = SOURCE_ROOT / source_name
    destination = destination_root / destination_name
    if not source.is_file():
        raise FileNotFoundError(source)
    if destination.exists():
        raise FileExistsError(destination)
    with Image.open(source) as image:
        if image.size != (1536, 1024):
            raise ValueError(f"{source_name}: unexpected dimensions {image.size}")
        converted = image.convert("RGB")
        converted.save(destination, "JPEG", quality=86, optimize=True, progressive=True, subsampling="4:2:0")
    with Image.open(destination) as check:
        if check.size != (1536, 1024) or check.format != "JPEG":
            raise ValueError(f"{destination_name}: failed output validation")
    report.append((destination_name, destination.stat().st_size))

print(f"status=PASS_IMPORTED_V134_IMAGES count={len(report)}")
for name, size in report:
    print(f"{name}\t{size}")
