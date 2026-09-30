import re


ABBREVIATIONS = {
    "ss": "stainless steel",
    "s.s": "stainless steel",
    "s.s.": "stainless steel",
    "dia": "diameter",
    "od": "outer diameter",
    "id": "inner diameter",
    "lg": "length",
    "len": "length",
}


def normalize_text(text: str) -> str:
    if not text:
        return ""

    text = text.lower().strip()

    # Normalize symbols
    text = text.replace("×", "x")

    # Normalize punctuation
    text = re.sub(r"[,;/()]", " ", text)

    # Normalize multiple spaces
    text = re.sub(r"\s+", " ", text)

    # Expand abbreviations
    words = text.split()

    normalized = []

    for word in words:
        normalized.append(
            ABBREVIATIONS.get(word, word)
        )

    return " ".join(normalized)