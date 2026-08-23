import React, { useState, useEffect } from 'react';
import DashboardRH from './dashboard/DashboardRH';
import { employeeService, formationService, depenseService } from '../services/api';

const NewDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [formations, setFormations] = useState([]);
  const [depenses, setDepenses] = useState([]);
  const [categories, setCategories] = useState([
    "Matériel", "Mission", "Santé", "Événement", "Fourniture", "Autre"
  ]);

  // Chargement des données
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, formRes, depRes] = await Promise.all([
        employeeService.getAll(),
        formationService.getAll(),
        depenseService.getAll(),
      ]);
      setEmployees(empRes.data || []);
      setFormations(formRes.data || []);
      setDepenses(depRes.data || []);
    } catch (error) {
      console.error('Erreur de chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  // Gestionnaires CRUD
  const handleAddEmployee = async (employee) => {
    try {
      const response = await employeeService.create(employee);
      setEmployees([...employees, response.data]);
      fetchData();
    } catch (error) {
      console.error('Erreur ajout employé:', error);
    }
  };

  const handleUpdateEmployee = async (employee) => {
    try {
      await employeeService.update(employee.id, employee);
      fetchData();
    } catch (error) {
      console.error('Erreur mise à jour employé:', error);
    }
  };

  const handleDeleteEmployee = async (id) => {
    try {
      await employeeService.delete(id);
      fetchData();
    } catch (error) {
      console.error('Erreur suppression employé:', error);
    }
  };

  const handleAddFormation = async (formation) => {
    try {
      await formationService.create(formation);
      fetchData();
    } catch (error) {
      console.error('Erreur ajout formation:', error);
    }
  };

  const handleDeleteFormation = async (id) => {
    try {
      await formationService.delete(id);
      fetchData();
    } catch (error) {
      console.error('Erreur suppression formation:', error);
    }
  };

  const handleAddDepense = async (depense) => {
    try {
      await depenseService.create(depense);
      fetchData();
    } catch (error) {
      console.error('Erreur ajout dépense:', error);
    }
  };

  const handleDeleteDepense = async (id) => {
    try {
      await depenseService.delete(id);
      fetchData();
    } catch (error) {
      console.error('Erreur suppression dépense:', error);
    }
  };

  const handleUpdateCategories = (newCategories) => {
    setCategories(newCategories);
  };

  return (
    <DashboardRH
      employees={employees}
      formations={formations}
      depenses={depenses}
      categories={categories}
      loading={loading}
      onAddEmployee={handleAddEmployee}
      onUpdateEmployee={handleUpdateEmployee}
      onDeleteEmployee={handleDeleteEmployee}
      onAddFormation={handleAddFormation}
      onDeleteFormation={handleDeleteFormation}
      onAddDepense={handleAddDepense}
      onDeleteDepense={handleDeleteDepense}
      onUpdateCategories={handleUpdateCategories}
    />
  );
};

export default NewDashboard;
