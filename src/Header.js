import React from 'react';
import styles from './Header.css';

export const Header = () => {
  return (
    <div style={{  display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px' }}>
    <div style={{ fontWeight: 'bold' }}>Stacked Choropleth Map for Covid Analysis with Health Factors</div>
      <div style={{ display: 'flex', gap: '8px' }}>
<div class = "buttons">
        <button className="button">Home</button>
        <button className="button">About</button>
      </div>
      </div>
    </div>
  );
};


