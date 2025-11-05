'use client';

import { useState } from 'react';

// Mock data
const mockCategories = [
  { id: 1, name: 'Estágio' },
  { id: 2, name: 'Iniciação Científica' },
  { id: 3, name: 'Vaga Júnior' },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState(mockCategories);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (category = null) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Gerenciamento de Categorias</h1>
      <button
        onClick={() => openModal()}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-4"
      >
        Nova Categoria
      </button>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">Nome</th>
            <th className="py-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td className="border px-4 py-2">{category.name}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => openModal(category)}
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
              {selectedCategory ? 'Editar' : 'Nova'} Categoria
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
