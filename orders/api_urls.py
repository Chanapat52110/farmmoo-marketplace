from django.urls import path
from .api_views import OrderViewSet

order_list_create = OrderViewSet.as_view({'post': 'create'})
my_orders = OrderViewSet.as_view({'get': 'my_orders'})
shop_orders = OrderViewSet.as_view({'get': 'shop_orders'})
order_detail = OrderViewSet.as_view({'get': 'retrieve'})
update_status = OrderViewSet.as_view({'patch': 'update_status'})

urlpatterns = [
    path('orders/', order_list_create, name='api_create_order'),
    path('orders/<int:pk>/', order_detail, name='api_order_detail'),
    path('my-orders/', my_orders, name='api_my_orders'),
    path('shop-orders/', shop_orders, name='api_shop_orders'),
    path('orders/<int:pk>/status/', update_status, name='api_update_order_status'),
]
