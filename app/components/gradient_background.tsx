// app/components/GradientBackground.tsx
'use client';

import React, { useEffect, useRef } from 'react';

const GradientBackground: React.FC = () => {
  const gradientRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const colors = [
      [62, 35, 255],
      [60, 255, 60],
      [255, 35, 98],
      [45, 175, 230],
      [255, 0, 255],
      [255, 128, 0]
    ];

    let step = 0;
    let colorIndices = [0, 1, 2, 3];
    const gradientSpeed = 0.002;

    const updateGradient = () => {
      const c0_0 = colors[colorIndices[0]];
      const c0_1 = colors[colorIndices[1]];
      const c1_0 = colors[colorIndices[2]];
      const c1_1 = colors[colorIndices[3]];

      const istep = 1 - step;
      const r1 = Math.round(istep * c0_0[0] + step * c0_1[0]);
      const g1 = Math.round(istep * c0_0[1] + step * c0_1[1]);
      const b1 = Math.round(istep * c0_0[2] + step * c0_1[2]);
      const color1 = `rgb(${r1},${g1},${b1})`;

      const r2 = Math.round(istep * c1_0[0] + step * c1_1[0]);
      const g2 = Math.round(istep * c1_0[1] + step * c1_1[1]);
      const b2 = Math.round(istep * c1_0[2] + step * c1_1[2]);
      const color2 = `rgb(${r2},${g2},${b2})`;

      if (gradientRef.current) {
        gradientRef.current.style.background = `linear-gradient(to right, ${color1}, ${color2})`;
      }

      step += gradientSpeed;
      if (step >= 1) {
        step %= 1;
        colorIndices[0] = colorIndices[1];
        colorIndices[2] = colorIndices[3];

        colorIndices[1] = (colorIndices[1] + Math.floor(1 + Math.random() * (colors.length - 1))) % colors.length;
        colorIndices[3] = (colorIndices[3] + Math.floor(1 + Math.random() * (colors.length - 1))) % colors.length;
      }
    };

    const intervalId = setInterval(updateGradient, 10);

    return () => clearInterval(intervalId);
  }, []);

  return <div ref={gradientRef} className="fixed inset-0 z-[-1]" />;
};

export default GradientBackground;