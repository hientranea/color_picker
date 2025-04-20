"use client";

import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

interface Faq {
  question: string;
  answer: string;
}

const FAQItem = ({ question, answer }: Faq) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        className="flex justify-between items-center w-full text-left font-medium text-lg focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{question}</span>
        {isOpen ? (
          <FaChevronUp className="text-purple-600" />
        ) : (
          <FaChevronDown className="text-gray-400" />
        )}
      </button>
      {isOpen && <div className="mt-2 text-gray-600">{answer}</div>}
    </div>
  );
};

export default function FAQ() {
  const faqs = [
    {
      question: "What platforms does ColorOne support?",
      answer:
        "ColorOne is primarily designed for macOS (10.15 and later). We're actively working on versions for Windows and Linux that will be released in the future. Our cloud synchronization feature will allow seamless work across all platforms once they're available.",
    },
    {
      question: "Is ColorOne really free to use?",
      answer:
        "Yes! ColorOne is completely free to download and use with all the basic color picking and management features. You can pick colors, save up to 5 palettes, and use basic color formats without paying anything. Premium features like AI-assisted palette generation and unlimited palettes require a subscription.",
    },
    {
      question: "How do I save and organize my color palettes?",
      answer:
        "ColorOne makes it easy to save colors to palettes. Simply pick a color and click the 'Add to Palette' button. You can create multiple palettes for different projects, rename them, and organize them. Free users can create up to 5 palettes, while Premium users get unlimited palettes and cloud synchronization.",
    },
    {
      question: "Can I extract colors from images?",
      answer:
        "Yes, with the Premium version you can import images and automatically extract the dominant colors to create a palette. You can also manually select specific areas of an image to capture exact colors.",
    },
    {
      question: "How does the AI-assisted palette generation work?",
      answer:
        "Our AI analyzes color theory principles and current design trends to suggest complementary colors based on your selections. It can generate complete palettes from a single color, suggest accent colors, or create variations of existing palettes. This feature is available exclusively in the Premium version.",
    },
    {
      question: "Can I check if my colors are accessible?",
      answer:
        "Absolutely! ColorOne includes an accessibility checker that evaluates color combinations against WCAG standards. It will show you the contrast ratio and let you know if your text will be readable against background colors. Basic accessibility checking is available in the free version, with advanced features in Premium.",
    },
    {
      question: "How do I upgrade to Premium?",
      answer:
        "You can upgrade to Premium directly within the app. Simply click on the 'Upgrade to Premium' button in the app and follow the instructions to complete your purchase. You'll immediately gain access to all Premium features after successful payment.",
    },
    {
      question: "Is my data secure in the cloud?",
      answer:
        "Yes, we take security seriously. All cloud data is encrypted both in transit and at rest. Your color palettes are private by default, though you can choose to share them publicly if desired. Cloud synchronization is a Premium feature.",
    },
  ];

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-4xl font-bold text-center mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-xl text-center text-gray-600 mb-12">
          Everything you need to know about ColorOne
        </p>

        <div className="bg-gray-50 rounded-lg p-8 shadow-md">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Still have questions? Contact us at{" "}
            <a
              href="mailto:support@colorone.app"
              className="text-purple-600 font-medium hover:underline"
            >
              support@colorone.app
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
