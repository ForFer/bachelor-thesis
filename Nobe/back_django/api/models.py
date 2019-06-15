from django.db import models
from django.conf import settings


class Entry(models.Model):
    title = models.CharField(max_length=256)
    author = models.CharField(max_length=128)
    year = models.fields.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Entry ->  title: {self.title}, " \
            f"author: {self.author}, published on: {self.year}"


class Image(models.Model):
    entry = models.ForeignKey(Entry, on_delete=models.CASCADE, related_name='entry_images')
    image = models.ImageField(upload_to='documents/%Y/%m/%d')
    text = models.TextField(default="Texto no encontrado en la imagen")

    def save(self, *args, **kwargs):
        if self.image:
            if 'override' not in kwargs:
                self.text = settings.DETECTOR(self.image.read())
            else:
                del kwargs['override']

        return super(Image, self).save(*args, **kwargs)

    def __str__(self):
        return f"Image (id: {self.id}) with text: {self.text[:20]}... and image: {self.image} " \
            f"from entry {self.entry.id}"
