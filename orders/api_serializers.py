from decimal import Decimal
from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    """Detailed order item with product and shop info."""
    subtotal = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True
    )
    shop_name = serializers.CharField(source='shop.name', read_only=True, default='ไม่ระบุ')
    product_id = serializers.IntegerField(source='product.pk', read_only=True, default=None)

    class Meta:
        model = OrderItem
        fields = ['id', 'product_id', 'product_name', 'quantity', 'unit_price', 'subtotal', 'shop_name']


class OrderSerializer(serializers.ModelSerializer):
    """Standard order serializer for list/detail views."""
    items = serializers.SerializerMethodField()
    buyer_username = serializers.CharField(source='buyer.username', read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)

    def get_items(self, obj):
        """Filter items by shop context if provided (for seller views)."""
        qs = obj.items.all()
        shop = self.context.get('shop')
        if shop is not None:
            qs = qs.filter(shop=shop)
        return OrderItemSerializer(qs, many=True).data

    class Meta:
        model = Order
        fields = [
            'id', 'buyer_username', 'status', 'status_label',
            'delivery_address', 'total_price', 'notes',
            'items', 'created_at', 'updated_at',
        ]


class OrderDetailSerializer(serializers.ModelSerializer):
    """Detailed order view with full item and buyer information."""
    items = OrderItemSerializer(many=True, read_only=True)
    buyer_username = serializers.CharField(source='buyer.username', read_only=True)
    buyer_phone = serializers.SerializerMethodField()
    buyer_profile = serializers.SerializerMethodField()
    status_label = serializers.CharField(source='get_status_display', read_only=True)

    def get_buyer_phone(self, obj):
        """Get buyer's phone from profile if available."""
        try:
            profile = obj.buyer.profile
            return profile.phone if hasattr(profile, 'phone') else None
        except:
            return None

    def get_buyer_profile(self, obj):
        """Get buyer's profile info."""
        return {
            'username': obj.buyer.username,
            'first_name': obj.buyer.first_name,
            'last_name': obj.buyer.last_name,
            'email': obj.buyer.email,
        }

    class Meta:
        model = Order
        fields = [
            'id', 'buyer_username', 'buyer_phone', 'buyer_profile',
            'status', 'status_label',
            'delivery_address', 'total_price', 'notes',
            'items', 'created_at', 'updated_at',
        ]


# ── Write serializer ─────────────────────────────────────────────────────────

class CartItemInputSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.DecimalField(max_digits=8, decimal_places=2, min_value=Decimal('0.1'), max_value=Decimal('9999.99'))


class CreateOrderSerializer(serializers.Serializer):
    items = CartItemInputSerializer(many=True, min_length=1)
    delivery_address = serializers.CharField(max_length=500)
    notes = serializers.CharField(required=False, allow_blank=True, default='')


class UpdateOrderStatusSerializer(serializers.Serializer):
    ALLOWED = [Order.STATUS_CONFIRMED, Order.STATUS_PREPARING, Order.STATUS_SHIPPED, Order.STATUS_DELIVERED, Order.STATUS_CANCELLED]
    status = serializers.ChoiceField(choices=ALLOWED)
