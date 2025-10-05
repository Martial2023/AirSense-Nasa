import React, { useState } from 'react'
import {
    Credenza,
    CredenzaBody,
    CredenzaClose,
    CredenzaContent,
    CredenzaDescription,
    CredenzaFooter,
    CredenzaHeader,
    CredenzaTitle,
    CredenzaTrigger,
} from "@/components/Credenza"
import { Button } from './ui/button'
import { Input } from './ui/input';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';
import { subscribeToNotifications } from '@/app/actions';

type SubscribeFormProps = {
    children: React.ReactNode;
}
const SubscribeForm = ({ children }: SubscribeFormProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [isSubscribing, setIsSubscribing] = useState(false);

    const handleSubscribe = async () => {
        try {
            if (!email || !name || !location) {
                toast.error('Please fill in all fields.');
                return;
            }
            setIsSubscribing(true);
            await subscribeToNotifications({ email, name, location });
            toast.success('Subscription successful! You will receive notifications about Air Quality in your location.');
            setIsOpen(false);
        } catch (error) {
            toast.error('Subscription failed. Please try again.');
        }finally {
            setIsSubscribing(false);
        }
    }
    return (
        <Credenza open={isOpen} onOpenChange={setIsOpen}>
            <CredenzaTrigger asChild>
                {children}
            </CredenzaTrigger>
            <CredenzaContent>
                <CredenzaHeader>
                    <CredenzaTitle>Subscription</CredenzaTitle>
                    <CredenzaDescription>
                        Fill in the form below to subscribe to Air Quality notifications for your location.
                    </CredenzaDescription>
                </CredenzaHeader>
                <CredenzaBody>
                    <div className='space-y-4'>
                        <Input type="email" placeholder="Enter your email" className="w-full mb-4 rounded-full" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <Input type="text" placeholder="Enter your name" className="w-full mb-4 rounded-full" value={name} onChange={(e) => setName(e.target.value)} />
                        <Input type="text" placeholder="Enter your location" className="w-full mb-4 rounded-full" value={location} onChange={(e) => setLocation(e.target.value)} />
                        <Button className='w-full text-white rounded-full' onClick={handleSubscribe} disabled={isSubscribing || !email || !name || !location} >
                            {isSubscribing ? <Loader className='size-4 animate-spin' /> : 'Subscribe'}
                        </Button>
                    </div>
                </CredenzaBody>
            </CredenzaContent>
        </Credenza>
    )
}

export default SubscribeForm