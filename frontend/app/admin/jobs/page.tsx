"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function JobsPage() {
    const [jobs, setJobs] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [areaId, setAreaId] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [status, setStatus] = useState('');
    const [email, setEmail] = useState('');
    const [telephone, setTelephone] = useState('');
    const [editingJob, setEditingJob] = useState(null);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const url = editingJob ? `/api/jobs/edit/${editingJob.id}` : '/api/jobs/create';
        const method = editingJob ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, description, areaId, categoryId, status, email, telephone })
            });

            if (res.ok) {
                // Refresh jobs
            } else {
                console.error('Failed to save job');
            }
        } catch (error) {
            console.error('Failed to save job', error);
        }
    };

    const handleEdit = (job) => {
        setEditingJob(job);
        setTitle(job.title);
        setDescription(job.description);
        setAreaId(job.areaId);
        setCategoryId(job.categoryId);
        setStatus(job.status);
        setEmail(job.email);
        setTelephone(job.telephone);
    };

    const handleDelete = async (id) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/jobs/delete/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                // Refresh jobs
            } else {
                console.error('Failed to delete job');
            }
        } catch (error) {
            console.error('Failed to delete job', error);
        }
    };

    return (
        <div>
            <h1>Gerenciamento de Vagas</h1>
            <form onSubmit={handleSubmit}>
                {/* Add form fields for job details */}
                <button type="submit">{editingJob ? 'Atualizar Vaga' : 'Criar Vaga'}</button>
            </form>
            <table>
                <thead>
                    <tr>
                        <th>Título</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {jobs.map((job) => (
                        <tr key={job.id}>
                            <td>{job.title}</td>
                            <td>
                                <button onClick={() => handleEdit(job)}>Editar</button>
                                <button onClick={() => handleDelete(job.id)}>Excluir</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
