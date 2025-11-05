"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MuralPage() {
    const [jobs, setJobs] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const fetchJobs = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                const res = await fetch('/api/jobs/my-institution', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    setJobs(data);
                } else {
                    console.error('Failed to fetch jobs');
                }
            } catch (error) {
                console.error('Failed to fetch jobs', error);
            }
        };

        fetchJobs();
    }, [router]);

    return (
        <div>
            <h1>Mural de Vagas</h1>
            <ul>
                {jobs.map((job) => (
                    <li key={job.id}>{job.title}</li>
                ))}
            </ul>
        </div>
    );
}
