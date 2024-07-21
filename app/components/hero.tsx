import React from 'react';

export default function Hero() {
  return (
    <section className="bg-blue-600 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-4">Welcome to Your Product</h2>
        <p className="text-xl mb-8">A brief description of your product and its main benefit.</p>
        <button className="bg-white text-blue-600 px-6 py-3 rounded-full font-bold hover:bg-blue-100 transition duration-300">
          Get Started
        </button>
      </div>
    </section>
  );
}
