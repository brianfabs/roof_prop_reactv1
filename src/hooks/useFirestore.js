import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Hook for managing proposals
export function useProposals() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const proposalsRef = collection(db, 'proposals');
      const q = query(proposalsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const proposalsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setProposals(proposalsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching proposals:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createProposal = async (proposalData) => {
    try {
      const docRef = await addDoc(collection(db, 'proposals'), {
        ...proposalData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      await fetchProposals(); // Refresh the list
      return docRef.id;
    } catch (err) {
      console.error('Error creating proposal:', err);
      throw err;
    }
  };

  const updateProposal = async (id, updates) => {
    try {
      const proposalRef = doc(db, 'proposals', id);
      await updateDoc(proposalRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      await fetchProposals(); // Refresh the list
    } catch (err) {
      console.error('Error updating proposal:', err);
      throw err;
    }
  };

  const deleteProposal = async (id) => {
    try {
      await deleteDoc(doc(db, 'proposals', id));
      await fetchProposals(); // Refresh the list
    } catch (err) {
      console.error('Error deleting proposal:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  return {
    proposals,
    loading,
    error,
    createProposal,
    updateProposal,
    deleteProposal,
    refetch: fetchProposals
  };
}

// Hook for getting a single proposal
export function useProposal(id) {
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchProposal = async () => {
      try {
        setLoading(true);
        const proposalRef = doc(db, 'proposals', id);
        const proposalDoc = await getDoc(proposalRef);
        
        if (proposalDoc.exists()) {
          setProposal({
            id: proposalDoc.id,
            ...proposalDoc.data()
          });
        } else {
          setError('Proposal not found');
        }
      } catch (err) {
        console.error('Error fetching proposal:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [id]);

  return { proposal, loading, error };
}

// Hook for managing roofing options
export function useRoofingOptions() {
  const [options, setOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRoofingOptions = async () => {
    try {
      setLoading(true);
      const optionsRef = collection(db, 'roofing_options');
      const snapshot = await getDocs(optionsRef);
      
      const optionsData = {};
      snapshot.docs.forEach(doc => {
        optionsData[doc.id] = doc.data();
      });
      
      setOptions(optionsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching roofing options:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateRoofingOption = async (type, data) => {
    try {
      const optionRef = doc(db, 'roofing_options', type);
      await updateDoc(optionRef, data);
      await fetchRoofingOptions(); // Refresh the options
    } catch (err) {
      console.error('Error updating roofing option:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchRoofingOptions();
  }, []);

  return {
    options,
    loading,
    error,
    updateRoofingOption,
    refetch: fetchRoofingOptions
  };
}

// Hook for managing loan options
export function useLoanOptions() {
  const [loanOptions, setLoanOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLoanOptions = async () => {
    try {
      setLoading(true);
      const loanOptionsRef = collection(db, 'loan_options');
      const snapshot = await getDocs(loanOptionsRef);
      
      const loanOptionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by loan term
      loanOptionsData.sort((a, b) => a.years - b.years);
      
      setLoanOptions(loanOptionsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching loan options:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createLoanOption = async (loanData) => {
    try {
      await addDoc(collection(db, 'loan_options'), loanData);
      await fetchLoanOptions(); // Refresh the list
    } catch (err) {
      console.error('Error creating loan option:', err);
      throw err;
    }
  };

  const updateLoanOption = async (id, updates) => {
    try {
      const loanRef = doc(db, 'loan_options', id);
      await updateDoc(loanRef, updates);
      await fetchLoanOptions(); // Refresh the list
    } catch (err) {
      console.error('Error updating loan option:', err);
      throw err;
    }
  };

  const deleteLoanOption = async (id) => {
    try {
      await deleteDoc(doc(db, 'loan_options', id));
      await fetchLoanOptions(); // Refresh the list
    } catch (err) {
      console.error('Error deleting loan option:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchLoanOptions();
  }, []);

  return {
    loanOptions,
    loading,
    error,
    createLoanOption,
    updateLoanOption,
    deleteLoanOption,
    refetch: fetchLoanOptions
  };
} 