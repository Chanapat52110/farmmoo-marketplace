from django.db import models
from django.contrib.auth.models import User
from products.models import Product, Shop


class Order(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_PAID = 'paid'
    STATUS_CONFIRMED = 'confirmed'
    STATUS_PREPARING = 'preparing'
    STATUS_SHIPPED = 'shipped'
    STATUS_DELIVERED = 'delivered'
    STATUS_CANCELLED = 'cancelled'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'รอชำระเงิน'),
        (STATUS_PAID, 'ชำระเงินแล้ว'),
        (STATUS_CONFIRMED, 'ยืนยันแล้ว'),
        (STATUS_PREPARING, 'กำลังเตรียม'),
        (STATUS_SHIPPED, 'จัดส่งแล้ว'),
        (STATUS_DELIVERED, 'ได้รับสินค้า'),
        (STATUS_CANCELLED, 'ยกเลิก'),
    ]

    buyer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    delivery_address = models.TextField()
    total_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Order #{self.pk} — {self.buyer} ({self.get_status_display()})'


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    # Snapshot of the shop at order time so seller can see items even if product deleted
    shop = models.ForeignKey(Shop, on_delete=models.SET_NULL, null=True, blank=True, related_name='order_items')
    quantity = models.DecimalField(max_digits=8, decimal_places=2, default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    # Snapshot of product name so history survives deletion
    product_name = models.CharField(max_length=200, default='')

    def __str__(self):
        return f'{self.quantity} × {self.product_name}'

    @property
    def subtotal(self):
        return self.quantity * self.unit_price

