// This file contains the BUH logo as a base64 encoded string for embedding in the PowerPoint export.
// The SVG was converted to base64 to be used by the PptxGenJS library.

const svgString = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="128" height="128">
    <circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#003366" stroke-width="4" />
    <path d="M50 25 V75 M25 50 H75" stroke="#22C55E" stroke-width="12" stroke-linecap="round" />
    <path d="M50 25 V75 M25 50 H75" stroke="#16A34A" stroke-width="6" stroke-linecap="round" />
    <text font-family="Arial, sans-serif" font-size="30" fill="#003366" text-anchor="middle" font-weight="bold">
      <tspan x="50" y="22">B</tspan>
      <tspan x="50" y="86">H</tspan>
      <tspan x="26" y="58">U</tspan>
    </text>
  </svg>
`;

// In a browser environment, you can use btoa. 
// For simplicity, the pre-converted string is used here.
export const buhLogoBase64 = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCI+CiAgICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0OCIgZmlsbD0iI0ZGRkZGRiIgc3Ryb2tlPSIjMDAzMzY2IiBzdHJva2Utd2lkdGg9IjQiIC8+CiAgICA8cGF0aCBkPSJNNTAgMjUgVjc1IE0yNSA1MCBINzUiIHN0cm9rZT0iIzIyQzU1RSIgc3Ryb2tlLXdpZHRoPSIxMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiAvPgogICAgPHBhdGggZD0iTTUwIDI1IFY3NSBNMjUgNTAgSDc1IiBzdHJva2U9IiMxNkEzNEEiIHN0cm9rZS13aWR0aD0iNiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiAvPgogICAgPHRleHQgZm9udC1mYW1pbH0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzAiIGZpbGw9IiMwMDMzNjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtd2VpZ2h0PSJib2xkIj4KICAgICAgPHRzcGFuIHg9IjUwIiB5PSIyMiI+QjwvdHNwYW4+CiAgICAgIDx0c3BhbiB4PSI1MCIgeT0iODYiPkg8L3RzcGFuPgogICAgICA8dHNwYW4geD0iMjYiIHk9IjU4Ij5VPC90c3Bhbj4KICAgIDwvdGV4dD4KICA8L3N2Zz4=';
