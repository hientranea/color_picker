import React from 'react';

export default function Features() {
  const features = [
    { title: 'Feature 1', description: 'Description of feature 1' },
    { title: 'Feature 2', description: 'Description of feature 2' },
    { title: 'Feature 3', description: 'Description of feature 3' },
  ];

  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
