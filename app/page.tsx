import React from 'react';
import Header from './components/header';
import Hero from './components/hero';
import Features from './components/features';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <Hero />
      <Features />
    </div>
  );
}
