from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class Profile(models.Model):
    ROLE_FARMER = 'farmer'
    ROLE_SELLER = 'seller'
    ROLE_BUYER = 'buyer'
    ROLE_CUSTOMER = 'customer'
    ROLE_ADMIN = 'admin'
    ROLE_CHOICES = [
        (ROLE_SELLER, 'Seller/ผู้ขาย'),
        (ROLE_FARMER, 'Farmer/ผู้ขาย (เดิม)'),
        (ROLE_CUSTOMER, 'Customer/ผู้ซื้อ'),
        (ROLE_BUYER, 'Buyer/ผู้ซื้อ (เดิม)'),
        (ROLE_ADMIN, 'Admin'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    image = models.ImageField(upload_to='profiles/', blank=True, null=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=ROLE_BUYER)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.username} ({self.get_role_display()})'


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

