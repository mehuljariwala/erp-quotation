import { useState } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { QuotationForm } from './components/quotation/QuotationForm';
import { QuotationList } from './components/quotation/QuotationList';
import { AuthGuard } from './components/auth';
import { CompanyModule } from './components/company';
import { AccountModule } from './components/account';
import { ProductModule } from './components/product';
import { Dashboard } from './components/dashboard';

const PlaceholderModule = ({ name }) => (
  <div className="flex items-center justify-center h-full min-h-[400px]">
    <div className="text-center">
      <div className="w-20 h-20 mx-auto mb-4 rounded-lg bg-[#e0e8f0] border border-[#b0c4d8] flex items-center justify-center">
        <span className="text-3xl opacity-50">🚧</span>
      </div>
      <h2 className="text-xl font-semibold text-text-primary mb-2">{name}</h2>
      <p className="text-text-muted text-sm">This module is under development</p>
      <p className="text-xs text-text-muted mt-1">
        Only the Quotation module is functional in this POC
      </p>
    </div>
  </div>
);

const QuotationModule = ({ view, onViewChange }) => {
  if (view === 'form') {
    return <QuotationForm onBackToList={() => onViewChange('list')} />;
  }

  return (
    <QuotationList
      onNewQuotation={() => onViewChange('form')}
      onEditQuotation={() => onViewChange('form')}
    />
  );
};

function App() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [quotationView, setQuotationView] = useState('form');

  const handleModuleChange = (module) => {
    setActiveModule(module);
    if (module === 'quotation') {
      setQuotationView('form');
    }
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard onNavigate={handleModuleChange} />;
      case 'quotation':
        return (
          <QuotationModule
            view={quotationView}
            onViewChange={setQuotationView}
          />
        );
      case 'final-quotation':
        return <PlaceholderModule name="Final Quotation" />;
      case 'company':
        return <CompanyModule />;
      case 'account':
        return <AccountModule />;
      case 'salesman':
        return <PlaceholderModule name="Salesman Master" />;
      case 'product':
        return <ProductModule />;
      case 'user':
        return <PlaceholderModule name="User Management" />;
      case 'backup':
        return <PlaceholderModule name="Backup & Restore" />;
      case 'setting':
        return <PlaceholderModule name="Settings" />;
      default:
        return <Dashboard onNavigate={handleModuleChange} />;
    }
  };

  return (
    <AuthGuard>
      <MainLayout
        activeModule={activeModule}
        onModuleChange={handleModuleChange}
      >
        {renderModule()}
      </MainLayout>
    </AuthGuard>
  );
}

export default App;
