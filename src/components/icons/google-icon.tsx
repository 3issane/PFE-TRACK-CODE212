import * as React from 'react'

// Google "G" logo (standard 18px version scaled to 24 viewBox). Fallback letter if SVG fails.
export const GoogleIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...props }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      <g transform="scale(1.3333)">
        <path fill="#4285F4" d="M17.64 9.2045c0-.6395-.0573-1.2523-.1636-1.8364H9v3.4727h4.8445c-.2095 1.1296-.8441 2.0873-1.7973 2.7291v2.266h2.9073c1.7027-1.5668 2.6855-3.8741 2.6855-6.6314Z"/>
        <path fill="#34A853" d="M9 18c2.43 0 4.4673-.8068 5.9564-2.2045l-2.9073-2.266c-.8068.54-1.8377.8614-3.0491.8614-2.3441 0-4.3295-1.5832-5.0364-3.7105H.9568v2.3327C2.4386 15.9832 5.4818 18 9 18Z"/>
        <path fill="#FBBC05" d="M3.9636 10.6805c-.18-.54-.2823-1.1168-.2823-1.7046 0-.5877.1023-1.1645.2823-1.7045V4.9386H.9568C.3477 6.1505 0 7.5305 0 9c0 1.4695.3477 2.8495.9568 4.0614l3.0068-2.3809Z"/>
        <path fill="#EA4335" d="M9 3.5796c1.3214 0 2.5077.4546 3.4396 1.3455l2.5796-2.5795C13.4632.8918 11.4268 0 9 0 5.4818 0 2.4386 2.0168.9568 4.9386l3.0068 2.3328C4.6705 5.1627 6.6559 3.5796 9 3.5796Z"/>
      </g>
      <title>Google</title>
    </svg>
  )
}

export default GoogleIcon
