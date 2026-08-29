from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from decimal import Decimal
from django.utils import timezone

class User(AbstractUser):
    """Utilisateur personnalisé pour l'application"""
    phone = models.CharField(max_length=20, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    is_manager = models.BooleanField(default=False)
    
    # Ajout des related_name pour éviter les conflits
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name='api_user_groups',
        related_query_name='api_user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='api_user_permissions',
        related_query_name='api_user',
    )
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}" if self.first_name else self.username

class Employee(models.Model):
    """Modèle pour les employés"""
    CONTRACT_TYPES = [
        ('CDI', 'CDI'),
        ('CDD', 'CDD'),
        ('STAGE', 'Stage'),
        ('CONSULTANT', 'Consultant'),
        ('FREELANCE', 'Freelance'),
    ]
    
    id = models.CharField(max_length=20, primary_key=True)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    email = models.EmailField(blank=True, null=True)
    telephone = models.CharField(max_length=20, blank=True, null=True)  # ex: 07 08 09 10 11
    poste = models.CharField(max_length=200)
    departement = models.CharField(max_length=100)
    date_embauche = models.DateField()
    type_contrat = models.CharField(max_length=20, choices=CONTRACT_TYPES, default='CDI')
    
    # Coûts récurrents mensuels
    salaire = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    charges = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    primes = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    transport = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    cout_telephone = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    assurance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    avantages = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    autres_recurrent = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='employees_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['nom', 'prenom']
        indexes = [
            models.Index(fields=['departement']),
            models.Index(fields=['type_contrat']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.prenom} {self.nom} - {self.poste}"
    
    def monthly_recurring_cost(self):
        return (
            self.salaire + self.charges + self.primes + self.transport +
            self.cout_telephone + self.assurance + self.avantages + self.autres_recurrent
        )
    
    def annual_salary(self):
        return self.salaire * 12
    
    def annual_cost(self, formations=None, depenses=None):
        if formations is None:
            formations = []
        if depenses is None:
            depenses = []
        monthly = self.monthly_recurring_cost() * 12
        formations_total = sum(f.total_cost() for f in formations)
        depenses_total = sum(d.montant for d in depenses)
        return monthly + formations_total + depenses_total

    @classmethod
    def generate_id(cls):
        last_employee = cls.objects.order_by('-id').first()
        if not last_employee:
            return 'EMP001'
        last_id = last_employee.id
        if last_id.startswith('EMP'):
            try:
                num = int(last_id[3:])
                return f'EMP{num + 1:03d}'
            except ValueError:
                pass
        count = cls.objects.count()
        return f'EMP{count + 1:03d}'
    
    def save(self, *args, **kwargs):
        if not self.id:
            self.id = self.generate_id()
        super().save(*args, **kwargs)


class Formation(models.Model):
    """Modèle pour les formations"""
    id = models.CharField(max_length=20, primary_key=True)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='formations')
    nom = models.CharField(max_length=255)
    date = models.DateField()
    organisme = models.CharField(max_length=255, blank=True, null=True)
    
    # Coûts
    cout = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    deplacement = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    hebergement = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    autres = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Métadonnées
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='formations_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date']
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['employee', 'date']),
        ]
    
    def __str__(self):
        return self.nom
    
    def total_cost(self):
        """Coût total de la formation"""
        return self.cout + self.deplacement + self.hebergement + self.autres

    @classmethod
    def generate_id(cls):
        """Génère un ID unique pour les formations"""
        last = cls.objects.order_by('-id').first()
        if not last:
            return 'F001'
        try:
            num = int(last.id[1:]) + 1
            return f'F{num:03d}'
        except ValueError:
            count = cls.objects.count()
            return f'F{count + 1:03d}'
    
    def save(self, *args, **kwargs):
        """Surcharge de save pour générer automatiquement l'ID"""
        if not self.id:
            self.id = self.generate_id()
        super().save(*args, **kwargs)


