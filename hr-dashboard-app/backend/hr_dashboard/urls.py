from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def home(request):
    return HttpResponse("""
        <h1>Dashboard RH API</h1>
        <p>Bienvenue sur l'API du Dashboard RH</p>
        <p>Endpoints disponibles:</p>
        <ul>
            <li><a href="/api/employees/">/api/employees/</a></li>
            <li><a href="/api/formations/">/api/formations/</a></li>
            <li><a href="/api/depenses/">/api/depenses/</a></li>
            <li><a href="/admin/">/admin/</a></li>
        </ul>
    """)

urlpatterns = [
    path('', home, name='home'),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
