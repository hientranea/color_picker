import React from 'react';
import Header from './components/header';
import Hero from './components/hero';
import GradientBackground from './components/gradient_background';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <GradientBackground />
      <Header />
      <Hero />
    </div>
  );
}