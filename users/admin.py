from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import Profile


class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Profile'
    fk_name = 'user'
    fields = ('role', 'phone', 'address')


class UserAdmin(BaseUserAdmin):
    inlines = (ProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'get_role', 'is_active', 'date_joined')
    list_filter = ('is_active', 'is_staff', 'profile__role')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'profile__phone')

    @admin.display(description='Role')
    def get_role(self, obj):
        return obj.profile.get_role_display() if hasattr(obj, 'profile') else '—'


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'phone', 'address', 'created_at')
    list_filter = ('role',)
    search_fields = ('user__username', 'user__email', 'phone', 'address')
    readonly_fields = ('created_at',)


admin.site.unregister(User)
admin.site.register(User, UserAdmin)

