from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count, Q
from django.utils import timezone
from .models import Employee, Formation, Depense, CategorieDepense
from .serializers import (
    EmployeeSerializer, FormationSerializer, DepenseSerializer, 
    CategorieDepenseSerializer, EmployeeListSerializer, UserSerializer
)

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """Récupère l'utilisateur actuel"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return EmployeeListSerializer
        return EmployeeSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        departement = self.request.query_params.get('departement')
        contrat = self.request.query_params.get('type_contrat')
        search = self.request.query_params.get('search')
        
        if departement:
            queryset = queryset.filter(departement=departement)
        if contrat:
            queryset = queryset.filter(type_contrat=contrat)
        if search:
            queryset = queryset.filter(
                Q(nom__icontains=search) | 
                Q(prenom__icontains=search) |
                Q(poste__icontains=search)
            )
        return queryset
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        employees = self.get_queryset()
        total = employees.count()
        by_department = employees.values('departement').annotate(
            count=Count('id'),
            total_salaire=Sum('salaire')
        )
        by_contract = employees.values('type_contrat').annotate(count=Count('id'))
        total_monthly_cost = sum(e.monthly_recurring_cost() for e in employees)
        
        return Response({
            'total': total,
            'by_department': by_department,
            'by_contract': by_contract,
            'total_monthly_cost': float(total_monthly_cost)
        })

class FormationViewSet(viewsets.ModelViewSet):
    queryset = Formation.objects.all()
    serializer_class = FormationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        employee_id = self.request.query_params.get('employee')
        year = self.request.query_params.get('year')
        
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        if year:
            queryset = queryset.filter(date__year=year)
        return queryset

class DepenseViewSet(viewsets.ModelViewSet):
    queryset = Depense.objects.all()
    serializer_class = DepenseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        employee_id = self.request.query_params.get('employee')
        categorie = self.request.query_params.get('categorie')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        if categorie:
            queryset = queryset.filter(categorie=categorie)
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        return queryset

class CategorieDepenseViewSet(viewsets.ModelViewSet):
    queryset = CategorieDepense.objects.all()
    serializer_class = CategorieDepenseSerializer
    permission_classes = [IsAuthenticated]
