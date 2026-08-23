import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, CircularProgress, Box,
  Button, Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Alert, Snackbar
} from '@mui/material';
import { Add, Edit, Delete, Refresh } from '@mui/icons-material';
import { employeeService } from '../services/api';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    id: '', nom: '', prenom: '', poste: '', departement: '',
    date_embauche: '', type_contrat: 'CDI',
    salaire: 0, charges: 0, primes: 0, transport: 0,
    telephone: 0, assurance: 0, avantages: 0, autres_recurrent: 0
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await employeeService.getAll();
      setEmployees(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des employés');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenDialog = (employee = null) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({ ...employee });
    } else {
      setEditingEmployee(null);
      setFormData({
        id: `emp_${Date.now()}`,
        nom: '', prenom: '', poste: '', departement: '',
        date_embauche: new Date().toISOString().split('T')[0],
        type_contrat: 'CDI',
        salaire: 0, charges: 0, primes: 0, transport: 0,
        telephone: 0, assurance: 0, avantages: 0, autres_recurrent: 0
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEmployee(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingEmployee) {
        await employeeService.update(editingEmployee.id, formData);
        setSnackbar({ open: true, message: 'Employé modifié avec succès !', severity: 'success' });
      } else {
        await employeeService.create(formData);
        setSnackbar({ open: true, message: 'Employé ajouté avec succès !', severity: 'success' });
      }
      handleCloseDialog();
      fetchEmployees();
    } catch (err) {
      setSnackbar({ open: true, message: 'Erreur lors de l\'opération', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      try {
        await employeeService.delete(id);
        setSnackbar({ open: true, message: 'Employé supprimé avec succès !', severity: 'success' });
        fetchEmployees();
      } catch (err) {
        setSnackbar({ open: true, message: 'Erreur lors de la suppression', severity: 'error' });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold" color="#2F6F5E">
          📋 Gestion des Employés
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchEmployees}
            sx={{ mr: 1 }}
          >
            Rafraîchir
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ bgcolor: '#2F6F5E', '&:hover': { bgcolor: '#1f4f42' } }}
          >
            Ajouter un employé
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#2F6F5E' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Prénom</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nom</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Poste</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Département</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Contrat</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Salaire</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((emp) => (
              <TableRow key={emp.id} hover>
                <TableCell>{emp.id}</TableCell>
                <TableCell>{emp.prenom}</TableCell>
                <TableCell>{emp.nom}</TableCell>
                <TableCell>{emp.poste}</TableCell>
                <TableCell>{emp.departement}</TableCell>
                <TableCell>
                  <Chip
                    label={emp.type_contrat}
                    size="small"
                    color={emp.type_contrat === 'CDI' ? 'success' : 'warning'}
                  />
                </TableCell>
                <TableCell>{Number(emp.salaire).toLocaleString()} FCFA</TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(emp)}
                    size="small"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(emp.id)}
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog d'ajout/modification */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingEmployee ? 'Modifier l\'employé' : 'Ajouter un employé'}
        </DialogTitle>
        <DialogContent>
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} sx={{ mt: 1 }}>
            <TextField
              label="Prénom"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Poste"
              name="poste"
              value={formData.poste}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Département"
              name="departement"
              value={formData.departement}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Date d'embauche"
              name="date_embauche"
              type="date"
              value={formData.date_embauche}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              select
              label="Type de contrat"
              name="type_contrat"
              value={formData.type_contrat}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="CDI">CDI</MenuItem>
              <MenuItem value="CDD">CDD</MenuItem>
              <MenuItem value="STAGE">Stage</MenuItem>
              <MenuItem value="CONSULTANT">Consultant</MenuItem>
            </TextField>
            <TextField
              label="Salaire (FCFA)"
              name="salaire"
              type="number"
              value={formData.salaire}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Charges (FCFA)"
              name="charges"
              type="number"
              value={formData.charges}
              onChange={handleChange}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{ bgcolor: '#2F6F5E', '&:hover': { bgcolor: '#1f4f42' } }}
          >
            {editingEmployee ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Employees;
