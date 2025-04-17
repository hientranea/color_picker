"use client";

import React from "react";
import { FaQuoteLeft, FaStar } from "react-icons/fa";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
  stars: number;
}

const TestimonialCard = ({
  quote,
  name,
  role,
  company,
  stars,
}: Testimonial) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg relative">
      <FaQuoteLeft className="text-purple-200 text-4xl absolute top-4 left-4" />
      <div className="flex mb-4">
        {[...Array(stars)].map((_, i) => (
          <FaStar key={i} className="text-yellow-400" />
        ))}
      </div>
      <p className="text-gray-700 mb-6 relative z-10">{quote}</p>
      <div className="flex items-center">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
          {name.charAt(0)}
        </div>
        <div className="ml-4">
          <h4 className="font-bold">{name}</h4>
          <p className="text-sm text-gray-600">
            {role}, {company}
          </p>
        </div>
      </div>
    </div>
  );
};

export default function Testimonials() {
  const testimonials = [
    {
      quote:
        "As a graphic designer, this tool has been invaluable. The color name suggestions help me communicate better with clients, and the palette management system keeps all my projects organized.",
      name: "Sarah Johnson",
      role: "Senior Designer",
      company: "Creative Studio",
      stars: 5,
    },
    {
      quote:
        "The precision eyedropper tool is amazing. I can grab colors from anywhere on my screen with pixel-perfect accuracy. This has become an essential part of my workflow.",
      name: "David Chen",
      role: "UI/UX Designer",
      company: "TechVision",
      stars: 5,
    },
    {
      quote:
        "I love the cloud sync feature. I can start working on my Mac at the office and continue seamlessly at home. The AI palette suggestions have also saved me hours of work.",
      name: "Michael Rodriguez",
      role: "Freelance Illustrator",
      company: "Self-employed",
      stars: 4,
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4">
          What Our Users Say
        </h2>
        <p className="text-xl text-center text-gray-600 mb-12">
          Join thousands of designers who trust ColorOne for their color
          management needs
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              quote={testimonial.quote}
              name={testimonial.name}
              role={testimonial.role}
              company={testimonial.company}
              stars={testimonial.stars}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
