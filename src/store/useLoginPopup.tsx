import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
// import {use} from 'nextjs-toploader/app'
const useLoginPopup = () => {
    const [openLoginPopup, setOpenLoginPopup] = useState(false)
    const {data: session} = useSession();
    const router = useRouter()
    const handleLoginPopup = () => {
        if(session?.user){
            router.push('/my-account')
        }else{
            setOpenLoginPopup((toggleOpen) => !toggleOpen)
        }
    }

    // Check if the click event occurs outside the popup.
    const handleClickOutsideLoginPopup = useCallback((event: Event) => {
        // Cast event.target to Element to use the closest method.
        const targetElement = event.target as Element;

        if (openLoginPopup && !targetElement.closest('.login-popup')) {
            setOpenLoginPopup(false)
        }
    }, [openLoginPopup])

    useEffect(() => {
        // Add a global click event to track clicks outside the popup.
        document.addEventListener('click', handleClickOutsideLoginPopup);

        // Cleanup to avoid memory leaks.
        return () => {
            document.removeEventListener('click', handleClickOutsideLoginPopup);
        };
    }, [handleClickOutsideLoginPopup, openLoginPopup])

    return {
        openLoginPopup,
        handleLoginPopup,
    }
}

export default useLoginPopup