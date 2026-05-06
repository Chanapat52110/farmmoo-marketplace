from django.db import transaction
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated

from FarmMoo.api_response import api_success
from products.models import Product, Shop
from products.permissions import IsSeller
from .api_serializers import (
    CreateOrderSerializer,
    OrderSerializer,
    OrderDetailSerializer,
    UpdateOrderStatusSerializer,
)
from .models import Order, OrderItem


VALID_TRANSITIONS = {
    Order.STATUS_PENDING: {Order.STATUS_CONFIRMED, Order.STATUS_CANCELLED},
    Order.STATUS_PAID: {Order.STATUS_CONFIRMED, Order.STATUS_CANCELLED},
    Order.STATUS_CONFIRMED: {Order.STATUS_PREPARING, Order.STATUS_CANCELLED},
    Order.STATUS_PREPARING: {Order.STATUS_SHIPPED, Order.STATUS_CANCELLED},
    Order.STATUS_SHIPPED: {Order.STATUS_DELIVERED},
}


class OrderViewSet(viewsets.ViewSet):
    def get_permissions(self):
        if self.action in ('create', 'my_orders', 'retrieve'):
            permission_classes = [IsAuthenticated]
        elif self.action in ('shop_orders', 'update_status'):
            permission_classes = [IsAuthenticated, IsSeller]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def create(self, request):
        """POST /api/orders/ — Create new order from cart items."""
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        item_inputs = data['items']

        with transaction.atomic():
            product_ids = [i['product_id'] for i in item_inputs]
            products = {
                p.pk: p
                for p in Product.objects.select_for_update().filter(pk__in=product_ids)
            }

            errors = []
            for item in item_inputs:
                pid = item['product_id']
                qty = item['quantity']
                p = products.get(pid)
                if p is None:
                    errors.append(f'สินค้า #{pid} ไม่พบในระบบ')
                elif p.status == Product.STATUS_DISCONTINUED:
                    errors.append(f'สินค้า "{p.name}" ไม่มีจำหน่ายแล้ว')
                elif p.stock < qty:
                    errors.append(
                        f'สินค้า "{p.name}" มีเหลือเพียง {p.stock} กก. (ต้องการ {qty} กก.)'
                    )

            if errors:
                raise ValidationError({'detail': errors})

            total = sum(products[i['product_id']].price * i['quantity'] for i in item_inputs)

            order = Order.objects.create(
                buyer=request.user,
                status=Order.STATUS_PENDING,
                delivery_address=data['delivery_address'],
                total_price=total,
                notes=data.get('notes', ''),
            )

            for item in item_inputs:
                p = products[item['product_id']]
                qty = item['quantity']
                shop = p.shop if p.shop_id else None

                OrderItem.objects.create(
                    order=order,
                    product=p,
                    shop=shop,
                    quantity=qty,
                    unit_price=p.price,
                    product_name=p.name,
                )

                p.stock -= qty
                if p.stock == 0:
                    p.status = Product.STATUS_OUT_OF_STOCK
                p.save(update_fields=['stock', 'status'])

        return api_success(
            OrderDetailSerializer(order).data,
            status_code=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=['get'])
    def my_orders(self, request):
        """GET /api/my-orders/ — Get current user's orders (buyer view)."""
        orders = (
            Order.objects
            .filter(buyer=request.user)
            .prefetch_related('items__shop')
            .order_by('-created_at')
        )
        return api_success(OrderSerializer(orders, many=True).data)

    def retrieve(self, request, pk=None):
        """
        GET /api/orders/<pk>/ — Buyer sees their own order; seller sees orders for their shop items.
        """
        try:
            order = Order.objects.prefetch_related('items__shop').get(pk=pk)
        except Order.DoesNotExist:
            raise NotFound('ไม่พบออเดอร์')

        # Buyer can see their own order
        if order.buyer_id == request.user.pk:
            return api_success(OrderDetailSerializer(order).data)

        # Seller can see orders that contain their shop's items
        try:
            shop = request.user.shop
            if order.items.filter(shop=shop).exists():
                return api_success(
                    OrderDetailSerializer(order, context={'shop': shop}).data
                )
        except Shop.DoesNotExist:
            pass

        raise PermissionDenied('คุณไม่มีสิทธิ์ดูออเดอร์นี้')

    @action(detail=False, methods=['get'])
    def shop_orders(self, request):
        """GET /api/shop-orders/ — Get all incoming orders for seller's shop."""
        try:
            shop = request.user.shop
        except Shop.DoesNotExist:
            return api_success([])

        order_ids = (
            OrderItem.objects
            .filter(shop=shop)
            .values_list('order_id', flat=True)
            .distinct()
        )
        orders = (
            Order.objects
            .filter(pk__in=order_ids)
            .prefetch_related('items__shop')
            .order_by('-created_at')
        )
        return api_success(
            OrderSerializer(orders, many=True, context={'shop': shop, 'request': request}).data
        )

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """PATCH /api/orders/<pk>/status/ — Update order status (seller only)."""
        serializer = UpdateOrderStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            shop = request.user.shop
        except Shop.DoesNotExist:
            raise PermissionDenied('ไม่มีร้านค้า')

        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            raise NotFound('ไม่พบออเดอร์')

        if not order.items.filter(shop=shop).exists():
            raise PermissionDenied('คุณไม่มีสิทธิ์จัดการออเดอร์นี้')

        new_status = serializer.validated_data['status']
        allowed = VALID_TRANSITIONS.get(order.status, set())
        if new_status not in allowed:
            raise ValidationError({
                'status': [f'ไม่สามารถเปลี่ยนสถานะจาก {order.get_status_display()} เป็น {dict(Order.STATUS_CHOICES).get(new_status)} ได้']
            })

        order.status = new_status
        order.save(update_fields=['status', 'updated_at'])
        return api_success(OrderDetailSerializer(order).data)
