from django.db import models

# Create your models here.
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models

# 1️⃣ Custom User Manager
class UserManager(BaseUserManager):
    def create_user(self, mobile, password=None, role='user', **extra_fields):
        if not mobile:
            raise ValueError("Mobile number is required")
        user = self.model(mobile=mobile, role=role, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, mobile, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        from .models import Role  # Import Role here (safe to do inside function)
        role, created = Role.objects.get_or_create(name='admin')

        return self.create_user(mobile, password, role=role, **extra_fields)

# 2️⃣ Role choices
class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

# 3️⃣ Off Campus model
class OffCampus(models.Model):
    name = models.CharField(max_length=150, unique=True)
    address = models.TextField(blank=True, null=True)
    contact_number = models.CharField(max_length=15, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

# 3️⃣ User model
class User(AbstractBaseUser, PermissionsMixin):
    name = models.CharField(max_length=100, blank=True, null=True)
    mobile = models.CharField(max_length=15, unique=True)
    email = models.EmailField(max_length=100, blank=True, null=True)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True)
    off_campuses = models.ManyToManyField(OffCampus, blank=True, related_name="staff_users")
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = 'mobile'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.mobile