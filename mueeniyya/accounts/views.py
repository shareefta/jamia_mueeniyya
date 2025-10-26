from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Role, OffCampus
from .serializers import UserSerializer, RoleSerializer, LoginSerializer, OffCampusSerializer

# Role CRUD
class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]

# User CRUD
class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Superusers or Admins can view all users
        if user.is_superuser or (user.role and user.role.name.lower() == "admin"):
            return User.objects.all()

        # Staff users can view only themselves or users from their campuses
        return User.objects.filter(off_campuses__in=user.off_campuses.all()).distinct()
    
    def create(self, request, *args, **kwargs):
        print("📥 Incoming data:", request.data)
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("❌ Serializer Errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# JWT Login View
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        mobile = serializer.validated_data['mobile']
        password = serializer.validated_data['password']

        user = authenticate(request, mobile=mobile, password=password)
        if not user:
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        })

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

class OffCampusViewSet(viewsets.ModelViewSet):
    serializer_class = OffCampusSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or (hasattr(user, "role") and user.role and user.role.name.lower() == "admin"):
            return OffCampus.objects.all().order_by('name')
        return user.off_campuses.all().order_by('name')