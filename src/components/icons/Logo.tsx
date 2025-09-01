import type { SVGProps } from "react";

const Logo = ({ brandName, ...props }: SVGProps<SVGSVGElement> & { brandName: string }) => (
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
      {brandName}
    </text>
  </svg>
);

export default Logo;
