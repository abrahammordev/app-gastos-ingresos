/* eslint-disable no-unused-vars */
import { IBudget, IBudgetHistoric, ITransaction } from '@/types/index'; // Asegúrate de que estos tipos estén correctamente definidos en tu proyecto
import dayjs from 'dayjs';
import { createContext } from 'react';

interface HomeContextType {
  monthsSelected: [string, string];
  setMonthsSelected?: (value: [string, string]) => void;
  budget?: number;
  setBudget?: (value: number) => void;
  transactions: ITransaction[] | null;
  budgets: IBudget[] | null;
  budgetHistorics: IBudgetHistoric[] | null;
  loadingTransactions: boolean;
  loadingBudgets: boolean;
  loadingBudgetHistorics: boolean;
  startDayOfMonth?: number;
}

const defaultValue: HomeContextType = {
  monthsSelected: [dayjs().startOf('month').format('YYYY-MM-DD'), dayjs().endOf('month').format('YYYY-MM-DD')],
  setMonthsSelected: () => { },
  budget: 0,
  setBudget: () => { },
  transactions: null,
  budgets: null,
  budgetHistorics: null,
  loadingTransactions: true,
  loadingBudgets: true,
  loadingBudgetHistorics: true
};

export const HomeContext = createContext<HomeContextType>(defaultValue);
