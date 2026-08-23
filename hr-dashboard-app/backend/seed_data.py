import os
import django
import random
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hr_dashboard.settings')
django.setup()

from api.models import Employee, Formation, Depense

# Noms et prénoms pour les données de test
NOMS = ['Koffi', 'N\'Guessan', 'Traoré', 'Kouassi', 'Bamba', 'Ouattara', 'Koné', 'Soro', 'Coulibaly', 'Diaby']
PRENOMS = ['Aya', 'Marc', 'Fatou', 'Jean', 'Aïcha', 'Ibrahim', 'Moussa', 'Aminata', 'Kadiatou', 'Souleymane']
POSTES = ['Comptable', 'Développeur', 'Responsable RH', 'Commercial', 'Assistant', 'Directeur', 'Manager', 'Analyste']
DEPARTEMENTS = ['Finance', 'IT', 'RH', 'Ventes', 'Admin', 'Marketing', 'Production']
CONTRATS = ['CDI', 'CDD', 'STAGE', 'CONSULTANT']

print("Création des employés...")
employees = []
for i in range(10):
    emp = Employee(
        id=f"e{i+1}",
        nom=random.choice(NOMS),
        prenom=random.choice(PRENOMS),
        poste=random.choice(POSTES),
        departement=random.choice(DEPARTEMENTS),
        date_embauche=datetime.now() - timedelta(days=random.randint(100, 2000)),
        type_contrat=random.choice(CONTRATS),
        salaire=random.randint(250000, 800000),
        charges=random.randint(50000, 160000),
        primes=random.randint(10000, 70000),
        transport=random.randint(10000, 30000),
        telephone=random.randint(5000, 25000),
        assurance=random.randint(10000, 25000),
        avantages=random.randint(5000, 20000),
        autres_recurrent=random.randint(0, 10000)
    )
    emp.save()
    employees.append(emp)
    print(f"  ✅ {emp.prenom} {emp.nom} - {emp.poste}")

print("\nCréation des formations...")
formation_noms = ['React Avancé', 'Certification Management', 'Normes SYSCOHADA', 
                  'Leadership', 'Communication', 'Anglais', 'Python', 'Data Science']
organismes = ['TechAcademy', 'CI Business School', 'Ordre des Experts', 'Formation Pro', 'Consulting Group']

for i in range(5):
    emp = random.choice(employees)
    form = Formation(
        id=f"f{i+1}",
        employee=emp,
        nom=random.choice(formation_noms),
        date=datetime.now() - timedelta(days=random.randint(1, 300)),
        organisme=random.choice(organismes),
        cout=random.randint(50000, 300000),
        deplacement=random.randint(0, 50000),
        hebergement=random.randint(0, 60000),
        autres=random.randint(0, 10000)
    )
    form.save()
    print(f"  ✅ {form.nom} - {emp.prenom} {emp.nom} - {form.total_cost()} FCFA")

print("\nCréation des dépenses...")
categories = ['MATERIEL', 'MISSION', 'SANTE', 'EVENEMENT', 'FOURNITURE', 'AUTRE']
modes = ['ESPECES', 'VIREMENT', 'MOBILE_MONEY', 'CHEQUE']

for i in range(8):
    emp = random.choice(employees)
    dep = Depense(
        id=f"d{i+1}",
        employee=emp,
        date=datetime.now() - timedelta(days=random.randint(1, 200)),
        categorie=random.choice(categories),
        description=f"Dépense {i+1} pour {emp.prenom}",
        montant=random.randint(20000, 500000),
        mode_paiement=random.choice(modes),
        justificatif=f"Justificatif {i+1}" if random.choice([True, False]) else ""
    )
    dep.save()
    print(f"  ✅ {dep.get_categorie_display()} - {dep.montant} FCFA - {emp.prenom} {emp.nom}")

print(f"\n✅ Données créées avec succès!")
print(f"   - {Employee.objects.count()} employés")
print(f"   - {Formation.objects.count()} formations")
print(f"   - {Depense.objects.count()} dépenses")
