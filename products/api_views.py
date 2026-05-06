from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound
from rest_framework.permissions import AllowAny, IsAuthenticated

from FarmMoo.api_response import api_success
from .api_serializers import (
    ProductCreateSerializer,
    ProductSerializer,
    ProductUpdateSerializer,
    ShopSerializer,
    ShopUpdateSerializer,
)
from .models import Product, Shop
from .permissions import IsSeller


class ProductViewSet(viewsets.ViewSet):
    def get_permissions(self):
        if self.action in ('create', 'destroy', 'my_products', 'partial_update'):
            permission_classes = [IsAuthenticated, IsSeller]
        else:
            permission_classes = [AllowAny]
        return [permission() for permission in permission_classes]

    def list(self, request):
        qs = (
            Product.objects
            .select_related('shop', 'farm')
            .exclude(status=Product.STATUS_DISCONTINUED)
        )
        # Search
        search = request.query_params.get('search', '').strip()
        if search:
            from django.db.models import Q
            qs = qs.filter(Q(name__icontains=search) | Q(shop__name__icontains=search))

        # Filter by status
        filter_status = request.query_params.get('status', '').strip()
        if filter_status in (Product.STATUS_AVAILABLE, Product.STATUS_OUT_OF_STOCK):
            qs = qs.filter(status=filter_status)

        # Filter by shop
        shop_id = request.query_params.get('shop', '').strip()
        if shop_id:
            try:
                shop_id = int(shop_id)
                qs = qs.filter(shop_id=shop_id)
            except (ValueError, TypeError):
                pass

        # Sorting
        ordering = request.query_params.get('ordering', '-created_at')
        allowed_orderings = {'price', '-price', 'name', '-name', 'created_at', '-created_at', 'stock', '-stock'}
        if ordering not in allowed_orderings:
            ordering = '-created_at'
        qs = qs.order_by(ordering)

        return api_success(ProductSerializer(qs, many=True, context={'request': request}).data)

    def retrieve(self, request, pk=None):
        try:
            product = Product.objects.select_related('shop', 'farm').get(pk=pk)
        except Product.DoesNotExist:
            raise NotFound('ไม่พบสินค้า')

        if product.status == Product.STATUS_DISCONTINUED:
            raise NotFound('ไม่พบสินค้า')

        return api_success(ProductSerializer(product, context={'request': request}).data)

    def create(self, request):
        serializer = ProductCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        return api_success(
            ProductSerializer(product, context={'request': request}).data,
            status_code=status.HTTP_201_CREATED,
        )

    def destroy(self, request, pk=None):
        try:
            shop = request.user.shop
        except Shop.DoesNotExist:
            raise NotFound('ยังไม่มีร้านค้า')

        try:
            product = shop.products.get(pk=pk)
        except Product.DoesNotExist:
            raise NotFound('ไม่พบสินค้า หรือไม่ใช่สินค้าของคุณ')

        product.delete()
        return api_success(None, status_code=status.HTTP_200_OK)

    def partial_update(self, request, pk=None):
        try:
            shop = request.user.shop
        except Shop.DoesNotExist:
            raise NotFound('ยังไม่มีร้านค้า')

        try:
            product = shop.products.get(pk=pk)
        except Product.DoesNotExist:
            raise NotFound('ไม่พบสินค้า หรือไม่ใช่สินค้าของคุณ')

        serializer = ProductUpdateSerializer(product, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        # Auto-update status based on stock if not explicitly set
        if 'status' not in request.data and 'stock' in request.data:
            if product.stock == 0:
                product.status = Product.STATUS_OUT_OF_STOCK
                product.save(update_fields=['status'])
            elif product.status == Product.STATUS_OUT_OF_STOCK:
                product.status = Product.STATUS_AVAILABLE
                product.save(update_fields=['status'])
        return api_success(ProductSerializer(product, context={'request': request}).data)

    @action(detail=False, methods=['get'])
    def my_products(self, request):
        try:
            shop = request.user.shop
        except Shop.DoesNotExist:
            return api_success([])

        qs = shop.products.all()
        return api_success(ProductSerializer(qs, many=True, context={'request': request}).data)


class ShopViewSet(viewsets.ViewSet):
    def get_permissions(self):
        if self.action == 'my_shop':
            permission_classes = [IsAuthenticated, IsSeller]
        else:
            permission_classes = [AllowAny]
        return [permission() for permission in permission_classes]

    def list(self, request):
        """List all shops with products (for featured shops, etc)."""
        # Get shops that have at least one product
        qs = Shop.objects.filter(products__isnull=False).distinct().order_by('-created_at')
        return api_success(ShopSerializer(qs, many=True, context={'request': request}).data)

    def retrieve(self, request, pk=None):
        try:
            shop = Shop.objects.get(pk=pk)
        except Shop.DoesNotExist:
            raise NotFound('ไม่พบร้านค้า')

        return api_success(ShopSerializer(shop, context={'request': request}).data)

    @action(detail=False, methods=['get', 'patch'])
    def my_shop(self, request):
        try:
            shop = request.user.shop
        except Shop.DoesNotExist:
            shop = Shop.objects.create(owner=request.user, name=f'ร้านของ {request.user.username}')

        if request.method == 'GET':
            return api_success(ShopSerializer(shop, context={'request': request}).data)

        serializer = ShopUpdateSerializer(shop, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return api_success(ShopSerializer(shop, context={'request': request}).data)
