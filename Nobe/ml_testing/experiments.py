import time
import os, requests

# Similarity
from collections import Counter
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
# Levenshtein distance
from pyxdameraulevenshtein import damerau_levenshtein_distance, normalized_damerau_levenshtein_distance


# Google
from google.cloud import vision
import io


def get_jaccard_similarity(str1, str2):
    A = set(str1.split())
    B = set(str2.split())
    C = A.intersection(B)

    return float(len(C)) / (len(A) + len(B) - len(C))

def get_cosine_sim(*strs): 
    vectors = [t for t in get_vectors(*strs)]
    cs = cosine_similarity(vectors)
    return np.dot(cs[0], cs[1])
    
    
def get_vectors(*strs):
    text = [t for t in strs]
    vectorizer = CountVectorizer(text)
    vectorizer.fit(text)
    return vectorizer.transform(text).toarray()


def get_damerau_levenshtein_distance(str1, str2, normalized=False):
    if normalized:
        dis = normalized_damerau_levenshtein_distance(str1, str2)
    else:
        dis = damerau_levenshtein_distance(str1, str2)
    return dis



def azure_detect(img):
    region = "westeurope"
    api_key = "cd63453bcf7348228df4ef8121bbbd43"

    # Read file
    with open(img, 'rb') as f:
        data = f.read()

    # Set request headers
    headers = dict()
    headers['Ocp-Apim-Subscription-Key'] = api_key
    headers['Content-Type'] = 'application/octet-stream'
    
    # Set request querystring parameters
    params = {'handwriting': True}

    # Microsoft azure handwriten recognition first request only
    # provides a second url to which you should query
    # that second url comes in the headers at "Operation-Location"
    response = requests.request('post', 
                            "https://westeurope.api.cognitive.microsoft.com/vision/v1.0/recognizeText", 
                            data=data, 
                            headers=headers, 
                            params=params)

    redirect_url = response.headers["Operation-Location"]
    response = requests.request("get", redirect_url, headers=headers)

    # If request is made right after the first one, result is always that
    # resource is not ready yet
    
    time.sleep(0.5)
    response = requests.request("get", redirect_url, headers=headers)

    while(response.json()["status"] == "Running"):
        time.sleep(0.5)
        response = requests.request("get", redirect_url, headers=headers)
    
    result = response.json()['recognitionResult']

    text = ""
    for line in result['lines']:
        text += line['text']
    
    return text


def google_detect(client, path):
    """Detects document features in an image."""
    with io.open(path, 'rb') as image_file:
        content = image_file.read()

    image = vision.types.Image(content=content)

    response = client.document_text_detection(image=image)

    text = ''

    for page in response.full_text_annotation.pages:
        for block in page.blocks:
            for paragraph in block.paragraphs:
                for word in paragraph.words:
                    word_text = ''.join([ symbol.text for symbol in word.symbols])
                    text += ''.join([
                        symbol.text for symbol in word.symbols
                    ])
                    text += ' '
                text += '\n'

    return text



if __name__ == "__main__":

    base_path = 'experiment/'

    noisy_img = base_path + "noisy_all_letters_numbers.jpg"
    noisy_img_text = noisy_img.split(".")[0] + ".txt"

    imgs = [
            "all_letters_numbers.jpg",
            "license_fuck.png",
            "lot_of_text.jpg",
            "sentence.png",
        ]

    texts = []

    for image in imgs:
        _t = ""
        filename = image.split(".")[0] + ".txt"
        with open(base_path + filename, 'r') as f:
            for line in f.readlines():
               _t += line

        texts.append(_t)

    client = vision.ImageAnnotatorClient()

    google = [] 
    azure = [] 

    for img in imgs:
        filepath = base_path + img
        google.append(google_detect(client, filepath))
        azure.append(azure_detect(filepath))

    jaccard_google = []
    jaccard_azure = []
    
    cosine_google = []
    cosine_azure = []
    
    levens_google = []
    levens_azure = []

    levensN_google = []
    levensN_azure = []

    for i in range(len(texts)):
        _text = texts[i].lower()
        _google = google[i].lower()
        _azure = azure[i].lower()
    
        if i == 0:
            _text = _text.replace(" ", "").replace("\n", "")
            _google = _google.replace(" ", "").replace("\n", "")
            _azure = _azure.replace(" ", "").replace("\n", "")

        # Google
        jaccard_google.append(get_jaccard_similarity(_text, _google))
        cosine_google.append(get_cosine_sim(_text, _google))
        levens_google.append(get_damerau_levenshtein_distance(_text, _google))
        levensN_google.append(get_damerau_levenshtein_distance(_text, _google, True))

        # Azure
        jaccard_azure.append(get_jaccard_similarity(_text, _azure))
        cosine_azure.append(get_cosine_sim(_text, _azure))
        levens_azure.append(get_damerau_levenshtein_distance(_text, _azure))
        levensN_azure.append(get_damerau_levenshtein_distance(_text, _azure, True))

    noisy = google_detect(client, noisy_img)
    noisy_text = noisy.lower().replace(" ", "").replace("\n", "")

    jaccard_google.append(get_jaccard_similarity(noisy_img_text, noisy_text))
    cosine_google.append(get_cosine_sim(noisy_img_text, noisy_text))
    levens_google.append(get_damerau_levenshtein_distance(noisy_img_text, noisy_text))
    levensN_google.append(get_damerau_levenshtein_distance(noisy_img_text, noisy_text, True))

    
    print("GOOGLE")
    print("Jaccard -> ", jaccard_google)
    print("cosine -> ", cosine_google)
    print("levens -> ", levens_google)
    print("levensN -> ", levensN_google)


    print("AZURE")
    print("Jaccard -> ", jaccard_azure)
    print("cosine -> ", cosine_azure)
    print("levens -> ", levens_azure)
    print("levensN -> ", levensN_azure)
