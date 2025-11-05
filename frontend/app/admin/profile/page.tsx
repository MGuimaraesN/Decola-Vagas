"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                const res = await fetch('/api/auth/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                } else {
                    router.push('/login');
                }
            } catch (error) {
                console.error('Failed to fetch profile', error);
                router.push('/login');
            }
        };

        fetchProfile();
    }, [router]);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ oldPassword, newPassword })
            });

            if (res.ok) {
                // Show success message
            } else {
                console.error('Failed to change password');
            }
        } catch (error) {
            console.error('Failed to change password', error);
        }
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Perfil</h1>
            <p>Nome: {user.firstName} {user.lastName}</p>
            <p>Email: {user.email}</p>
            <h2>Alterar Senha</h2>
            <form onSubmit={handleChangePassword}>
                <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Senha Antiga" />
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nova Senha" />
                <button type="submit">Alterar Senha</button>
            </form>
        </div>
    );
}
