"use client";

import React, { useEffect, useState } from 'react';

const PETAL_COUNT = 30; // Number of petals

const FallingPetals: React.FC = () => {
  const [petals, setPetals] = useState<Array<{ id: number; style: React.CSSProperties }>>([]);

  useEffect(() => {
    const generatePetals = () => {
      const newPetals = [];
      for (let i = 0; i < PETAL_COUNT; i++) {
        const delay = Math.random() * 10; // Stagger animation start
        const duration = 5 + Math.random() * 5; // Vary falling speed
        const sizeClass = ['petal-sm', 'petal-md', 'petal-lg'][Math.floor(Math.random() * 3)];
        newPetals.push({
          id: i,
          style: {
            left: `${Math.random() * 100}%`,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
          },
          className: `petal ${sizeClass}`
        });
      }
      setPetals(newPetals);
    };
    generatePetals();
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {petals.map(petal => (
        <div key={petal.id} className={(petal as any).className} style={petal.style} />
      ))}
    </div>
  );
};

export default FallingPetals;
