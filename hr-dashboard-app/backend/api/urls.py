from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

router = DefaultRouter()
router.register('employees', views.EmployeeViewSet)
router.register('formations', views.FormationViewSet)
router.register('depenses', views.DepenseViewSet)
router.register('categories', views.CategorieDepenseViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('users/me/', views.get_current_user, name='current_user'),
]
