from google.cloud import vision

client = vision.ImageAnnotatorClient()


def detect_document(image):
    """Detects document features in an image."""

    image = vision.types.Image(content=image)

    response = client.document_text_detection(image=image)

    text = ''

    for page in response.full_text_annotation.pages:
        for block in page.blocks:
            for paragraph in block.paragraphs:
                for word in paragraph.words:
                    text += ''.join([
                        symbol.text for symbol in word.symbols
                    ])

                    # Space between words
                    text += ' '

            # New line between paragraphs
            text += '\n'

    return text
