from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import datetime
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
    """ViewSet pour la gestion des employés"""
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return EmployeeListSerializer
        return EmployeeSerializer
    
    def get_queryset(self):
        """Filtrage des employés"""
        queryset = super().get_queryset()
        
        # Filtres
        departement = self.request.query_params.get('departement')
        type_contrat = self.request.query_params.get('type_contrat')
        is_active = self.request.query_params.get('is_active')
        search = self.request.query_params.get('search')
        
        if departement:
            queryset = queryset.filter(departement=departement)
        if type_contrat:
            queryset = queryset.filter(type_contrat=type_contrat)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        if search:
            queryset = queryset.filter(
                Q(nom__icontains=search) | 
                Q(prenom__icontains=search) | 
                Q(poste__icontains=search)
            )
        
        return queryset
    
    def perform_create(self, serializer):
        """Création d'un employé avec l'ID généré automatiquement"""
        serializer.save(created_by=self.request.user)
    
    def perform_update(self, serializer):
        """Mise à jour d'un employé"""
        serializer.save()
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Statistiques des employés"""
        employees = self.get_queryset()
        
        total_employees = employees.count()
        total_salaire = employees.aggregate(Sum('salaire'))['salaire__sum'] or 0
        total_charges = employees.aggregate(Sum('charges'))['charges__sum'] or 0
        total_primes = employees.aggregate(Sum('primes'))['primes__sum'] or 0
        
        return Response({
            'total_employees': total_employees,
            'total_salaire': float(total_salaire),
            'total_charges': float(total_charges),
            'total_primes': float(total_primes),
            'total_mensuel': float(total_salaire + total_charges + total_primes),
        })


class FormationViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des formations"""
    queryset = Formation.objects.all()
    serializer_class = FormationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtres
        employee_id = self.request.query_params.get('employee')
        year = self.request.query_params.get('year')
        month = self.request.query_params.get('month')
        
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        if year:
            queryset = queryset.filter(date__year=year)
        if month and month != 'all':
            queryset = queryset.filter(date__month=int(month) + 1)
        
        return queryset
    
    def perform_create(self, serializer):
        """Création d'une formation"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Statistiques des formations"""
        queryset = self.get_queryset()
        
        total_cost = queryset.aggregate(Sum('cout'))['cout__sum'] or 0
        total_deplacement = queryset.aggregate(Sum('deplacement'))['deplacement__sum'] or 0
        total_hebergement = queryset.aggregate(Sum('hebergement'))['hebergement__sum'] or 0
        total_autres = queryset.aggregate(Sum('autres'))['autres__sum'] or 0
        
        return Response({
            'total_count': queryset.count(),
            'total_cost': float(total_cost),
            'total_deplacement': float(total_deplacement),
            'total_hebergement': float(total_hebergement),
            'total_autres': float(total_autres),
            'total_general': float(total_cost + total_deplacement + total_hebergement + total_autres),
        })


class DepenseViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des dépenses"""
    queryset = Depense.objects.all()
    serializer_class = DepenseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtres
        employee_id = self.request.query_params.get('employee')
        categorie = self.request.query_params.get('categorie')
        year = self.request.query_params.get('year')
        month = self.request.query_params.get('month')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        if categorie:
            queryset = queryset.filter(categorie=categorie)
        if year:
            queryset = queryset.filter(date__year=year)
        if month and month != 'all':
            queryset = queryset.filter(date__month=int(month) + 1)
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        
        return queryset
    
    def perform_create(self, serializer):
        """Création d'une dépense"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Statistiques des dépenses"""
        queryset = self.get_queryset()
        
        total_montant = queryset.aggregate(Sum('montant'))['montant__sum'] or 0
        
        # Statistiques par catégorie
        par_categorie = queryset.values('categorie').annotate(
            total=Sum('montant'),
            count=Count('id')
        )
        
        return Response({
            'total_montant': float(total_montant),
            'total_count': queryset.count(),
            'par_categorie': list(par_categorie),
        })


class CategorieDepenseViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des catégories de dépenses"""
    queryset = CategorieDepense.objects.all()
    serializer_class = CategorieDepenseSerializer
    permission_classes = [IsAuthenticated]