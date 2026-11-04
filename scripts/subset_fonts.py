#!/usr/bin/env python3
"""Download the game's fonts and subset them to the characters Hangul Town needs.

Run from the repo root:  python3 scripts/subset_fonts.py
Needs:  pip install fonttools brotli

Output:
  src/assets/fonts/*.woff2      subset web fonts (committed; loaded by src/fonts.css)
  public/licenses/fonts/*.txt   each font's OFL license (shipped with the game)

Source files are cached in .font-cache/ (git-ignored).

Character set (same for every font):
  - Latin: Basic Latin, Latin-1, common punctuation (curly quotes, dashes, ellipsis)
  - CJK punctuation used in Korean text (U+3000-303F)
  - Hangul compatibility jamo (single letters, U+3131-318E) and conjoining jamo
  - All 11,172 Hangul syllables (U+AC00-D7A3). The block builder lets players
    combine any letters, so a smaller common-syllable set would leave some blocks
    falling back to a system font.
Dropped: hanja, kana and other scripts, which make up much of a Korean font's size.
"""
import io
import pathlib
import tarfile
import urllib.request

from fontTools import subset

ROOT = pathlib.Path(__file__).resolve().parent.parent
CACHE = ROOT / ".font-cache"
OUT = ROOT / "src" / "assets" / "fonts"
LICENSES = ROOT / "public" / "licenses" / "fonts"

GF = "https://raw.githubusercontent.com/google/fonts/main/ofl"
PRETENDARD_TGZ = "https://registry.npmjs.org/pretendard/-/pretendard-1.3.9.tgz"

# output name -> (source, license file name)
FONTS = {
    "gowun-dodum-400.woff2": (f"{GF}/gowundodum/GowunDodum-Regular.ttf", "gowun-dodum"),
    "gowun-batang-400.woff2": (f"{GF}/gowunbatang/GowunBatang-Regular.ttf", "gowun-batang"),
    "gowun-batang-700.woff2": (f"{GF}/gowunbatang/GowunBatang-Bold.ttf", "gowun-batang"),
    "nunito-variable.woff2": (f"{GF}/nunito/Nunito%5Bwght%5D.ttf", "nunito"),
    "nunito-italic-variable.woff2": (f"{GF}/nunito/Nunito-Italic%5Bwght%5D.ttf", "nunito"),
    "lora-variable.woff2": (f"{GF}/lora/Lora%5Bwght%5D.ttf", "lora"),
    "lora-italic-variable.woff2": (f"{GF}/lora/Lora-Italic%5Bwght%5D.ttf", "lora"),
    "pretendard-variable.woff2": ("pretendard:package/dist/public/variable/PretendardVariable.ttf", "pretendard"),
}
LICENSE_SOURCES = {
    "gowun-dodum": f"{GF}/gowundodum/OFL.txt",
    "gowun-batang": f"{GF}/gowunbatang/OFL.txt",
    "nunito": f"{GF}/nunito/OFL.txt",
    "lora": f"{GF}/lora/OFL.txt",
    "pretendard": "pretendard:package/dist/LICENSE.txt",
}

UNICODES = (
    "U+0020-007E,U+00A0-00FF,U+2010-2027,U+2030-203A,U+20A9,U+2122,"
    "U+3000-303F,U+1100-11FF,U+3131-318E,U+AC00-D7A3"
)


def fetch(url: str) -> bytes:
    CACHE.mkdir(exist_ok=True)
    if url.startswith("pretendard:"):
        tgz = fetch(PRETENDARD_TGZ)
        with tarfile.open(fileobj=io.BytesIO(tgz)) as tar:
            return tar.extractfile(url.split(":", 1)[1]).read()
    cached = CACHE / url.replace("/", "_").replace(":", "")
    if not cached.exists():
        print(f"  downloading {url}")
        with urllib.request.urlopen(url) as r:
            cached.write_bytes(r.read())
    return cached.read_bytes()


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    LICENSES.mkdir(parents=True, exist_ok=True)
    for name, (src, _) in FONTS.items():
        source = CACHE / f"src-{name}.ttf"
        source.write_bytes(fetch(src))
        subset.main([
            str(source),
            f"--unicodes={UNICODES}",
            "--layout-features=*",  # keep kerning and Hangul jamo shaping
            "--flavor=woff2",
            f"--output-file={OUT / name}",
        ])
        kb = (OUT / name).stat().st_size / 1024
        print(f"{name}: {source.stat().st_size / 1024:.0f} KB -> {kb:.0f} KB")
    for name, src in LICENSE_SOURCES.items():
        (LICENSES / f"{name}-OFL.txt").write_bytes(fetch(src))


if __name__ == "__main__":
    main()
