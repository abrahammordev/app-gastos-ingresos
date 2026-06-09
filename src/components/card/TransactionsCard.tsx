import { HomeContext } from '@/contexts/HomeContext'
import { ReceiptLong } from '@mui/icons-material'
import { CircularProgress, useMediaQuery } from '@mui/material'
import { CSSProperties, useContext } from 'react'
import BasicCard from './BasicCard'
import EmptyState from '../EmptyState'

export default function TransactionsCard() {

  const isTablet = useMediaQuery('(max-width: 1024px)')

  const { loadingTransactions, transactions } = useContext(HomeContext)

  // STYLES
  const titleStyle = {
    margin: '10px 0'
  }

  const cardStyle = {
    width: '100%',
    height: isTablet ? '520px' : '450px'
  }

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    height: isTablet ? '400px' : '350px'
  }

  const circularProgressStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%'
  }

  return (
    <BasicCard style={cardStyle}>
      <h3 style={titleStyle}>Transacciones recientes</h3>
      <div style={containerStyle}>
        {loadingTransactions ? (
          <div style={circularProgressStyle}>
            <CircularProgress />
          </div>
        ) : transactions && transactions.length == 0 ? (
          <EmptyState
            icon={<ReceiptLong sx={{ fontSize: 28 }} />}
            title="Sin movimientos"
            description="Aún no hay transacciones en este periodo."
            compact
          />
        ) : (
          transactions &&
          transactions.slice(0, 5).map((transaction, index) => (
            <div key={transaction.id}>
              <Transaction key={transaction.id} transaction={{ ...transaction, date: new Date(transaction.date) }} />
              {index !== transactions.slice(0, 5).length - 1 && <hr />}
            </div>
          ))
        )}
      </div>
    </BasicCard>
  )
}

function Transaction({ transaction }: { transaction: { id: number; title: string; amount: number; date: Date } }) {
  //STYLES
  const containerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
    alignItems: 'center',
    minWidth: 0
  }

  const descriptionStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    flex: 1,
    minWidth: 0
  }

  const titleStyle = {
    fontSize: '15px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  }

  const dateStyle: CSSProperties = {
    fontSize: '14px'
  }

  const amountStyle: CSSProperties = {
    color: transaction.amount > 0 ? '#00C49F' : '#FF6384',
    fontWeight: 600,
    fontSize: '15px',
    flexShrink: 0,
    whiteSpace: 'nowrap'
  }

  return (
    <div style={containerStyle} key={transaction.id}>
      <div style={descriptionStyle}>
        <p style={titleStyle}>{transaction.title}</p>
        <span style={dateStyle}>{transaction.date.toLocaleDateString()}</span>
      </div>
      <p style={amountStyle}>{transaction.amount} €</p>
    </div>
  )
}
