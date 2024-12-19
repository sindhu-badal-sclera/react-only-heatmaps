import React from 'react';
import "./header_button.css";
import ButtonLoader from '../components/buttonloader/Buttonloader'

const HeaderButton = ({ title, loading, onClick, name, icon, className, disabled, type }) => {
    return (
        <button
            className={`header-button ${disabled && "header-button-disabled"} ${className || ""}`}
            name={name || ""}
            onClick={onClick}
            disabled={disabled || loading}
            type={type}
        >
            {loading ? (
                <ButtonLoader />
            ) : (
                <>
                    <div translate="yes" className="header_button_content_wrapper">
                        {icon || null}
                        {title || "Button"}
                    </div>
                </>
            )}
        </button>
    );
};

export default HeaderButton;
