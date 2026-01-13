"use client"

import { useEffect, useState } from "react"
import { 
  FaGitAlt, FaGithub, FaNpm, FaAndroid, FaApple, FaWifi, 
  FaCode, FaMicrosoft, FaJs, FaPython, FaHtml5, FaCss3Alt 
} from "react-icons/fa";
import { SiCplusplus } from "react-icons/si"; 

export default function FloatingBackground() {
  const [icons, setIcons] = useState<{
    id: number;
    iconIndex: number;
    top: number;
    left: number;
    size: number;
    duration: number;
    delay: number;
    opacity: number;
  }[]>([])

  useEffect(() => {
    // Grid Configuration
    const rows = 5;
    const cols = 6;
    const totalIcons = rows * cols; // 30 icons
    
    const newIcons = [];
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Calculate the base position for this grid cell
        const cellHeight = 100 / rows;
        const cellWidth = 100 / cols;
        
        const basePathTop = r * cellHeight;
        const basePathLeft = c * cellWidth;

        // Add random "jitter" within the cell (keep inside bounds)
        // We use 0.2 to 0.8 range to keep them away from the very edges of the cell
        const randomTop = basePathTop + (Math.random() * (cellHeight * 0.6)) + (cellHeight * 0.1);
        const randomLeft = basePathLeft + (Math.random() * (cellWidth * 0.6)) + (cellWidth * 0.1);

        newIcons.push({
          id: r * cols + c,
          iconIndex: Math.floor(Math.random() * TECH_ICONS.length),
          top: randomTop,
          left: randomLeft,
          size: Math.random() * 25 + 20, // 20px - 45px
          duration: Math.random() * 20 + 20, // 20s - 40s (Slower is classier)
          delay: Math.random() * -30, 
          opacity: Math.random() * 0.3 + 0.1, // 0.1 - 0.4
        });
      }
    }

    setIcons(newIcons)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-0">
      {icons.map((icon) => {
        const IconComponent = TECH_ICONS[icon.iconIndex]
        return (
          <div
            key={icon.id}
            className="absolute text-cyan-500 animate-float"
            style={{
              top: `${icon.top}%`,
              left: `${icon.left}%`,
              width: `${icon.size}px`,
              height: `${icon.size}px`,
              opacity: icon.opacity,
              animationDuration: `${icon.duration}s`,
              animationDelay: `${icon.delay}s`,
            }}
          >
            <IconComponent className="w-full h-full" />
          </div>
        )
      })}
      
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
        .animate-float {
          animation-name: float;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  )
}

const TECH_ICONS = [
  FaGitAlt, FaGithub, FaNpm, FaAndroid, FaApple, FaWifi, 
  FaCode, FaMicrosoft, FaJs, FaPython, SiCplusplus, FaHtml5, FaCss3Alt
];