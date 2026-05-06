from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify


class Farm(models.Model):
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=255)
    owner_name = models.CharField(max_length=200)
    contact = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Shop(models.Model):
    """One shop per seller, auto-created on first product."""
    owner = models.OneToOneField(User, on_delete=models.CASCADE, related_name='shop')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='shops/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    STATUS_AVAILABLE = 'available'
    STATUS_OUT_OF_STOCK = 'out_of_stock'
    STATUS_DISCONTINUED = 'discontinued'
    STATUS_CHOICES = [
        (STATUS_AVAILABLE, 'Available'),
        (STATUS_OUT_OF_STOCK, 'Out of Stock'),
        (STATUS_DISCONTINUED, 'Discontinued'),
    ]

    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    farm = models.ForeignKey(Farm, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    shop = models.ForeignKey(Shop, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_AVAILABLE)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name) or 'product'
            slug = base_slug
            n = 1
            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base_slug}-{n}'
                n += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

