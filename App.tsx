
import React, { useState, useCallback } from 'react';
import { Page, Contract, RiskLevel } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ContractList from './components/ContractList';
import ContractAnalysisView from './components/ContractAnalysisView';

const calculateRisk = (dateString: string): RiskLevel => {
  const today = new Date('2026-01-02'); // Hardcoded 'current' date as per system time
  const expiration = new Date(dateString);
  const diffTime = expiration.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 30) return RiskLevel.HIGH;
  if (diffDays < 60) return RiskLevel.MEDIUM;
  return RiskLevel.LOW;
};

// Initial data with static risks - will be recalculated on load
import { supabase } from './services/supabase';
import { uploadContract, getContracts } from './services/contractService';
import Auth from './components/Auth';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.DASHBOARD);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch contracts when session exists
  const fetchContracts = useCallback(async () => {
    if (!session) return;
    try {
      const data = await getContracts();
      setContracts(data);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    }
  }, [session]);

  React.useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const handleFileUpload = async (file: File) => {
    if (!session) return;
    try {
      const newContract = await uploadContract(file, session.user.id);
      setContracts(prev => [newContract, ...prev]);
      alert(`Successfully uploaded: ${file.name}`);
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert(`Upload failed: ${error.message}`);
    }
  };

  const handleNotifications = () => {
    alert("You have 3 unread notifications:\n- Contract expiring in 9 days\n- New comment on NDA\n- System update available");
  };

  const handleReviewAnomalies = () => {
    alert("Review Anomalies feature is under development.\nThis will simulate an AI scan of the contracts.");
  };

  const renderContent = () => {
    switch (currentPage) {
      case Page.DASHBOARD:
        return (
          <Dashboard
            contracts={contracts}
            onAnalyzeClick={() => setCurrentPage(Page.ANALYSIS)}
            onReviewAnomalies={handleReviewAnomalies}
          />
        );
      case Page.CONTRACTS:
        return <ContractList contracts={contracts} />;
      case Page.ANALYSIS:
        return <ContractAnalysisView />;
      case Page.SETTINGS:
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
              <p className="text-slate-500 mb-4">You are logged in as <strong>{session?.user.email}</strong></p>
              <button
                onClick={() => supabase.auth.signOut()}
                className="px-4 py-2 bg-rose-50 text-rose-600 font-bold rounded-lg hover:bg-rose-100 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        );
      default:
        return (
          <Dashboard
            contracts={contracts}
            onAnalyzeClick={() => setCurrentPage(Page.ANALYSIS)}
            onReviewAnomalies={handleReviewAnomalies}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background-dark">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isOpen={isSidebarOpen}
        onToggle={() => setSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen(!isSidebarOpen)}
          onFileSelect={handleFileUpload}
          onNotifications={handleNotifications}
        />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
