from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Employee, Formation, Depense, CategorieDepense

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class EmployeeSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    monthly_cost = serializers.SerializerMethodField()
    
    class Meta:
        model = Employee
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_full_name(self, obj):
        return f"{obj.prenom} {obj.nom}"
    
    def get_monthly_cost(self, obj):
        return float(obj.monthly_recurring_cost())
    
    def create(self, validated_data):
        # L'ID sera généré automatiquement par la méthode save() du modèle
        return Employee.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        # Empêcher la modification de l'ID
        validated_data.pop('id', None)
        return super().update(instance, validated_data)


class EmployeeListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    monthly_cost = serializers.SerializerMethodField()
    
    class Meta:
        model = Employee
        fields = ['id', 'nom', 'prenom', 'full_name', 'poste', 'departement', 
                  'type_contrat', 'salaire', 'charges', 'primes', 'transport',
                  'telephone', 'assurance', 'avantages', 'autres_recurrent',
                  'is_active', 'monthly_cost']
    
    def get_full_name(self, obj):
        return f"{obj.prenom} {obj.nom}"
    
    def get_monthly_cost(self, obj):
        return float(obj.monthly_recurring_cost())


class FormationSerializer(serializers.ModelSerializer):
    total_cost = serializers.SerializerMethodField()
    employee_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Formation
        fields = ['id', 'employee', 'employee_name', 'nom', 'date', 'organisme', 
                  'cout', 'deplacement', 'hebergement', 'autres', 'total_cost', 
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_total_cost(self, obj):
        return float(obj.total_cost())
    
    def get_employee_name(self, obj):
        return str(obj.employee)
    
    def create(self, validated_data):
        # L'ID sera généré automatiquement
        return Formation.objects.create(**validated_data)


class DepenseSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    categorie_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Depense
        fields = ['id', 'employee', 'employee_name', 'date', 'categorie', 
                  'categorie_display', 'description', 'montant', 'mode_paiement', 
                  'justificatif', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_employee_name(self, obj):
        return str(obj.employee)
    
    def get_categorie_display(self, obj):
        return obj.get_categorie_display()
    
    def create(self, validated_data):
        # L'ID sera généré automatiquement
        return Depense.objects.create(**validated_data)


class CategorieDepenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategorieDepense
        fields = ['id', 'nom', 'description', 'icon', 'color']
        read_only_fields = ['id']