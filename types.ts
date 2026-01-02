
export enum RiskLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export interface ContractAnalysis {
  contractName: string;
  summary: string;
  risks: {
    clause: string;
    description: string;
    level: RiskLevel;
  }[];
  deadlines: {
    event: string;
    date: string;
  }[];
}

export interface Contract {
  id: string;
  name: string;
  type: string;
  counterparty: string;
  expirationDate: string;
  riskLevel: RiskLevel;
  status: 'Active' | 'Draft' | 'Expired';
}

export enum Page {
  DASHBOARD = 'dashboard',
  CONTRACTS = 'contracts',
  ANALYSIS = 'analysis',
  SETTINGS = 'settings'
}
