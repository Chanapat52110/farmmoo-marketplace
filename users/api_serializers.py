from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Profile


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=['customer', 'seller'])
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True, default='')

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Username already taken.')
        return value

    def create(self, validated_data):
        phone = validated_data.pop('phone', '')
        role = validated_data.pop('role')
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
        )
        # Profile is auto-created via signal — just update role/phone
        user.profile.role = role
        user.profile.phone = phone
        user.profile.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='profile.role', read_only=True)
    phone = serializers.CharField(source='profile.phone', read_only=True)
    address = serializers.CharField(source='profile.address', read_only=True)
    image_url = serializers.SerializerMethodField()

    def get_image_url(self, obj):
        profile = getattr(obj, 'profile', None)
        if not profile or not profile.image:
            return None
        request = self.context.get('request')
        return request.build_absolute_uri(profile.image.url) if request else profile.image.url

    class Meta:
        model = User
        fields = ['id', 'username', 'role', 'phone', 'address', 'image_url']


class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['phone', 'address', 'image']
