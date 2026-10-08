from sentence_transformers import SentenceTransformer


class MaterialEmbeddingModel:

    def __init__(self):
        print("Initializing embedding model...")
        self.model = None

    def _load_model(self):
        if self.model is None: 
            print("Loading embedding model...")
            
            self.model = SentenceTransformer(
                "all-MiniLM-L6-v2",
                device="cpu"
            )

            print("Embedding model loaded.")

    def encode(self, text: str):

        self._load_model()

        embedding = self.model.encode(
            text,
            normalize_embeddings=True
        )

        return embedding
