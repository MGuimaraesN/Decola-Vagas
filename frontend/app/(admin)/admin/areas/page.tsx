'use client';

import { useState } from 'react';

// Mock data
const mockAreas = [
  { id: 1, name: 'Engenharia de Software' },
  { id: 2, name: 'Saúde' },
  { id: 3, name: 'Design' },
];

export default function AreasPage() {
  const [areas, setAreas] = useState(mockAreas);
  const [selectedArea, setSelectedArea] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (area = null) => {
    setSelectedArea(area);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Gerenciamento de Áreas</h1>
      <button
        onClick={() => openModal()}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-4"
      >
        Nova Área
      </button>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">Nome</th>
            <th className="py-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {areas.map((area) => (
            <tr key={area.id}>
              <td className="border px-4 py-2">{area.name}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => openModal(area)}
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
              {selectedArea ? 'Editar' : 'Nova'} Área
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
