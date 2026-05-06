#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'FarmMoo.settings')
django.setup()

from django.contrib.auth.models import User
from products.models import Shop, Product
from decimal import Decimal

# Create additional test users and shops
test_users = [
    ('farm_green', 'ไร่สีเขียว', 'ฟาร์มหมูสดใหม่ทุกวัน'),
    ('farm_organic', 'สวนเสบียง', 'เลี้ยงหมูธรรมชาติ 100%'),
    ('farm_premium', 'ไทยหมูดี', 'ที่ดีที่สุดในเมืองไทย'),
]

for username, shop_name, description in test_users:
    # Create user
    user, created = User.objects.get_or_create(
        username=username,
        defaults={'email': f'{username}@farmmoo.com'}
    )
    if created:
        user.set_password('test123')
        user.save()
    
    # Create or update shop
    shop, created = Shop.objects.get_or_create(
        owner=user,
        defaults={
            'name': shop_name,
            'description': description
        }
    )
    
    if created:
        print(f'Created shop: {shop.name}')
        
        # Add sample products
        for i in range(3):
            Product.objects.create(
                shop=shop,
                name=f'{shop_name} - หมูสด {i+1}',
                description=f'หมูสดใหม่ {description}',
                price=Decimal('170.00'),
                stock=Decimal('10.0'),
                status='available'
            )
        print(f'  Added 3 products to {shop.name}')

print('\n✓ Test data created!')
