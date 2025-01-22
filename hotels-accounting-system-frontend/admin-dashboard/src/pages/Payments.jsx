import React from 'react'

import Header from '../components/Header'
import PaymentsTable from '../components/Payments/PaymentsTable'

function Payments() {
  return (
    <div className='flex-1 overflow-auto relative z-10'>
      <Header title='Payments' />

      <PaymentsTable />
    </div>
  )
}

export default Payments