class CategorieDepense(models.Model):
    """Modèle pour les catégories de dépenses personnalisables"""
    nom = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=50, blank=True, null=True)
    color = models.CharField(max_length=20, blank=True, null=True, help_text="Code couleur hexadécimal")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['nom']
        verbose_name_plural = "Catégories de dépenses"
    
    def __str__(self):
        return self.nom


class Depense(models.Model):
    """Modèle pour les autres dépenses ponctuelles"""
    CATEGORIES = [
        ('MATERIEL', 'Matériel'),
        ('MISSION', 'Mission'),
        ('SANTE', 'Santé'),
        ('EVENEMENT', 'Événement'),
        ('FOURNITURE', 'Fourniture'),
        ('AUTRE', 'Autre'),
    ]
    
    PAYMENT_METHODS = [
        ('ESPECES', 'Espèces'),
        ('VIREMENT', 'Virement'),
        ('MOBILE_MONEY', 'Mobile Money'),
        ('CHEQUE', 'Chèque'),
        ('CARTE', 'Carte Bancaire'),
    ]
    
    id = models.CharField(max_length=20, primary_key=True)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='depenses')
    date = models.DateField()
    categorie = models.CharField(max_length=50, choices=CATEGORIES)
    description = models.TextField()
    montant = models.DecimalField(max_digits=15, decimal_places=2)
    mode_paiement = models.CharField(max_length=20, choices=PAYMENT_METHODS, default='ESPECES')
    justificatif = models.CharField(max_length=255, blank=True, null=True)
    piece_jointe = models.FileField(upload_to='depenses/', blank=True, null=True)
    
    # Métadonnées
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='depenses_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date']
        verbose_name_plural = "Dépenses"
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['categorie']),
            models.Index(fields=['employee', 'date']),
        ]
    
    def __str__(self):
        return f"{self.get_categorie_display()} - {self.montant} FCFA"

    @classmethod
    def generate_id(cls):
        """Génère un ID unique pour les dépenses"""
        last = cls.objects.order_by('-id').first()
        if not last:
            return 'D001'
        try:
            num = int(last.id[1:]) + 1
            return f'D{num:03d}'
        except ValueError:
            count = cls.objects.count()
            return f'D{count + 1:03d}'
    
    def save(self, *args, **kwargs):
        """Surcharge de save pour générer automatiquement l'ID"""
        if not self.id:
            self.id = self.generate_id()
        super().save(*args, **kwargs)


class PerformanceIndicateur(models.Model):
    """Modèle pour les KPIs et indicateurs de performance"""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='indicateurs')
    date = models.DateField()
    
    # Indicateurs (sur 100)
    productivite = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text="Productivité en %")
    satisfaction = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text="Satisfaction en %")
    absentisme = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text="Taux d'absentéisme en %")
    performance = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text="Performance globale en %")
    
    commentaire = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date']
        unique_together = ['employee', 'date']
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['employee', 'date']),
        ]
    
    def __str__(self):
        return f"{self.employee} - {self.date}"


