from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('subtotal',)
    fields = ('product', 'quantity', 'unit_price', 'subtotal')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'buyer', 'status', 'total_price', 'created_at', 'updated_at')
    list_display_links = ('id', 'buyer')
    list_filter = ('status', 'created_at')
    search_fields = ('buyer__username', 'buyer__email', 'delivery_address', 'notes')
    readonly_fields = ('created_at', 'updated_at')
    inlines = (OrderItemInline,)
    fieldsets = (
        ('Order Info', {
            'fields': ('buyer', 'status', 'delivery_address', 'notes')
        }),
        ('Financials', {
            'fields': ('total_price',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

