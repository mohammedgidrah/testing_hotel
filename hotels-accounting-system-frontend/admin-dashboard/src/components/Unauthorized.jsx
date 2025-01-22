import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
function Unauthorized() {
    const navigate = useNavigate();

    useEffect(() => {
        navigate('/', { replace: true, state: {} })
    }, [])
    return;
}

export default Unauthorized