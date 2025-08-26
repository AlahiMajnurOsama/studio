import type { SVGProps } from "react";

const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 200 50"
    width={120}
    height={30}
    {...props}
  >
    <defs>
      <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style={{ stopColor: "hsl(var(--primary))" }} />
        <stop offset="100%" style={{ stopColor: "hsl(var(--primary) / 0.5)" }} />
      </linearGradient>
    </defs>
    <text
      x="0"
      y="35"
      fontFamily="'Space Grotesk', sans-serif"
      fontSize="40"
      fontWeight="bold"
      fill="url(#logo-gradient)"
      letterSpacing="-1"
    >
      Poshra
    </text>
     <path 
      d="M 125, 15 a 5,5 0 0,1 0,20 a 5,5 0 0,1 0,-20"
      fill="hsl(var(--primary))"
    >
        <animateTransform 
            attributeName="transform" 
            type="rotate"
            from="0 125 25"
            to="360 125 25"
            dur="10s"
            repeatCount="indefinite"
        />
    </path>
  </svg>
);

export default Logo;
