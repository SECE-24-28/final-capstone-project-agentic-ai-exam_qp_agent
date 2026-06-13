import ollama


def get_embedding(text):

    response = ollama.embed(
        model="hf.co/CompendiumLabs/bge-base-en-v1.5-gguf:latest",
        input=text
    )

    return response["embeddings"][0]
