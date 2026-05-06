from django.contrib import admin
from .models import Farm, Category, Product, Shop


@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'created_at')
    search_fields = ('name', 'owner__username')
    raw_id_fields = ('owner',)


@admin.register(Farm)
class FarmAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner_name', 'location', 'contact', 'is_active', 'created_at')
    list_display_links = ('name',)
    list_editable = ('is_active',)
    list_filter = ('is_active',)
    search_fields = ('name', 'owner_name', 'location', 'contact')
    ordering = ('name',)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'farm', 'category', 'price', 'stock', 'status', 'created_at')
    list_display_links = ('name',)
    list_editable = ('price', 'stock', 'status')
    list_filter = ('status', 'farm', 'category')
    search_fields = ('name', 'description', 'farm__name', 'category__name')
    prepopulated_fields = {'slug': ('name',)}
    autocomplete_fields = ('farm', 'category')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Basic Info', {
            'fields': ('name', 'slug', 'category', 'farm', 'description', 'image')
        }),
        ('Pricing & Stock', {
            'fields': ('price', 'stock', 'status')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

