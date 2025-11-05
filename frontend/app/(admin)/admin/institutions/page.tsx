'use client';

import { useState } from 'react';

// Mock data
const mockInstitutions = [
  { id: 1, name: 'Universidade Federal Alpha' },
  { id: 2, name: 'Instituto Beta' },
];

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState(mockInstitutions);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (institution = null) => {
    setSelectedInstitution(institution);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Gerenciamento de Instituições</h1>
      <button
        onClick={() => openModal()}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-4"
      >
        Nova Instituição
      </button>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">Nome</th>
            <th className="py-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {institutions.map((institution) => (
            <tr key={institution.id}>
              <td className="border px-4 py-2">{institution.name}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => openModal(institution)}
                  className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold">
              {selectedInstitution ? 'Editar' : 'Nova'} Instituição
            </h3>
            {/* Form here */}
            <button
              onClick={closeModal}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
