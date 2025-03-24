
import React, { createContext, useContext, useState, useEffect } from 'react';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

interface AccidentReport {
  id: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  timestamp: Date;
  severity: 'minor' | 'moderate' | 'severe';
  description?: string;
  images?: string[];
  status: 'pending' | 'processing' | 'responded' | 'completed';
}

interface EmergencyResponse {
  id: string;
  reportId: string;
  responderType: 'ambulance' | 'police' | 'fire';
  status: 'dispatched' | 'enroute' | 'arrived' | 'completed';
  eta?: number; // in minutes
  responderInfo?: {
    id: string;
    name: string;
    contact: string;
  };
}

interface EmergencyContextProps {
  contacts: EmergencyContact[];
  reports: AccidentReport[];
  responses: EmergencyResponse[];
  addContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  removeContact: (id: string) => void;
  createReport: (report: Omit<AccidentReport, 'id' | 'status' | 'timestamp'>) => Promise<string>;
  getReportById: (id: string) => AccidentReport | undefined;
  getResponsesForReport: (reportId: string) => EmergencyResponse[];
}

const EmergencyContext = createContext<EmergencyContextProps | undefined>(undefined);

export const EmergencyProvider = ({ children }: { children: React.ReactNode }) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [reports, setReports] = useState<AccidentReport[]>([]);
  const [responses, setResponses] = useState<EmergencyResponse[]>([]);
  
  // Load saved data from localStorage
  useEffect(() => {
    try {
      const storedContacts = localStorage.getItem('emergencyContacts');
      if (storedContacts) {
        setContacts(JSON.parse(storedContacts));
      } else {
        // Default contacts for demo
        setContacts([
          {
            id: '1',
            name: 'Jane Smith',
            phone: '+1 (555) 987-6543',
            relationship: 'Spouse'
          },
          {
            id: '2',
            name: 'Robert Johnson',
            phone: '+1 (555) 456-7890',
            relationship: 'Family Doctor'
          }
        ]);
      }
      
      const storedReports = localStorage.getItem('accidentReports');
      if (storedReports) {
        const parsedReports = JSON.parse(storedReports);
        // Convert string dates back to Date objects
        setReports(parsedReports.map((report: any) => ({
          ...report,
          timestamp: new Date(report.timestamp)
        })));
      }
      
      const storedResponses = localStorage.getItem('emergencyResponses');
      if (storedResponses) {
        setResponses(JSON.parse(storedResponses));
      }
    } catch (error) {
      console.error('Error loading emergency data:', error);
    }
  }, []);
  
  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('emergencyContacts', JSON.stringify(contacts));
  }, [contacts]);
  
  useEffect(() => {
    localStorage.setItem('accidentReports', JSON.stringify(reports));
  }, [reports]);
  
  useEffect(() => {
    localStorage.setItem('emergencyResponses', JSON.stringify(responses));
  }, [responses]);
  
  const addContact = (contact: Omit<EmergencyContact, 'id'>) => {
    const newContact = {
      ...contact,
      id: Date.now().toString()
    };
    
    setContacts(prev => [...prev, newContact]);
  };
  
  const removeContact = (id: string) => {
    setContacts(prev => prev.filter(contact => contact.id !== id));
  };
  
  const createReport = async (reportData: Omit<AccidentReport, 'id' | 'status' | 'timestamp'>) => {
    // Simulate API call and processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newReport: AccidentReport = {
      ...reportData,
      id: Date.now().toString(),
      status: 'pending',
      timestamp: new Date()
    };
    
    setReports(prev => [...prev, newReport]);
    
    // Simulate automatic emergency response
    setTimeout(() => {
      const newResponse: EmergencyResponse = {
        id: `response-${Date.now()}`,
        reportId: newReport.id,
        responderType: 'ambulance',
        status: 'dispatched',
        eta: Math.floor(Math.random() * 10) + 5,
        responderInfo: {
          id: 'amb-123',
          name: 'City Ambulance Service',
          contact: '+1 (555) 123-0000'
        }
      };
      
      setResponses(prev => [...prev, newResponse]);
      
      // Update report status
      setReports(prev => 
        prev.map(report => 
          report.id === newReport.id 
            ? { ...report, status: 'processing' } 
            : report
        )
      );
    }, 3000);
    
    return newReport.id;
  };
  
  const getReportById = (id: string) => {
    return reports.find(report => report.id === id);
  };
  
  const getResponsesForReport = (reportId: string) => {
    return responses.filter(response => response.reportId === reportId);
  };
  
  return (
    <EmergencyContext.Provider
      value={{
        contacts,
        reports,
        responses,
        addContact,
        removeContact,
        createReport,
        getReportById,
        getResponsesForReport
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => {
  const context = useContext(EmergencyContext);
  
  if (context === undefined) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  
  return context;
};
