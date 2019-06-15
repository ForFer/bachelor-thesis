from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User

from rest_framework import serializers

from .models import Entry, Image


class ImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = Image
        fields = ('id', 'image', 'text', 'entry')


class ImageSerializerLite(serializers.ModelSerializer):

    class Meta:
        model = Image
        fields = ('id', 'image', 'text')


class EntrySerializer(serializers.ModelSerializer):
    entry_images = ImageSerializerLite(many=True, read_only=True)

    class Meta:
        model = Entry
        fields = ('id', 'title', 'author', 'year', 'created_at', 'entry_images')


# POST/PUT purposes
class UserDetailedSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'id', 'date_joined', 'password')

    def validate_password(self, value):
        return make_password(value)

    def create(self, validated_data):
        user = User.objects.create_superuser(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )

        user.save()

        return user


# GET Purposes
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'id', 'date_joined')