from django.contrib import admin
from .models import Employee, Formation, Depense

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['prenom', 'nom', 'poste', 'departement', 'type_contrat']
    list_filter = ['departement', 'type_contrat']
    search_fields = ['nom', 'prenom', 'poste']

@admin.register(Formation)
class FormationAdmin(admin.ModelAdmin):
    list_display = ['nom', 'employee', 'date', 'cout']
    list_filter = ['employee', 'date']
    search_fields = ['nom']

@admin.register(Depense)
class DepenseAdmin(admin.ModelAdmin):
    list_display = ['categorie', 'employee', 'date', 'montant']
    list_filter = ['categorie', 'date']
    search_fields = ['description']
