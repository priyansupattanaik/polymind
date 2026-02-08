import React from 'react';
import styled from 'styled-components';

const Switch = ({ isOn, handleToggle, id }) => {
  return (
    <StyledWrapper>
      <div className="toggle-switch">
        <input 
          className="toggle-input" 
          id={id} 
          type="checkbox" 
          checked={isOn} 
          onChange={handleToggle} 
        />
        <label className="toggle-label" htmlFor={id} />
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
    margin: 10px;
  }

  .toggle-input {
    display: none;
  }

  .toggle-label {
    position: absolute;
    top: 0;
    left: 0;
    width: 44px;
    height: 24px;
    background-color: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 34px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
  }

  .toggle-label::before {
    content: "";
    position: absolute;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    top: 2px;
    left: 2px;
    background: linear-gradient(180deg, #fff 0%, #e2e8f0 100%);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .toggle-input:checked + .toggle-label {
    background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
    border-color: rgba(99, 102, 241, 0.5);
  }

  .toggle-input:checked + .toggle-label::before {
    transform: translateX(20px);
    background: #fff;
  }
`;

export default Switch;
