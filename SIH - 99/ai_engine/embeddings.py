import numpy as np
from sklearn.feature_extraction.text import HashingVectorizer


class MaterialEmbeddingModel:

    def __init__(self):
        print("Initializing lightweight embedding model...")

        self.vectorizer = HashingVectorizer(
            n_features=384,
            analyzer="char_wb",
            ngram_range=(3, 5),
            norm="l2",
            alternate_sign=False
        )

        print("Lightweight embedding model ready.")

    def encode(self, text: str):

        if not text:
            text = ""

        embedding = self.vectorizer.transform(
            [str(text)]
        ).toarray()[0]

        return np.asarray(
            embedding,
            dtype="float32"
        )
