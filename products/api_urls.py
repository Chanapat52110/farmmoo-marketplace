from django.urls import path
from .api_views import ProductViewSet, ShopViewSet

product_list = ProductViewSet.as_view({'get': 'list', 'post': 'create'})
product_detail = ProductViewSet.as_view({'get': 'retrieve', 'delete': 'destroy', 'patch': 'partial_update'})
my_products = ProductViewSet.as_view({'get': 'my_products'})

shop_list = ShopViewSet.as_view({'get': 'list'})
my_shop = ShopViewSet.as_view({'get': 'my_shop', 'patch': 'my_shop'})
shop_detail = ShopViewSet.as_view({'get': 'retrieve'})

urlpatterns = [
    path('products/', product_list, name='api_products'),
    path('products/<int:pk>/', product_detail, name='api_product_detail_or_delete'),
    path('my-products/', my_products, name='api_my_products'),
    path('shops/', shop_list, name='api_shops_list'),
    path('my-shop/', my_shop, name='api_my_shop'),
    path('shops/<int:pk>/', shop_detail, name='api_shop_detail'),
]
