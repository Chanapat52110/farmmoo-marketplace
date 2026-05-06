from rest_framework import serializers

from .models import Product, Shop


class ShopSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    image_url = serializers.SerializerMethodField()

    def get_image_url(self, obj):
        if not obj.image:
            return None
        request = self.context.get('request')
        return request.build_absolute_uri(obj.image.url) if request else obj.image.url

    class Meta:
        model = Shop
        fields = ['id', 'name', 'description', 'image_url', 'owner_username', 'created_at']


class ShopUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shop
        fields = ['name', 'description', 'image']


class ProductSerializer(serializers.ModelSerializer):
    """Read serializer — safe for public consumption."""
    seller_name = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'price', 'stock', 'description',
            'status', 'seller_name', 'image_url', 'created_at',
        ]

    def get_seller_name(self, obj):
        if obj.shop_id:
            return obj.shop.name
        if obj.farm_id:
            return obj.farm.name
        return 'ไม่ระบุ'

    def get_image_url(self, obj):
        if not obj.image:
            return None
        request = self.context.get('request')
        return request.build_absolute_uri(obj.image.url) if request else obj.image.url


class ProductUpdateSerializer(serializers.ModelSerializer):
    """Partial-update serializer for seller product editing."""
    class Meta:
        model = Product
        fields = ['name', 'price', 'stock', 'description', 'status', 'image']
        extra_kwargs = {f: {'required': False} for f in ['name', 'price', 'stock', 'description', 'status', 'image']}


class ProductCreateSerializer(serializers.Serializer):
    """Write serializer for seller product creation."""
    name = serializers.CharField(max_length=200)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0)
    stock = serializers.DecimalField(max_digits=8, decimal_places=2, min_value=0)
    description = serializers.CharField(required=False, allow_blank=True, default='')
    image = serializers.ImageField(required=False, allow_null=True)

    def create(self, validated_data):
        user = self.context['request'].user
        # Auto-create shop for seller on first product
        try:
            shop = user.shop
        except Shop.DoesNotExist:
            shop = Shop.objects.create(
                owner=user,
                name=f'ร้านของ {user.username}',
            )
        image = validated_data.pop('image', None)
        product = Product.objects.create(
            shop=shop,
            image=image,
            **validated_data,
        )
        return product