class Notification(models.Model):
    """Modèle pour les notifications"""
    NOTIFICATION_TYPES = [
        ('INFO', 'Information'),
        ('SUCCESS', 'Succès'),
        ('WARNING', 'Avertissement'),
        ('ERROR', 'Erreur'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    titre = models.CharField(max_length=255)
    message = models.TextField()
    est_lu = models.BooleanField(default=False)
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='INFO')
    link = models.CharField(max_length=255, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'est_lu']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return self.titre


class ExportLog(models.Model):
    """Journal des exports Excel/PDF"""
    EXPORT_TYPES = [
        ('EXCEL', 'Excel'),
        ('PDF', 'PDF'),
        ('CSV', 'CSV'),
    ]
    
    STATUS_CHOICES = [
        ('SUCCES', 'Succès'),
        ('ECHEC', 'Échec'),
        ('EN_COURS', 'En cours'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='exports')
    type_export = models.CharField(max_length=20, choices=EXPORT_TYPES)
    date_export = models.DateTimeField(auto_now_add=True)
    taille_fichier = models.BigIntegerField(default=0, help_text="Taille en octets")
    statut = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SUCCES')
    message_erreur = models.TextField(blank=True, null=True)
    filename = models.CharField(max_length=255, blank=True, null=True)
    
    class Meta:
        ordering = ['-date_export']
        indexes = [
            models.Index(fields=['user', 'date_export']),
        ]
    
    def __str__(self):
        return f"{self.type_export} - {self.date_export}"


class ParametreGlobal(models.Model):
    """Modèle pour les paramètres globaux de l'application"""
    cle = models.CharField(max_length=100, unique=True)
    valeur = models.TextField()
    description = models.TextField(blank=True, null=True)
    type = models.CharField(max_length=20, default='string', choices=[
        ('string', 'Chaîne de caractères'),
        ('integer', 'Nombre entier'),
        ('decimal', 'Nombre décimal'),
        ('boolean', 'Booléen'),
        ('json', 'JSON'),
    ])
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['cle']
        verbose_name_plural = "Paramètres globaux"
    
    def __str__(self):
        return f"{self.cle} = {self.valeur}"


class Departement(models.Model):
    """Modèle pour les départements"""
    nom = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    responsable = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='departements_responsable')
    budget_annuel = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    budget_utilise = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['nom']
    
    def __str__(self):
        return self.nom
    
    def budget_restant(self):
        """Calcul du budget restant"""
        return self.budget_annuel - self.budget_utilise


class PlanComptable(models.Model):
    """Modèle pour le plan comptable simplifié"""
    TYPE_COMPTES = [
        ('ACTIF', 'Actif'),
        ('PASSIF', 'Passif'),
        ('CHARGE', 'Charge'),
        ('PRODUIT', 'Produit'),
    ]
    
    numero = models.CharField(max_length=20, unique=True)
    nom = models.CharField(max_length=255)
    type_compte = models.CharField(max_length=20, choices=TYPE_COMPTES)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='enfants')
    description = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['numero']
        verbose_name_plural = "Plan comptable"
    
    def __str__(self):
        return f"{self.numero} - {self.nom}"


class OperationComptable(models.Model):
    """Modèle pour les opérations comptables"""
    date = models.DateField()
    libelle = models.CharField(max_length=255)
    montant = models.DecimalField(max_digits=15, decimal_places=2)
    debit = models.ForeignKey(PlanComptable, on_delete=models.CASCADE, related_name='operations_debit')
    credit = models.ForeignKey(PlanComptable, on_delete=models.CASCADE, related_name='operations_credit')
    reference = models.CharField(max_length=100, blank=True, null=True)
    piece_jointe = models.FileField(upload_to='operations/', blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    
    employee = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='operations')
    formation = models.ForeignKey(Formation, on_delete=models.SET_NULL, null=True, blank=True, related_name='operations')
    depense = models.ForeignKey(Depense, on_delete=models.SET_NULL, null=True, blank=True, related_name='operations')
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='operations_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date']
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['employee']),
        ]
    
    def __str__(self):
        return f"{self.date} - {self.libelle}"


class AuditLog(models.Model):
    """Modèle pour les logs d'audit"""
    ACTION_TYPES = [
        ('CREATE', 'Création'),
        ('UPDATE', 'Modification'),
        ('DELETE', 'Suppression'),
        ('VIEW', 'Consultation'),
        ('LOGIN', 'Connexion'),
        ('LOGOUT', 'Déconnexion'),
        ('EXPORT', 'Export'),
        ('IMPORT', 'Import'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='audit_logs')
    action = models.CharField(max_length=20, choices=ACTION_TYPES)
    module = models.CharField(max_length=100)
    objet_id = models.CharField(max_length=50, blank=True, null=True)
    objet_type = models.CharField(max_length=50, blank=True, null=True)
    details = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['action']),
            models.Index(fields=['module']),
        ]
    
    def __str__(self):
        return f"{self.get_action_display()} - {self.module} - {self.created_at}"