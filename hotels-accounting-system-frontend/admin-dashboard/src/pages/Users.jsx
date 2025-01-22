import React from 'react'

import Header from '../components/Header'
import { User } from 'lucide-react'
import UserManagement from '../components/Users/UserManagement'

function Users() {
    return (
        <div className='flex-1 overflow-auto relative z-10'>
            <Header title='Users' />
            <UserManagement />
        </div>
    )
}

export default Users