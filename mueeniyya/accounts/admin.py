from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, Role, OffCampus

admin.site.register(User)
admin.site.register(Role)
admin.site.register(OffCampus)