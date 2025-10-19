from rest_framework import serializers
from .models import User, Role, OffCampus

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'

class OffCampusSerializer(serializers.ModelSerializer):
    class Meta:
        model = OffCampus
        fields = ['id', 'name', 'address', 'contact_number', 'email', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']

class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='role.name', read_only=True)
    role_id = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(), source='role', write_only=True
    )
    off_campuses = OffCampusSerializer(read_only=True, many=True)
    off_campus_ids = serializers.PrimaryKeyRelatedField(
        queryset=OffCampus.objects.all(), write_only=True, many=True
    )
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'id', 'name', 'email', 'mobile', 'role', 'role_id',
            'off_campuses', 'off_campus_ids', 'is_active', 'is_staff',
            'password', 'date_joined'
        ]

    def create(self, validated_data):
        off_campuses = validated_data.pop('off_campus_ids', [])
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        user.set_password(password if password else '123456')
        user.save()
        user.off_campuses.set(off_campuses)
        return user

    def update(self, instance, validated_data):
        off_campuses = validated_data.pop('off_campus_ids', None)
        password = validated_data.pop('password', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        if off_campuses is not None:
            instance.off_campuses.set(off_campuses)
        return instance

class LoginSerializer(serializers.Serializer):
    mobile = serializers.CharField()
    password = serializers.CharField(write_only=True)
